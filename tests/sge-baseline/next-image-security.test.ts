import http, { ClientRequest, IncomingHttpHeaders, IncomingMessage, RequestOptions } from 'node:http';
import https from 'node:https';
import dns from 'node:dns/promises';
import { LookupAddress, LookupAllOptions } from 'node:dns';
import { LookupFunction } from 'node:net';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import { createRequire } from 'node:module';
import { gzipSync, deflateSync, deflateRawSync, brotliCompressSync } from 'node:zlib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const image = require('next/dist/server/image-optimizer') as typeof import('next/dist/server/image-optimizer');
const { defaultConfig } = require('next/dist/server/config-shared') as typeof import('next/dist/server/config-shared');
const bytes = Buffer.from('SGE synthetic image bytes');
const hostname = 'image.example.test';
const url = `http://${hostname}/image.png`;
const publicAddress = { address: '93.184.216.34', family: 4 };
const lookupAll = vi.fn<(hostname: string, options: LookupAllOptions) => Promise<LookupAddress[]>>();
// Only the images/experimental defaults are read by this static validation boundary.
const optimizerConfig = defaultConfig as unknown as Parameters<typeof image.ImageOptimizerCache.validateParams>[2];
type ImageOptions = RequestOptions & { imageLookupKey?: string };
type Reply = { status?: number; headers?: IncomingHttpHeaders; body?: Buffer; stream?: () => Readable };

// Only the transport is simulated: execute the actual Next DNS/redirect/body boundary.
function upstream(replies: Reply[] = [{}]) {
  const requests: Array<{ url: URL; options: ImageOptions; response: Readable }> = [];
  const request = (...args: unknown[]): ClientRequest => {
    const [target, options, callback] = args as [URL, ImageOptions, (response: IncomingMessage) => void];
    const client = Object.assign(new EventEmitter(), { end() {
      queueMicrotask(() => {
        const reply = replies.shift();
        if (!reply) { client.emit('error', new Error('Unexpected upstream request')); return; }
        const response = reply.stream ? reply.stream() : Readable.from([reply.body ?? bytes]);
        Object.assign(response, { statusCode: reply.status ?? 200, headers: reply.headers ?? { 'content-type': 'image/png' } });
        requests.push({ url: target, options, response });
        // The production transport supplies IncomingMessage; this fixture needs only its stream/headers/status.
        callback(response as unknown as IncomingMessage);
      });
      return client;
    } });
    return client as unknown as ClientRequest;
  };
  vi.spyOn(http, 'request').mockImplementation(request);
  vi.spyOn(https, 'request').mockImplementation(request);
  return requests;
}

function lookup(pinned: LookupFunction, name = hostname, options: { family?: number; all?: boolean } = { all: true }) {
  return new Promise<{ address: string | LookupAddress[]; family?: number }>((resolve, reject) => {
    pinned(name, options, (error, address, family) => error ? reject(error) : resolve({ address, family }));
  });
}

beforeEach(() => {
  lookupAll.mockReset().mockResolvedValue([publicAddress]);
  // Next invokes only the all:true overload; preserve its typed result in the fixture.
  vi.spyOn(dns, 'lookup').mockImplementation(lookupAll as unknown as typeof dns.lookup);
});
afterEach(() => { vi.restoreAllMocks(); });

