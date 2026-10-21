import { describe, expect, it } from 'vitest';
import {
  extractBasicCredentials,
  extractBearerToken,
  generateProtectedResourceMetadata,
  generateWWWAuthenticateHeader,
} from '../../libraries/nestjs-libraries/src/chat/oauth-types';

describe('OAuth request headers', () => {
  it.each([undefined, null, '', 'Basic abc', 'Bearer', 'Bearer   '])(
    'does not derive a bearer token from %s',
    (header) => expect(extractBearerToken(header)).toBeUndefined()
  );

  it('accepts a case-insensitive bearer scheme and trims the credential', () => {
    expect(extractBearerToken('bEaReR   synthetic-token  ')).toBe(
      'synthetic-token'
    );
  });

  it('decodes URL-encoded Basic credentials after splitting the separator', () => {
    const encoded = Buffer.from('client%3Aid:secret%3Avalue').toString('base64');
    expect(extractBasicCredentials(`bAsIc ${encoded}`)).toEqual({
      clientId: 'client:id',
      clientSecret: 'secret:value',
    });
  });

  it.each([':secret', 'no-separator', 'client:%GG'])(
    'rejects missing or malformed Basic credentials: %s',
    (value) => {
      const encoded = Buffer.from(value).toString('base64');
      expect(extractBasicCredentials(`Basic ${encoded}`)).toBeUndefined();
    }
  );

  it.each([undefined, null, '', 'Bearer synthetic-token', 'Basic '])(
    'does not accept %s as client credentials',
    (header) => expect(extractBasicCredentials(header)).toBeUndefined()
  );
});

describe('OAuth challenges and discovery', () => {
  it('produces a bare challenge when no metadata is supplied', () => {
    expect(generateWWWAuthenticateHeader()).toBe('Bearer');
  });

  it('escapes quoted header parameters', () => {
    expect(
      generateWWWAuthenticateHeader({
        additionalParams: { error_description: 'a"b\\c' },
      })
    ).toBe('Bearer error_description="a\\"b\\\\c"');
  });

  it('advertises header authentication and the configured resource', () => {
    expect(
      generateProtectedResourceMetadata({
        resource: 'https://resource.example.test',
        authorizationServers: ['https://auth.example.test'],
      })
    ).toEqual({
      resource: 'https://resource.example.test',
      authorization_servers: ['https://auth.example.test'],
      scopes_supported: ['mcp:read', 'mcp:write'],
      bearer_methods_supported: ['header'],
    });
  });

  it('does not replace an explicitly empty scope list with broader defaults', () => {
    expect(
      generateProtectedResourceMetadata({
        resource: 'https://resource.example.test',
        authorizationServers: [],
        scopesSupported: [],
      }).scopes_supported
    ).toEqual([]);
  });
});
