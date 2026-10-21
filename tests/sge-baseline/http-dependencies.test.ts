import http, { ClientRequest, IncomingHttpHeaders, IncomingMessage, RequestOptions } from 'node:http';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { Readable } from 'node:stream';
import { afterEach, describe, expect, it } from 'vitest';
import axios from 'axios';

const require = createRequire(import.meta.url);
// Test the redirect library actually resolved by Axios, not a separate test dependency.
const follow = createRequire(require.resolve('axios/package.json'))('follow-redirects') as {
  http: {
    get(url: string, options: RequestOptions & { sensitiveHeaders?: string[] },
      callback: (response: IncomingMessage) => void): ClientRequest;
  };
};
const Multipart = require('form-data') as typeof import('form-data');
const servers: http.Server[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => {
    server.closeAllConnections();
    return new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }));
});

async function listen(handler: http.RequestListener) {
  const server = http.createServer(handler);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  servers.push(server);
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected a TCP listener');
  return `http://127.0.0.1:${address.port}`;
}

async function redirects() {
  let hits = 0;
  const target = await listen((request, response) => {
    hits++;
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify(request.headers));
  });
  const source = await listen((request, response) => {
    if (request.url === '/echo') {
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify(request.headers));
    } else {
      response.writeHead(302, { Location: request.url === '/same' ? '/echo' : target });
      response.end();
    }
  });
  return { source, hits: () => hits };
}

function redirectedHeaders(url: string, headers: RequestOptions['headers'], sensitiveHeaders: string[] = []) {
  return new Promise<IncomingHttpHeaders>((resolve, reject) => {
    const request = follow.http.get(url, { headers, sensitiveHeaders, timeout: 2000 }, (response) => {
      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.on('error', reject);
      response.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')) as IncomingHttpHeaders); }
        catch (error) { reject(error); }
      });
    });
    request.on('error', reject);
    request.on('timeout', () => request.destroy(new Error('Redirect test timed out')));
  });
}

describe('HTTP dependency security boundaries', () => {
  it.each(['array', 'object'] as const)('strips cross-origin credentials from %s headers', async (shape) => {
    const { source } = await redirects();
    const headers = shape === 'array'
      ? ['Host', new URL(source).host, 'aUtHoRiZaTiOn', 'Bearer SYNTHETIC', 'Cookie', 'sge=synthetic', 'X-Public', 'keep']
      : { Authorization: 'Bearer SYNTHETIC', Cookie: 'sge=synthetic', 'X-Public': 'keep' };
    const received = await redirectedHeaders(source, headers);
    expect(received.authorization).toBeUndefined();
    expect(received.cookie).toBeUndefined();
    expect(received['x-public']).toBe('keep');
  });

  it.each(['X-Api^Key', 'X-Token|Secret'])('strips the declared sensitive header %s', async (name) => {
    const { source } = await redirects();
    const received = await redirectedHeaders(source, {
      [name]: 'SYNTHETIC', 'X-Control-Key': 'SYNTHETIC', 'X-Public': 'keep',
    }, [name, 'X-Control-Key']);
    expect(received[name.toLowerCase()]).toBeUndefined();
    expect(received['x-control-key']).toBeUndefined();
    expect(received['x-public']).toBe('keep');
  });

  it.each(['http', 'fetch'])('enforces maxRedirects:0 in the %s adapter', async (adapter) => {
    const { source, hits } = await redirects();
    const response = await axios.get(source, {
      adapter, proxy: false, maxRedirects: 0, timeout: 2000, validateStatus: () => true,
    });
    expect(response.status).toBe(302);
    expect(hits()).toBe(0);
  });

  it('ignores inherited multipart visitors and default HTTP methods', () => {
    // Keep deliberate prototype pollution out of Vitest and other test cases.
    const script = `
      const axios = require(${JSON.stringify(require.resolve('axios'))});
      let visited = false;
      const form = new FormData();
      Object.defineProperty(Object.prototype, 'visitor', {
        configurable: true, value() { visited = true; return false; }
      });
      try { axios.toFormData({ text: 'SGE ✓' }, form, {}); }
      finally { delete Object.prototype.visitor; }
      Object.defineProperty(Object.prototype, 'method', { configurable: true, value: 'delete' });
      // A custom adapter records the method without issuing any request.
      axios.request({ url: 'https://unused.invalid', adapter: config => Promise.resolve({
        data: config.method, status: 200, statusText: 'OK', headers: {}, config
      }) }).then(result => {
        delete Object.prototype.method;
        console.log(JSON.stringify({ visited, text: form.get('text'), method: result.data }));
      }).catch(error => { delete Object.prototype.method; console.error(error); process.exitCode = 1; });
    `;
    expect(JSON.parse(execFileSync(process.execPath, ['-e', script], {
      encoding: 'utf8', timeout: 3000,
    }))).toEqual({ visited: false, text: 'SGE ✓', method: 'get' });
  });
});

