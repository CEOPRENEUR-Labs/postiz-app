import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const { wrapMiddlewareWithSentry } = require('@sentry/nextjs') as typeof import('@sentry/nextjs');
const globals = globalThis as typeof globalThis & { _sentryRewritesTunnelPath?: string };
const svg = Buffer.from('<svg width="8" height="6" xmlns="http://www.w3.org/2000/svg"><rect width="8" height="6" fill="red"/></svg>');

describe('Sentry tunnel middleware boundary', () => {
  let descriptor: PropertyDescriptor | undefined;
  beforeEach(() => {
    descriptor = Object.getOwnPropertyDescriptor(globals, '_sentryRewritesTunnelPath');
    globals._sentryRewritesTunnelPath = '/monitoring';
  });
  afterEach(() => {
    if (descriptor) Object.defineProperty(globals, '_sentryRewritesTunnelPath', descriptor);
    else delete globals._sentryRewritesTunnelPath;
  });

  it.each([
    ['/monitoring/analytics?o=1&p=2', 'POST'],
    ['/monitoring?o=1&p=2', 'GET'],
    ['/monitoring', 'POST'],
    ['/monitoring?o=1', 'POST'],
    ['/monitoring?p=2', 'POST'],
    ['/monitoring?o=invalid&p=2', 'POST'],
    ['/monitoring?o=1&p=invalid', 'POST'],
    ['/monitoring?o=1&o=invalid&p=2', 'POST'],
    ['/monitoring?o=1&p=2&p=', 'POST'],
    ['/monitoring-extra?o=1&p=2', 'POST'],
    ['/monitoring%2Fanalytics?o=1&p=2', 'POST'],
  ])('preserves the middleware decision for %s (%s)', async (path, method) => {
    const request = new Request(`http://sge.example.test${path}`, { method });
    const denied = new Response('denied', { status: 401 });
    const middleware = vi.fn((_request: Request) => denied);
    const result = await wrapMiddlewareWithSentry(middleware)(request);
    expect(middleware).toHaveBeenCalledExactlyOnceWith(request);
    expect(result).toBe(denied);
  });

  it.each([
    '/monitoring?o=1&p=2',
    '/monitoring/?o=1&p=2&r=us',
    '/monitoring?o=1&o=3&p=2&p=4',
  ])('preserves legitimate tunnel envelopes at %s', async (path) => {
    const middleware = vi.fn((_request: Request) => new Response('denied', { status: 401 }));
    const result = await wrapMiddlewareWithSentry(middleware)(
      new Request(`http://sge.example.test${path}`, { method: 'POST' }),
    );
    expect(middleware).not.toHaveBeenCalled();
    expect(result.status).toBe(200);
    expect(result.headers.get('x-middleware-next')).toBe('1');
  });

  it('keeps middleware active with the application default of no tunnel', async () => {
    delete globals._sentryRewritesTunnelPath;
    const middleware = vi.fn((_request: Request) => new Response('denied', { status: 401 }));
    const result = await wrapMiddlewareWithSentry(middleware)(new Request('http://sge.example.test/monitoring'));
    expect(middleware).toHaveBeenCalledOnce();
    expect(result.status).toBe(401);
  });
});