describe('Next pinned image DNS boundary', () => {
  it('uses the checked address even if later DNS would resolve privately', async () => {
    lookupAll.mockResolvedValueOnce([publicAddress])
      .mockResolvedValue([{ address: '127.0.0.1', family: 4 }]);
    const requests = upstream();
    const result = await image.fetchExternalImage(url, false, 1024);
    expect(await lookup(requests[0].options.lookup!)).toEqual({ address: [publicAddress], family: undefined });
    expect(dns.lookup).toHaveBeenCalledTimes(1);
    expect(result.buffer).toEqual(bytes);
    expect(requests[0].url.hostname).toBe(hostname);
  });

  it.each([4, 6])('preserves IPv%s family selection', async (family) => {
    const addresses = [publicAddress, { address: '2606:4700:4700::1111', family: 6 }];
    const pinned = image.createPinnedLookup(hostname, addresses);
    const selected = addresses.filter((entry) => entry.family === family);
    expect(await lookup(pinned, hostname, { family, all: true })).toEqual({ address: selected, family: undefined });
    expect(await lookup(pinned, hostname, { family })).toEqual(selected[0]);
  });

  it('rejects using pinned records for another hostname', async () => {
    await expect(lookup(image.createPinnedLookup(hostname, [publicAddress]), 'other.example.test'))
      .rejects.toThrow(/does not match/);
  });

  it('reports missing families through the callback without an escaping exception', async () => {
    await expect(lookup(image.createPinnedLookup(hostname, [publicAddress]), hostname, { family: 6 }))
      .rejects.toMatchObject({ code: 'ENODATA' });
    await expect(lookup(image.createPinnedLookup(hostname, [])))
      .rejects.toMatchObject({ code: 'ENODATA' });
  });

  it.each(['127.0.0.1', '169.254.169.254', '::1', '::ffff:127.0.0.1'])('blocks resolved private address %s before connecting', async (address) => {
    lookupAll.mockResolvedValue([{ address, family: address.includes(':') ? 6 : 4 }]);
    upstream();
    await expect(image.fetchExternalImage(url, false, 1024)).rejects.toMatchObject({ statusCode: 400 });
    expect(http.request).not.toHaveBeenCalled();
    expect(https.request).not.toHaveBeenCalled();
  });

  it('rejects a mixed public/private answer and DNS failure before connecting', async () => {
    upstream();
    lookupAll.mockResolvedValue([publicAddress, { address: '10.0.0.1', family: 4 }]);
    await expect(image.fetchExternalImage(url, false, 1024)).rejects.toMatchObject({ statusCode: 400 });
    lookupAll.mockRejectedValue(Object.assign(new Error('Synthetic DNS failure'), { code: 'ENOTFOUND' }));
    await expect(image.fetchExternalImage(url, false, 1024)).rejects.toMatchObject({ code: 'ENOTFOUND' });
    expect(http.request).not.toHaveBeenCalled();
  });

  it('rechecks redirect DNS and discards its body before rejecting a private hop', async () => {
    lookupAll.mockResolvedValueOnce([publicAddress])
      .mockResolvedValueOnce([{ address: '10.0.0.1', family: 4 }]);
    const requests = upstream([{ status: 302, headers: { location: 'http://private.example.test/image.png' } }]);
    await expect(image.fetchExternalImage(url, false, 1024)).rejects.toMatchObject({ statusCode: 400 });
    expect(requests).toHaveLength(1);
    expect(requests[0].response.destroyed).toBe(true);
  });

  it('separates connection-pool keys when the checked DNS set changes', async () => {
    lookupAll.mockResolvedValueOnce([publicAddress])
      .mockResolvedValueOnce([{ address: '1.1.1.1', family: 4 }]);
    const requests = upstream([{}, {}]);
    await image.fetchExternalImage(url, false, 1024);
    await image.fetchExternalImage(url, false, 1024);
    const names = requests.map(({ options }) => {
      const agent = options.agent as http.Agent & { getName(options: ImageOptions): string };
      return agent.getName({ host: hostname, port: 80, imageLookupKey: options.imageLookupKey });
    });
    expect(names[0]).not.toBe(names[1]);
  });
});