describe('HTTP dependency compatibility', () => {
  it('preserves credentials on a same-origin redirect', async () => {
    const { source } = await redirects();
    const received = await redirectedHeaders(`${source}/same`, { Authorization: 'Bearer SYNTHETIC' });
    expect(received.authorization).toBe('Bearer SYNTHETIC');
  });

  it.each(['arraybuffer', 'stream'] as const)('preserves a media read as %s', async (responseType) => {
    const bytes = Buffer.from('SGE ✓');
    const url = await listen((_request, response) => response.end(bytes));
    const response = await axios.get<Buffer | Readable>(url, { responseType, proxy: false, timeout: 2000 });
    if (response.data instanceof Readable) {
      const chunks: Buffer[] = [];
      for await (const chunk of response.data) chunks.push(Buffer.from(chunk));
      expect(Buffer.concat(chunks)).toEqual(bytes);
    } else {
      expect(Buffer.from(response.data)).toEqual(bytes);
    }
  });

  it('preserves streamed multipart bytes, Unicode and explicit credentials', async () => {
    const url = await listen((request, response) => {
      const chunks: Buffer[] = [];
      request.on('data', (chunk: Buffer) => chunks.push(chunk));
      request.on('end', () => {
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify({ headers: request.headers, body: Buffer.concat(chunks).toString('utf8') }));
      });
    });
    const form = new Multipart();
    form.append('text', 'SGE ✓');
    form.append('file', Readable.from(Buffer.from('synthetic media')), {
      filename: 'draft.txt', contentType: 'text/plain', knownLength: 15,
    });
    const response = await axios.post<{ headers: IncomingHttpHeaders; body: string }>(url, form, {
      headers: { ...form.getHeaders(), Authorization: 'Bearer SYNTHETIC' }, proxy: false, timeout: 2000,
    });
    expect(response.data.headers.authorization).toBe('Bearer SYNTHETIC');
    expect(response.data.headers['content-type']).toContain(`boundary=${form.getBoundary()}`);
    expect(response.data.body).toContain('SGE ✓');
    expect(response.data.body).toContain('filename="draft.txt"');
    expect(response.data.body).toContain('synthetic media');
    expect(response.data.body).toContain(`--${form.getBoundary()}--`);
  });

  it('preserves an explicit multipart visitor', () => {
    const form = new FormData();
    axios.toFormData({ text: 'draft' }, form, {
      visitor(value, key) { this.append(String(key), String(value).toUpperCase()); return false; },
    });
    expect(form.get('text')).toBe('DRAFT');
  });

  it('preserves a caller-supplied DNS lookup on the HTTP agent', async () => {
    const url = await listen((_request, response) => response.end('SGE'));
    const host = new URL(url);
    host.hostname = 'media.example.test';
    let lookedUp = false;
    const agent = new http.Agent({ lookup(hostname, options, callback) {
      lookedUp = true;
      expect(hostname).toBe('media.example.test');
      if (options.all) callback(null, [{ address: '127.0.0.1', family: 4 }]);
      else callback(null, '127.0.0.1', 4);
    } });
    try {
      const response = await axios.get<string>(host.href, { httpAgent: agent, proxy: false, timeout: 2000 });
      expect(response.data).toBe('SGE');
      expect(lookedUp).toBe(true);
    } finally { agent.destroy(); }
  });

  it('preserves provider error status and JSON data', async () => {
    const url = await listen((_request, response) => {
      response.writeHead(422, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: 'synthetic validation failure' }));
    });
    await expect(axios.get(url, { proxy: false, timeout: 2000 })).rejects.toMatchObject({
      response: { status: 422, data: { error: 'synthetic validation failure' } },
    });
  });

  it('preserves ERR_CANCELED for an aborted media read', async () => {
    const controller = new AbortController();
    const url = await listen((_request, response) => {
      response.flushHeaders();
      controller.abort();
    });
    await expect(axios.get(url, { signal: controller.signal, proxy: false, timeout: 2000 }))
      .rejects.toMatchObject({ code: 'ERR_CANCELED' });
  });

  it('preserves a valid data URL and rejects malformed data', async () => {
    const response = await axios.get('data:,SGE%20%E2%9C%93', { responseType: 'arraybuffer' });
    expect(Buffer.from(response.data).toString('utf8')).toBe('SGE ✓');
    await expect(axios.get(`data:text/plain;${'a='.repeat(64)}`))
      .rejects.toMatchObject({ code: 'ERR_BAD_REQUEST' });
  });
});
