import { createRequire } from 'node:module';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { execFileSync } from 'node:child_process';
import { afterEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
// Resolve through the real consumers, including the installer crossing Tar's major version.
const installerRequire = createRequire(require.resolve('@mapbox/node-pre-gyp/package.json'));
const requestRequire = createRequire(require.resolve('request/package.json'));
const tar = installerRequire('tar') as typeof import('tar');
const FormData = requestRequire('form-data') as typeof import('form-data');
const handlebars = require('handlebars') as typeof import('handlebars');
const protobuf = require('protobufjs') as typeof import('protobufjs');
const quote = (require('shell-quote') as {
  quote(tokens: Array<string | { op: string } | { comment: string }>): string;
}).quote;
const proxy = require('proxy-addr') as {
  compile(subnets: string[]): (address: string) => boolean;
};

const directories: string[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(directories.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('patched dependency security boundaries', () => {
  it.each(['\n', '\r', '\u2028', '\u2029'])('rejects an operator containing %j', (line) => {
    expect(() => quote([{ op: `;${line}SGE_MARKER` }])).toThrow(TypeError);
  });

  it.each(['\n', '\r', '\u2028', '\u2029'])('rejects %j after a comment token', (line) => {
    expect(() => quote(['echo', { comment: 'comment' }, `value${line}SGE_MARKER`])).toThrow(TypeError);
  });

  it('preserves quoting ordinary CLI arguments', () => {
    expect(quote(['echo', 'SGE draft', '✓'])).toBe("echo 'SGE draft' ✓");
  });

  it.each(['::ffff:10.0.0.0/8', '::/1'])('does not trust public IPv4 through %s', (subnet) => {
    const trust = proxy.compile([subnet]);
    expect(trust('198.51.100.23')).toBe(false);
    expect(trust('::ffff:198.51.100.23')).toBe(false);
  });

  it.each(['10.0.0.0/8', '::ffff:10.0.0.0/104'])('preserves legitimate trusted proxies for %s', (subnet) => {
    const trust = proxy.compile([subnet]);
    expect(trust('10.2.3.4')).toBe(true);
    expect(trust('::ffff:10.2.3.4')).toBe(true);
    expect(trust('198.51.100.23')).toBe(false);
  });

  it.each(['compile', 'precompile'] as const)('rejects malformed AST block parameters in %s', (method) => {
    const ast = handlebars.parse('{{#if ok}}draft{{/if}}');
    // Deliberately model a JSON descriptor violating the upstream AST type contract.
    const block = ast.body[0] as unknown as { program: { blockParams: unknown } };
    block.program.blockParams = { length: '(99 + 1)' };
    expect(() => {
      if (method === 'compile') handlebars.compile(ast)({ ok: true });
      else handlebars.precompile(ast);
    }).toThrow(/Invalid AST/);
  });

  it('preserves normal templates and parsed ASTs', () => {
    expect(handlebars.compile('Hallo {{name}}')({ name: '<SGE>' })).toBe('Hallo &lt;SGE&gt;');
    expect(handlebars.compile(handlebars.parse('{{#if ok}}draft{{/if}}'))({ ok: true })).toBe('draft');
  });

  it('does not use Math.random to construct legacy multipart boundaries', () => {
    vi.spyOn(Math, 'random').mockImplementation(() => { throw new Error('insecure boundary source'); });
    const form = new FormData();
    expect(form.getBoundary()).toMatch(/^[-\da-f]+$/i);
  });

  it('preserves local multipart serialization without sending a request', () => {
    const form = new FormData();
    form.append('text', 'SGE ✓');
    const body = form.getBuffer().toString('utf8');
    expect(body).toContain('name="text"');
    expect(body).toContain('SGE ✓');
    expect(body).toContain(`--${form.getBoundary()}--`);
  });

  it('keeps schema-controlled punctuation out of generated function names', () => {
    const type = new protobuf.Type('Draft";invalid');
    type.add(new protobuf.Field('text', 1, 'string'));
    expect(() => type.create({ text: 'SGE ✓' })).not.toThrow();
    const decoded = type.toObject(type.decode(type.encode({ text: 'SGE ✓' }).finish()));
    expect(decoded['text']).toBe('SGE ✓');
  });

  it('preserves the shipped Temporal protobuf schema', () => {
    const temporal = require('@temporalio/proto') as {
      temporal: { api: { common: { v1: { Payload: {
        encode(value: { data: Uint8Array }): { finish(): Uint8Array };
        decode(value: Uint8Array): { data: Uint8Array };
      } } } } };
    };
    const payload = temporal.temporal.api.common.v1.Payload;
    const text = Buffer.from('SGE ✓', 'utf8');
    expect(Buffer.from(payload.decode(payload.encode({ data: text }).finish()).data)).toEqual(text);
  });

  it('ignores prototype-inherited Piscina worker options while running a normal task', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'sge-pool-'));
    directories.push(dir);
    const task = join(dir, 'task.cjs');
    await writeFile(task, "module.exports = () => process.execArgv.includes('--no-warnings');");
    // Isolate prototype mutation from Vitest; the injected flag is harmless.
    const script = `
      const Piscina = require(${JSON.stringify(require.resolve('piscina'))});
      Object.defineProperty(Object.prototype, 'execArgv', {
        configurable: true, writable: true, value: ['--no-warnings']
      });
      const pool = new Piscina({ filename: ${JSON.stringify(task)}, minThreads: 1, maxThreads: 1 });
      pool.run(null).then(async value => {
        console.log(JSON.stringify(value));
        await pool.destroy();
      }).catch(error => { console.error(error); process.exitCode = 1; });
    `;
    expect(execFileSync(process.execPath, ['-e', script], {
      encoding: 'utf8', timeout: 5000,
    }).trim()).toBe('false');
  });
});

