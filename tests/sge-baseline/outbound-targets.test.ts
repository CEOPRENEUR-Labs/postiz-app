import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import http from 'node:http';
import net, { AddressInfo } from 'node:net';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import tls from 'node:tls';
import { Readable } from 'node:stream';
import { BskyAgent } from '@atproto/api';
import { isSafePublicHttpsUrl } from '../../libraries/nestjs-libraries/src/dtos/webhooks/webhook.url.validator';
import {
  fetchPublicHttps,
  getSsrfSafeAxios,
  ssrfSafeDispatcher,
} from '../../libraries/nestjs-libraries/src/dtos/webhooks/ssrf.safe.dispatcher';

let server: http.Server;
let origin: string;
let hits = 0;
let sequence = 0;
let records: dns.LookupAddress[] = [];
let received: Array<{
  url: string;
  method: string;
  body: string;
  headers: http.IncomingHttpHeaders;
}> = [];
let pinned: dns.LookupAddress[] = [];
let sdkMode: 'ok' | 'redirect-private' | 'did-private' = 'ok';
const fixtureDid = 'did:plc:abcdefghijklmnopqrstuvwx';

function publicUrl(path = '/') {
  return `https://public-${++sequence}.example.test:${
    (server.address() as AddressInfo).port
  }${path}`;
}

function mockDns(answers = [{ address: '8.8.8.8', family: 4 }]) {
  records = answers;
  // dns.lookup has multiple overloads; sockets use its all-address callback.
  vi.spyOn(dns, 'lookup').mockImplementation(((
    hostname: string,
    options: dns.LookupAllOptions,
    callback: (
      err: NodeJS.ErrnoException | null,
      addresses: dns.LookupAddress[]
    ) => void
  ) => {
    expect(options.all).toBe(true);
    callback(
      null,
      hostname.startsWith('private-')
        ? [{ address: '169.254.169.254', family: 4 }]
        : records
    );
  }) as typeof dns.lookup);
}

// Only the final TLS transport is simulated. Execute the actual agents, lookup
// hooks, native Fetch and Axios redirect/body logic; route approved fixture
// connections to a loopback HTTP server. No public destination is contacted.
function routeTlsToFixture() {
  vi.spyOn(tls, 'connect').mockImplementation(((
    options: tls.ConnectionOptions
  ) => {
    const socket = new net.Socket();
    socket.connect({
      host: net.isIP(String(options.host)) ? '127.0.0.1' : String(options.host),
      port: (server.address() as AddressInfo).port,
      lookup(hostname, lookupOptions, callback) {
        if (!options.lookup) throw new Error('Missing protected lookup');
        options.lookup(hostname, lookupOptions, (err, addresses) => {
          if (err) return callback(err, '', 0);
          pinned.push(
            ...(typeof addresses === 'string'
              ? [{ address: addresses, family: net.isIP(addresses) }]
              : addresses)
          );
          if (lookupOptions.all)
            callback(null, [{ address: '127.0.0.1', family: 4 }]);
          else callback(null, '127.0.0.1', 4);
        });
      },
    });
    socket.once('connect', () => socket.emit('secureConnect'));
    // The fixture provides a plain socket at the TLS boundary, deliberately
    // avoiding certificate verification changes in production or test clients.
    return socket as unknown as tls.TLSSocket;
  }) as typeof tls.connect);
}

