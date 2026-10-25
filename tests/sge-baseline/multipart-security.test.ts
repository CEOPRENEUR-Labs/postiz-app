import { createRequire } from 'node:module';
import { Readable } from 'node:stream';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const from = (name: string) => createRequire(require.resolve(`${name}/package.json`));
const jestRequire = from('jest-environment-jsdom');
const consumers = [
  ['provider', createRequire(require.resolve('../../libraries/nestjs-libraries/src/integrations/social/reddit.provider.ts'))],
  ['request', from('request')],
  ['types-request', from('@types/request')],
  ['transloadit', from('transloadit')],
  ['jsdom', from('jsdom')],
  ['jest-jsdom', createRequire(jestRequire.resolve('jsdom/package.json'))],
  ['axios', from('axios')],
] as const;
type Multipart = InstanceType<typeof import('form-data')>;
const bytes = Buffer.from([0, 255, 10, 13, 34, 128]);

function collect(form: Multipart): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    form.on('data', (chunk: Buffer | string) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    form.once('end', () => resolve(Buffer.concat(chunks)));
    form.once('error', reject);
    form.resume();
  });
}

// Native multipart parsing is independent of the installed form-data builders;
// constructing/parsing a Response makes no network request.
async function parse(form: Multipart, body = form.getBuffer()) {
  return new Response(new Uint8Array(body).buffer, { headers: form.getHeaders() }).formData();
}

describe.each(consumers)('multipart boundary resolved by %s', (_name, consumer) => {
  const Form = consumer('form-data') as typeof import('form-data');

  it('does not turn a field name into an additional parsed part', async () => {
    const form = new Form();
    form.setBoundary('SGE_SYNTHETIC_BOUNDARY');
    const name = 'text"\r\n\r\nfirst\r\n--SGE_SYNTHETIC_BOUNDARY\r\nContent-Disposition: form-data; name="SGE_INJECTED';
    form.append(name, 'second');
    const parsed = await parse(form);
    expect(Array.from(parsed.keys())).toHaveLength(1);
    expect(parsed.has('SGE_INJECTED')).toBe(false);
    expect(Array.from(parsed.values())).toEqual(['second']);
  });

  it.each([['\r', '%0D'], ['\n', '%0A'], ['"', '%22']])('encodes field-name character %j', (character, encoded) => {
    const form = new Form();
    form.append(`bad${character}name`, 'value');
    expect(form.getBuffer().toString()).toContain(`name="bad${encoded}name"`);
  });

  it.each(['filename', 'shorthand', 'filepath', 'stream-name', 'stream-path', 'response-path'])('prevents filename header injection through %s', async (source) => {
    const form = new Form();
    const filename = 'image"\r\nX-SGE-Injected: yes\r\n".png';
    if (source === 'shorthand') form.append('file', bytes, filename);
    else if (source === 'filename') form.append('file', bytes, { filename });
    else if (source === 'filepath') form.append('file', bytes, { filepath: `folder/${filename}` });
    else {
      const stream = Readable.from([bytes]);
      if (source === 'stream-name') Object.assign(stream, { name: filename });
      else if (source === 'stream-path') Object.assign(stream, { path: `folder/${filename}` });
      else Object.assign(stream, {
        httpVersion: '1.1', headers: { 'content-type': 'image/png' },
        client: { _httpMessage: { path: `/folder/${filename}` } },
      });
      form.append('file', stream, { knownLength: bytes.length });
    }
    const body = (await collect(form)).toString();
    expect(body).not.toContain('\r\nX-SGE-Injected: yes');
    expect(body).toContain('filename="');
    expect(body).toContain('image%22%0D%0AX-SGE-Injected: yes%0D%0A%22.png');
  });

  it('preserves Unicode, bracket/dotted names and body CRLF/quotes', async () => {
    const form = new Form();
    for (const name of ['SGE ü', 'files[0]', 'post.text']) form.append(name, 'SGE ✓\r\n"body"');
    const parsed = await parse(form);
    for (const name of ['SGE ü', 'files[0]', 'post.text']) expect(parsed.get(name)).toBe('SGE ✓\r\n"body"');
  });

  it('preserves binary bytes and exact length after escaped header serialization', async () => {
    const form = new Form();
    form.append('file', bytes, { filename: 'quoted".bin', contentType: 'application/octet-stream', knownLength: bytes.length });
    const body = form.getBuffer();
    expect(form.getLengthSync()).toBe(body.length);
    expect(body.toString()).toContain('filename="quoted%22.bin"');
    const part = (await parse(form, body)).get('file');
    if (!part || typeof part === 'string') throw new Error('Expected a parsed file');
    expect(Buffer.from(await part.arrayBuffer())).toEqual(bytes);
    expect(part.type).toBe('application/octet-stream');
    expect(part.name).toBe('quoted".bin');
  });

  it('preserves filename basenames and explicit relative filepaths', () => {
    const form = new Form();
    form.append('base', bytes, 'folder/nested.png');
    form.append('relative', bytes, { filepath: 'folder/relative.png' });
    const body = form.getBuffer().toString();
    expect(body).toContain('filename="nested.png"');
    expect(body).not.toContain('filename="folder/nested.png"');
    expect(body).toContain('filename="folder/relative.png"');
    expect(body).toContain('Content-Type: image/png');
  });

  it('preserves streamed subtitle bytes, known length and inferred MIME', async () => {
    const form = new Form();
    const subtitle = Buffer.from('1\r\n00:00:00,000 --> 00:00:01,000\r\nSGE ✓');
    form.append('subtitles.srt', Readable.from([subtitle]), { filename: 'subtitles.srt', knownLength: subtitle.length });
    const length = form.getLengthSync();
    const body = await collect(form);
    expect(body.length).toBe(length);
    expect(body.toString()).toContain('Content-Type: application/x-subrip');
    const part = (await parse(form, body)).get('subtitles.srt');
    if (!part || typeof part === 'string') throw new Error('Expected a streamed file');
    expect(Buffer.from(await part.arrayBuffer())).toEqual(subtitle);
    expect(part.name).toBe('subtitles.srt');
  });

  it('preserves explicit trusted custom headers', () => {
    const form = new Form();
    form.append('text', 'SGE', { header: { 'X-SGE-Control': 'kept' } });
    expect(form.getBuffer().toString()).toContain('\r\nX-SGE-Control: kept\r\n');
  });
});