describe('native installer Tar compatibility', () => {
  async function fixture() {
    const dir = await mkdtemp(join(tmpdir(), 'sge-tar-'));
    directories.push(dir);
    await mkdir(join(dir, 'bundle'));
    await writeFile(join(dir, 'bundle', 'payload.txt'), 'SGE ✓');
    return dir;
  }

  it('completes the installer packaging callback and streamed extraction', async () => {
    const dir = await fixture();
    const archive = join(dir, 'fixture.tar.gz');
    await new Promise<void>((resolve, reject) => {
      tar.create({ cwd: dir, gzip: true, file: archive, portable: false }, ['bundle/payload.txt'],
        (error) => error ? reject(error) : resolve());
    });
    const destination = join(dir, 'unpacked');
    await mkdir(destination);
    const entries: string[] = [];
    await pipeline(createReadStream(archive), tar.extract({
      cwd: destination, strip: 1, onentry: (entry) => { entries.push(entry.path); },
    }));
    expect(entries).toHaveLength(1);
    expect(await readFile(join(destination, 'payload.txt'), 'utf8')).toBe('SGE ✓');
  });

  it('preserves the installer promise extraction API', async () => {
    const dir = await fixture();
    const archive = join(dir, 'fixture.tar.gz');
    await tar.create({ cwd: dir, gzip: true, file: archive }, ['bundle/payload.txt']);
    const destination = join(dir, 'unpacked');
    await mkdir(destination);
    await tar.extract({ cwd: destination, strip: 1, file: archive });
    expect(await readFile(join(destination, 'payload.txt'), 'utf8')).toBe('SGE ✓');
  });

  it('aborts a bounded high-ratio archive with the default decompression guard', async () => {
    const dir = await fixture();
    // A bounded 8-MiB fixture exercises the default guard without extracting to disk.
    await writeFile(join(dir, 'bundle', 'zeros.bin'), Buffer.alloc(8 * 1024 * 1024));
    const archive = join(dir, 'compressed.tar.gz');
    await tar.create({ cwd: dir, gzip: true, file: archive }, ['bundle/zeros.bin']);
    await expect(tar.list({ file: archive })).rejects.toThrow(/max decompression ratio exceeded/);
  });
});