describe('Flight typed-array serialization boundary', () => {
  it.each(['webpack', 'turbopack'])('snapshots large shared/resizable buffers and preserves ordinary %s replies', (bundler) => {
    // Next keeps this boundary private. Expose the installed function only in the
    // child module's memory; execute its implementation, without editing/copying it.
    const script = `
      const fs = require('node:fs');
      const Module = require('node:module');
      const path = require('node:path');
      const assert = require('node:assert/strict');
      const filename = ${JSON.stringify(require.resolve(`next/dist/compiled/react-server-dom-${bundler}/cjs/react-server-dom-${bundler}-server.node.production.js`))};
      const fixture = new Module(filename, module);
      fixture.filename = filename;
      fixture.paths = Module._nodeModulePaths(path.dirname(filename));
      fixture._compile(fs.readFileSync(filename, 'utf8') + '\\nexports.__sgeEmit = emitTypedArrayChunk;', filename);
      const emit = fixture.exports.__sgeEmit;
      const backing = new ArrayBuffer(20000);
      const first = new Uint8Array(backing, 128, 8192); first.fill(7);
      const second = new Uint8Array(backing, 10000, 8192); second.fill(9);
      const request = { pendingChunks: 0, pendingDebugChunks: 0, completedRegularChunks: [] };
      emit(request, 1, 'o', first, false); emit(request, 2, 'o', second, false);
      const chunks = request.completedRegularChunks.filter(value => value instanceof Uint8Array);
      assert.equal(chunks.length, 2);
      first.fill(1); second.fill(2);
      assert.ok(chunks[0].every(byte => byte === 7));
      assert.ok(chunks[1].every(byte => byte === 9));
      const resizable = new ArrayBuffer(8192, { maxByteLength: 16384 });
      const view = new Uint8Array(resizable); view.fill(4);
      const other = { pendingChunks: 0, pendingDebugChunks: 0, completedRegularChunks: [] };
      emit(other, 3, 'o', view, false);
      const output = other.completedRegularChunks.find(value => value instanceof Uint8Array);
      resizable.resize(4096);
      assert.equal(output.length, 8192); assert.ok(output.every(byte => byte === 4));
      const client = require(${JSON.stringify(require.resolve(`next/dist/compiled/react-server-dom-${bundler}/client.node`))});
      const server = require(${JSON.stringify(require.resolve(`next/dist/compiled/react-server-dom-${bundler}/server.node`))});
      (async () => {
        const input = { first: new Uint8Array([1,2,3]), second: new Uint16Array([513,1025]), text: 'SGE ✓' };
        const decoded = await server.decodeReply(await client.encodeReply(input), {});
        assert.deepEqual(Array.from(decoded.first), [1,2,3]);
        assert.deepEqual(Array.from(decoded.second), [513,1025]);
        assert.equal(decoded.text, input.text);
        assert.notEqual(decoded.first.buffer, decoded.second.buffer);
        console.log('PASS');
      })().catch(error => { console.error(error); process.exitCode = 1; });
    `;
    expect(execFileSync(process.execPath, ['--conditions=react-server', '-e', script], {
      encoding: 'utf8', timeout: 5000, env: { ...process.env, NODE_ENV: 'production' },
    }).trim()).toBe('PASS');
  });
});

describe('native image processing compatibility', () => {
  it('preserves SVG decoding, PNG metadata and provider JPEG resizing', async () => {
    const png = await sharp(svg).png().toBuffer();
    expect(await sharp(png).metadata()).toMatchObject({ format: 'png', width: 8, height: 6 });
    const jpeg = await sharp(png, { animated: false }).resize({ width: 4 }).jpeg()
      .toBuffer({ resolveWithObject: true });
    expect(jpeg.info).toMatchObject({ format: 'jpeg', width: 4, height: 3 });
  });

  it('preserves frame count, timing and looping when resizing an animated GIF', async () => {
    const pixels = Buffer.alloc(4 * 8 * 4);
    pixels.fill(Buffer.from([255, 0, 0, 255]), 0, 4 * 4 * 4);
    pixels.fill(Buffer.from([0, 0, 255, 255]), 4 * 4 * 4);
    const gif = await sharp(pixels, { raw: { width: 4, height: 8, channels: 4, pageHeight: 4 } })
      .gif({ loop: 0, delay: [100, 200] }).toBuffer();
    const resized = await sharp(gif, { animated: true }).resize({ width: 2 }).gif().toBuffer();
    expect(await sharp(resized, { animated: true }).metadata()).toMatchObject({
      format: 'gif', width: 2, height: 4, pageHeight: 2, pages: 2, loop: 0, delay: [100, 200],
    });
  });
});