beforeAll(async () => {
  server = http.createServer(async (req, res) => {
    hits++;
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    received.push({
      url: req.url || '',
      method: req.method || '',
      headers: req.headers,
      body: Buffer.concat(chunks).toString(),
    });
    res.setHeader('Connection', 'close');
    const route = new URL(req.url || '/', 'https://fixture.test');
    if (route.pathname === '/xrpc/com.atproto.server.createSession') {
      if (sdkMode === 'redirect-private') {
        res.writeHead(303, { Location: `${origin}/private` });
        return res.end('redirect fixture body');
      }
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          did: fixtureDid,
          handle: 'fixture.test',
          accessJwt: 'SYNTHETIC_ACCESS',
          refreshJwt: 'SYNTHETIC_REFRESH',
          didDoc:
            sdkMode === 'did-private'
              ? {
                  id: fixtureDid,
                  service: [
                    {
                      id: `${fixtureDid}#atproto_pds`,
                      type: 'AtprotoPersonalDataServer',
                      serviceEndpoint: origin.replace('http:', 'https:'),
                    },
                  ],
                }
              : undefined,
        })
      );
    }
    let location: string | undefined;
    if (route.pathname === '/private-redirect')
      location = `https://127.0.0.1:${
        (server.address() as AddressInfo).port
      }/private`;
    if (route.pathname === '/dns-redirect')
      location = publicUrl('/final').replace('public-', 'private-');
    if (route.pathname === '/relative') location = '/final?signed=a%2Bb%2Fc';
    if (route.pathname === '/cross-origin') location = publicUrl('/final');
    if (route.pathname === '/downgrade')
      location = publicUrl('/final').replace('https:', 'http:');
    if (route.pathname === '/loop') location = '/loop';
    if (route.pathname === '/post') location = '/final';
    if (location) {
      res.writeHead(Number(route.searchParams.get('status')) || 302, {
        Location: location,
      });
      return res.end('redirect fixture body');
    }
    if (route.pathname === '/partial')
      res.writeHead(206, {
        'Content-Range': 'bytes 0-3/8',
        'Content-Type': 'video/mp4',
      });
    res.end(
      route.pathname === '/private' ? 'SYNTHETIC_PRIVATE_RESPONSE' : 'DATA'
    );
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  received = [];
  pinned = [];
  sdkMode = 'ok';
});

