import { beforeEach, describe, expect, it, vi } from 'vitest';

const { lookup } = vi.hoisted(() => ({
  lookup: vi.fn<
    (
      hostname: string,
      options: { all: true }
    ) => Promise<Array<{ address: string; family: number }>>
  >(),
}));

vi.mock('node:dns/promises', () => ({ default: { lookup } }));

import {
  isBlockedIp,
  isSafePublicHttpsUrl,
} from '../../libraries/nestjs-libraries/src/dtos/webhooks/webhook.url.validator';

beforeEach(() => {
  lookup.mockReset();
});

describe('webhook address classification', () => {
  it.each([
    '127.0.0.1',
    '10.0.0.1',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '::1',
    'fc00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
    '::ffff:7f00:1',
    '64:ff9b::7f00:1',
    '2002:7f00:1::',
    'not-an-ip',
  ])('blocks non-public or invalid address %s', (address) => {
    expect(isBlockedIp(address)).toBe(true);
  });

  it.each(['8.8.8.8', '2606:4700:4700::1111'])(
    'accepts public address %s',
    (address) => expect(isBlockedIp(address)).toBe(false)
  );
});

describe('webhook HTTPS destinations', () => {
  it.each([
    undefined,
    null,
    '',
    'invalid-url',
    'http://8.8.8.8',
    'https://localhost',
    'https://127.1',
    'https://[::ffff:127.0.0.1]',
  ])('rejects %s without resolving DNS', async (url) => {
    expect(await isSafePublicHttpsUrl(url)).toBe(false);
    expect(lookup).not.toHaveBeenCalled();
  });

  it('validates a public literal without DNS or an HTTP request', async () => {
    expect(await isSafePublicHttpsUrl('https://8.8.8.8/webhook')).toBe(true);
    expect(lookup).not.toHaveBeenCalled();
  });

  it('requires every resolved address to be public', async () => {
    lookup.mockResolvedValue([
      { address: '8.8.8.8', family: 4 },
      { address: '169.254.169.254', family: 4 },
    ]);
    expect(await isSafePublicHttpsUrl('https://mixed.example.test')).toBe(false);
    expect(lookup).toHaveBeenCalledWith('mixed.example.test', { all: true });
  });

  it('accepts public-only DNS results', async () => {
    lookup.mockResolvedValue([
      { address: '8.8.8.8', family: 4 },
      { address: '2606:4700:4700::1111', family: 6 },
    ]);
    expect(await isSafePublicHttpsUrl('https://public.example.test')).toBe(true);
  });

  it('fails closed when DNS returns no addresses', async () => {
    lookup.mockResolvedValue([]);
    expect(await isSafePublicHttpsUrl('https://empty.example.test')).toBe(false);
  });

  it('fails closed on DNS failure', async () => {
    lookup.mockRejectedValue(new Error('synthetic lookup failure'));
    expect(await isSafePublicHttpsUrl('https://failed.example.test')).toBe(false);
  });
});
