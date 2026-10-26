import { Agent, buildConnector } from 'undici';
import axios, { AxiosInstance } from 'axios';
import dns from 'node:dns';
import net from 'node:net';
import http from 'node:http';
import https from 'node:https';
import { isBlockedIp } from './webhook.url.validator';

// Pins DNS resolution: every resolved IP is checked with `isBlockedIp` and
// the caller connects to that same set. Closes the TOCTOU window
// `isSafePublicHttpsUrl` alone leaves open (see GHSA-f7jj-p389-4w45).
const ssrfSafeLookup: net.LookupFunction = (hostname, options, callback) => {
  // Inspect the full answer even if the socket requests a single family.
  // Connect using this answer, never a second unvalidated resolution.
  dns.lookup(hostname, { ...options, family: 0, all: true }, (err, records) => {
    if (err) return callback(err, '', 0);
    if (
      !records.length ||
      records.some((entry) => isBlockedIp(entry.address))
    ) {
      return callback(new Error('Blocked IP'), '', 0);
    }
    const family =
      options.family === 'IPv4'
        ? 4
        : options.family === 'IPv6'
        ? 6
        : options.family;
    const addresses = family
      ? records.filter((entry) => entry.family === family)
      : records;
    if (!addresses.length) {
      return callback(new Error('No address for requested family'), '', 0);
    }
    if (options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
};

function assertSafeTarget(protocol: string, hostname: string) {
  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error('URL must use HTTP or HTTPS');
  }
  const host = hostname.replace(/^\[|\]$/g, '');
  // Node skips lookup entirely for literal addresses, including redirect targets.
  if (net.isIP(host) && isBlockedIp(host)) throw new Error('Blocked IP');
}

function createSafeDispatcher(httpsOnly = false): Agent {
  const connect = buildConnector({ lookup: ssrfSafeLookup });
  return new Agent({
    connect(options, callback) {
      try {
        assertSafeTarget(options.protocol, options.hostname);
        if (httpsOnly && options.protocol !== 'https:') {
          throw new Error('URL must use HTTPS');
        }
      } catch (error) {
        callback(
          error instanceof Error ? error : new Error('Unsafe URL'),
          null
        );
        return;
      }
      connect(options, callback);
    },
  });
}

export const ssrfSafeDispatcher = createSafeDispatcher();
const ssrfSafeHttpsDispatcher = createSafeDispatcher(true);

// Keep native Fetch redirect, header, method and streaming semantics, while the
// HTTPS-only connector checks every new origin before opening a socket.
export async function fetchPublicHttps(
  input: string | URL | Request,
  options: RequestInit = {}
) {
  const url = input instanceof Request ? input.url : input;
  if (new URL(url).protocol !== 'https:') throw new Error('URL must use HTTPS');
  const request: RequestInit & { dispatcher: Agent } = {
    ...options,
    dispatcher: ssrfSafeHttpsDispatcher,
  };
  return fetch(input, request);
}

// axios can't use an undici dispatcher, but Node's http(s) agents accept the
// same `lookup` hook, so axios requests (providers that need form-data /
// stream uploads) get the identical pinned-DNS guard as `this.fetch`.
const ssrfSafeAxios = axios.create({
  httpAgent: new http.Agent({ lookup: ssrfSafeLookup }),
  httpsAgent: new https.Agent({
    lookup: ssrfSafeLookup,
  }),
  // An environment proxy resolves at the proxy and bypasses the pinned lookup.
  proxy: false,
  adapter: 'http',
});

ssrfSafeAxios.interceptors.request.use((config) => {
  const url = new URL(axios.getUri(config));
  assertSafeTarget(url.protocol, url.hostname);
  const beforeRedirect = config.beforeRedirect;
  config.beforeRedirect = (options, response, request) => {
    beforeRedirect?.(options, response, request);
    assertSafeTarget(String(options.protocol), String(options.hostname));
  };
  return config;
});

// Self-hosters legitimately connect Postiz to WordPress/Mastodon/Lemmy/Listmonk
// instances that live on a private network (e.g. the same Docker network or VPC).
// Setting DISABLE_SSRF_PROTECTION=true opts those deployments out of the IP
// guard. It stays ON by default so the hosted product is protected.
export function getSsrfSafeDispatcher(): Agent | undefined {
  return process.env.DISABLE_SSRF_PROTECTION === 'true'
    ? undefined
    : ssrfSafeDispatcher;
}

export function getSsrfSafeAxios(): AxiosInstance {
  return process.env.DISABLE_SSRF_PROTECTION === 'true' ? axios : ssrfSafeAxios;
}