afterAll(async () => {
  vi.unstubAllEnvs();
  await ssrfSafeDispatcher.close();
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('actual protected outbound clients', () => {
  it.each([
    '127.0.0.1',
    '127.1',
    '2130706433',
    '0x7f000001',
    '[::1]',
    '[::ffff:127.0.0.1]',
  ])('blocks Axios literal %s before connecting', async (host) => {
    vi.stubEnv('DISABLE_SSRF_PROTECTION', 'false');
    const before = hits;
    await expect(
      getSsrfSafeAxios().get(origin.replace('127.0.0.1', host))
    ).rejects.toThrow('Blocked IP');
    expect(hits).toBe(before);
  });

  it('blocks a Fetch literal before contacting the private fixture', async () => {
    const before = hits;
    const options: RequestInit & { dispatcher: typeof ssrfSafeDispatcher } = {
      dispatcher: ssrfSafeDispatcher,
    };
    await expect(fetch(origin, options)).rejects.toThrow();
    expect(hits).toBe(before);
  });

  it.each([
    '127.0.0.1',
    '127.1',
    '2130706433',
    '0x7f000001',
    '[::1]',
    '[::ffff:127.0.0.1]',
  ])('blocks Fetch literal %s before connecting', async (host) => {
    const before = hits;
    const options: RequestInit & { dispatcher: typeof ssrfSafeDispatcher } = {
      dispatcher: ssrfSafeDispatcher,
    };
    await expect(
      fetch(origin.replace('127.0.0.1', host), options)
    ).rejects.toMatchObject({ cause: { message: 'Blocked IP' } });
    expect(hits).toBe(before);
  });

  it.each(['axios', 'fetch'] as const)(
    'rejects mixed DNS answers through %s',
    async (client) => {
      mockDns([
        { address: '8.8.8.8', family: 4 },
        { address: '::1', family: 6 },
      ]);
      routeTlsToFixture();
      const before = hits;
      const url = publicUrl();
      await expect(
        client === 'axios' ? getSsrfSafeAxios().get(url) : fetchPublicHttps(url)
      ).rejects.toThrow();
      expect(hits).toBe(before);
      expect(pinned).toEqual([]);
    }
  );

  it.each(['axios', 'fetch'] as const)(
    'rejects empty DNS answers through %s',
    async (client) => {
      mockDns([]);
      routeTlsToFixture();
      const before = hits;
      const url = publicUrl();
      await expect(
        client === 'axios' ? getSsrfSafeAxios().get(url) : fetchPublicHttps(url)
      ).rejects.toThrow();
      expect(hits).toBe(before);
    }
  );

  it.each(['axios', 'fetch'] as const)(
    'rejects DNS rebinding after a successful DTO check through %s',
    async (client) => {
      // The DTO calls the all-address overload, matching the pinned client.
      const lookupAll = async (): Promise<dns.LookupAddress[]> => [
        { address: '8.8.8.8', family: 4 },
      ];
      vi.spyOn(dnsPromises, 'lookup').mockImplementation(
        lookupAll as unknown as typeof dnsPromises.lookup
      );
      const url = publicUrl();
      expect(await isSafePublicHttpsUrl(url)).toBe(true);
      mockDns([{ address: '10.0.0.1', family: 4 }]);
      routeTlsToFixture();
      const before = hits;
      await expect(
        client === 'axios' ? getSsrfSafeAxios().get(url) : fetchPublicHttps(url)
      ).rejects.toThrow();
      expect(hits).toBe(before);
    }
  );

  it.each(['8.8.8.8', '[2606:4700:4700::1111]'])(
    'allows public literal %s without DNS',
    async (host) => {
      mockDns();
      routeTlsToFixture();
      const url = `https://${host}:${
        (server.address() as AddressInfo).port
      }/final`;
      expect((await getSsrfSafeAxios().get(url)).data).toBe('DATA');
      expect(await (await fetchPublicHttps(url)).text()).toBe('DATA');
      expect(dns.lookup).not.toHaveBeenCalled();
    }
  );

  it.each(['axios', 'fetch'] as const)(
    'rejects a private literal redirect through %s',
    async (client) => {
      mockDns();
      routeTlsToFixture();
      const before = hits;
      const url = publicUrl('/private-redirect');
      await expect(
        client === 'axios' ? getSsrfSafeAxios().get(url) : fetchPublicHttps(url)
      ).rejects.toThrow();
      expect(hits - before).toBe(1);
    }
  );

  it.each(['axios', 'fetch'] as const)(
    'rechecks redirect DNS through %s',
    async (client) => {
      mockDns();
      routeTlsToFixture();
      const before = hits;
      const url = publicUrl('/dns-redirect');
      await expect(
        client === 'axios' ? getSsrfSafeAxios().get(url) : fetchPublicHttps(url)
      ).rejects.toThrow();
      expect(hits - before).toBe(1);
    }
  );

  it.each([
    'http://8.8.8.8',
    'data:text/plain,DATA',
    'file:///etc/hosts',
    'ftp://example.test',
    'invalid',
  ])('rejects non-HTTPS media target %s', async (url) => {
    await expect(fetchPublicHttps(url)).rejects.toThrow();
  });

  it('rejects an HTTPS downgrade without sending the second request', async () => {
    mockDns();
    routeTlsToFixture();
    const before = hits;
    await expect(fetchPublicHttps(publicUrl('/downgrade'))).rejects.toThrow();
    expect(hits - before).toBe(1);
  });

  it('keeps HTTPS media protection when the provider opt-out is set', async () => {
    vi.stubEnv('DISABLE_SSRF_PROTECTION', 'true');
    const before = hits;
    await expect(
      fetchPublicHttps(origin.replace('http:', 'https:'))
    ).rejects.toThrow();
    expect(hits).toBe(before);
  });

  it('retains the explicit generic-provider private-network opt-out', async () => {
    vi.stubEnv('DISABLE_SSRF_PROTECTION', 'true');
    expect((await getSsrfSafeAxios().get(origin)).data).toBe('DATA');
  });

  it.each(['axios', 'fetch'] as const)(
    'pins one public DNS answer and preserves signed relative redirects through %s',
    async (client) => {
      mockDns();
      routeTlsToFixture();
      const url = publicUrl('/relative');
      const data =
        client === 'axios'
          ? (await getSsrfSafeAxios().get(url)).data
          : await (await fetchPublicHttps(url)).text();
      expect(data).toBe('DATA');
      expect(received.map((entry) => entry.url)).toEqual([
        '/relative',
        '/final?signed=a%2Bb%2Fc',
      ]);
      expect(pinned).toEqual([
        { address: '8.8.8.8', family: 4 },
        { address: '8.8.8.8', family: 4 },
      ]);
      expect(dns.lookup).toHaveBeenCalledTimes(2);
    }
  );

  it('strips sensitive headers on a public cross-origin Fetch redirect', async () => {
    mockDns();
    routeTlsToFixture();
    const response = await fetchPublicHttps(publicUrl('/cross-origin'), {
      headers: { Authorization: 'Bearer SYNTHETIC', Cookie: 'synthetic=1' },
    });
    expect(await response.text()).toBe('DATA');
    expect(received[0].headers.authorization).toBe('Bearer SYNTHETIC');
    expect(received[1].headers.authorization).toBeUndefined();
    expect(received[1].headers.cookie).toBeUndefined();
  });

  it.each([301, 302, 303, 307, 308])(
    'preserves native Fetch method/body rules for %s',
    async (status) => {
      mockDns();
      routeTlsToFixture();
      const response = await fetchPublicHttps(
        publicUrl(`/post?status=${status}`),
        {
          method: 'POST',
          body: 'SYNTHETIC_WEBHOOK',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(await response.text()).toBe('DATA');
      expect(received[1].method).toBe(status >= 307 ? 'POST' : 'GET');
      expect(received[1].body).toBe(status >= 307 ? 'SYNTHETIC_WEBHOOK' : '');
    }
  );

  it('preserves range headers, partial status and streaming bytes', async () => {
    mockDns();
    routeTlsToFixture();
    const response = await fetchPublicHttps(publicUrl('/partial'), {
      headers: { Range: 'bytes=0-3' },
    });
    expect(response.status).toBe(206);
    expect(response.headers.get('content-range')).toBe('bytes 0-3/8');
    expect(received[0].headers.range).toBe('bytes=0-3');
    expect(await response.text()).toBe('DATA');
  });

  it.each(['arraybuffer', 'stream'] as const)(
    'preserves Axios %s media responses without environment proxies',
    async (responseType) => {
      mockDns();
      routeTlsToFixture();
      vi.stubEnv('HTTPS_PROXY', origin);
      vi.stubEnv('HTTP_PROXY', origin);
      vi.stubEnv('ALL_PROXY', origin);
      vi.stubEnv('NO_PROXY', '');
      const response = await getSsrfSafeAxios().get<Buffer | Readable>(
        publicUrl(),
        { responseType }
      );
      const chunks: Buffer[] = [];
      if (response.data instanceof Readable) {
        for await (const chunk of response.data)
          chunks.push(Buffer.from(chunk));
      } else chunks.push(response.data);
      expect(Buffer.concat(chunks).toString()).toBe('DATA');
      expect(received[0].url).toBe('/');
      expect(pinned).toEqual([{ address: '8.8.8.8', family: 4 }]);
    }
  );

  it('keeps native redirect limits and cancellation', async () => {
    mockDns();
    routeTlsToFixture();
    await expect(fetchPublicHttps(publicUrl('/loop'))).rejects.toThrow();
    expect(received).toHaveLength(21);
    const before = hits;
    const controller = new AbortController();
    controller.abort();
    await expect(
      fetchPublicHttps(publicUrl(), { signal: controller.signal })
    ).rejects.toThrow();
    expect(hits).toBe(before);
  });

  it.each(['url', 'request'] as const)(
    'preserves %s input for SDK-compatible Fetch',
    async (kind) => {
      mockDns();
      routeTlsToFixture();
      const url = publicUrl('/final');
      const response = await fetchPublicHttps(
        kind === 'url' ? new URL(url) : new Request(url)
      );
      expect(await response.text()).toBe('DATA');
    }
  );

  it('preserves a real Bluesky SDK login through the protected transport', async () => {
    mockDns();
    routeTlsToFixture();
    const agent = new BskyAgent({
      service: publicUrl(),
      fetch: fetchPublicHttps,
    });
    expect(
      (await agent.login({ identifier: 'fixture.test', password: 'SYNTHETIC' }))
        .data.did
    ).toBe(fixtureDid);
    expect(received[0].method).toBe('POST');
    expect(JSON.parse(received[0].body).identifier).toBe('fixture.test');
  });

  it('blocks a Bluesky SDK login redirect to an internal HTTP service', async () => {
    mockDns();
    routeTlsToFixture();
    sdkMode = 'redirect-private';
    const before = hits;
    const agent = new BskyAgent({
      service: publicUrl(),
      fetch: fetchPublicHttps,
    });
    await expect(
      agent.login({ identifier: 'fixture.test', password: 'SYNTHETIC' })
    ).rejects.toThrow();
    expect(hits - before).toBe(1);
  });

  it('blocks an internal stored Bluesky service without relying on admission validation', async () => {
    const before = hits;
    const agent = new BskyAgent({
      service: origin.replace('http:', 'https:'),
      fetch: fetchPublicHttps,
    });
    await expect(
      agent.login({ identifier: 'fixture.test', password: 'SYNTHETIC' })
    ).rejects.toThrow();
    expect(hits).toBe(before);
  });

  it('blocks a private PDS URL supplied by a Bluesky login DID document', async () => {
    mockDns();
    routeTlsToFixture();
    sdkMode = 'did-private';
    const agent = new BskyAgent({
      service: publicUrl(),
      fetch: fetchPublicHttps,
    });
    await agent.login({ identifier: 'fixture.test', password: 'SYNTHETIC' });
    expect(agent.dispatchUrl.hostname).toBe('127.0.0.1');
    const before = hits;
    await expect(agent.getProfile({ actor: fixtureDid })).rejects.toThrow();
    expect(hits).toBe(before);
  });
});