describe('Next image transport compatibility', () => {
  it.each([
    ['gzip', gzipSync], ['deflate', deflateSync], ['deflate', deflateRawSync], ['br', brotliCompressSync],
  ] as const)('decodes %s image responses', async (encoding, encode) => {
    upstream([{ headers: { 'content-encoding': encoding, 'content-type': 'image/png', 'cache-control': 'max-age=60', etag: 'synthetic' }, body: encode(bytes) }]);
    const response = await image.fetchExternalImage(url, false, 1024);
    expect(response).toMatchObject({ buffer: bytes, contentType: 'image/png', cacheControl: 'max-age=60' });
    expect(response.etag).toBe(Buffer.from('synthetic').toString('base64url'));
  });

  it('enforces the decoded body cap on bounded compressed input', async () => {
    upstream([{ headers: { 'content-encoding': 'gzip' }, body: gzipSync(Buffer.alloc(4096)) }]);
    await expect(image.fetchExternalImage(url, false, 128)).rejects.toMatchObject({ statusCode: 413 });
  });

  it('preserves a public redirect and enforces a zero redirect budget', async () => {
    const requests = upstream([{ status: 302, headers: { location: '/final.png' } }, {}, { status: 302, headers: { location: '/final.png' } }]);
    expect((await image.fetchExternalImage(url, false, 1024)).buffer).toEqual(bytes);
    expect(requests[1].url.href).toBe(`http://${hostname}/final.png`);
    await expect(image.fetchExternalImage(url, false, 1024, 0)).rejects.toMatchObject({ statusCode: 508 });
    expect(requests[2].response.destroyed).toBe(true);
  });

  it.each([404, 503])('preserves upstream status %s', async (status) => {
    const requests = upstream([{ status }]);
    await expect(image.fetchExternalImage(url, false, 1024)).rejects.toMatchObject({ statusCode: status });
    expect(requests[0].response.destroyed).toBe(true);
  });

  it('rejects an empty response', async () => {
    upstream([{ body: Buffer.alloc(0) }]);
    await expect(image.fetchExternalImage(url, false, 1024)).rejects.toMatchObject({ statusCode: 400 });
  });

  it.each([false, true])('classifies a reset with timeout state %s', async (timedOut) => {
    const controller = new AbortController();
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal);
    upstream([{ stream: () => new Readable({ read() {
      if (timedOut) controller.abort();
      this.destroy(Object.assign(new Error('Synthetic reset'), { code: 'ECONNRESET' }));
    } }) }]);
    const expected = timedOut ? { statusCode: 504 } : { code: 'ECONNRESET' };
    await expect(image.fetchExternalImage(url, false, 1024)).rejects.toMatchObject(expected);
  });

  it('keeps HTTPS hostnames and sends no user authorization headers', async () => {
    const requests = upstream();
    await image.fetchExternalImage(`https://${hostname}/image.png`, false, 1024);
    expect(https.request).toHaveBeenCalledOnce();
    expect(requests[0].url.hostname).toBe(hostname);
    expect(requests[0].options.headers).not.toHaveProperty('authorization');
    expect(requests[0].options.headers).not.toHaveProperty('cookie');
  });

  it('preserves the explicit local-IP opt-out without sharing its protected agent', async () => {
    const requests = upstream([{}, {}]);
    await image.fetchExternalImage(url, false, 1024);
    await image.fetchExternalImage('http://127.0.0.1/image.png', true, 1024);
    expect(requests[1].options.lookup).toBeUndefined();
    expect(requests[0].options.agent).not.toBe(requests[1].options.agent);
    expect(dns.lookup).toHaveBeenCalledTimes(1);
  });
});

describe('Next default optimizer allowlist', () => {
  it.each(['https://image.example.test/a.png', 'http://127.0.0.1/a.png', '//image.example.test/a.png'])('rejects unconfigured remote input %s', (source) => {
    const result = image.ImageOptimizerCache.validateParams({ headers: {} } as IncomingMessage,
      { url: source, w: '64', q: '75' }, optimizerConfig, false);
    expect(result).toHaveProperty('errorMessage');
  });

  it('preserves ordinary local image parameters', () => {
    expect(image.ImageOptimizerCache.validateParams({ headers: {} } as IncomingMessage,
      { url: '/favicon.png', w: '64', q: '75' }, optimizerConfig, false))
      .toMatchObject({ href: '/favicon.png', width: 64, quality: 75, isAbsolute: false });
  });
});
