jest.mock('../../../services/utils', () => ({
  fetchWithTimeout: jest.fn(),
}));

jest.mock('dns', () => ({
  promises: {
    lookup: jest.fn(),
  },
}));

const dns = require('dns');
const { fetchWithTimeout } = require('../../../services/utils');
const {
  IsJWKSURLValid,
} = require('../../../services/workflow/update-credential');

describe('IsJWKSURLValid', function () {
  beforeEach(() => {
    jest.clearAllMocks();
    dns.promises.lookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
  });

  it('accepts an https JWKS document from a public host', async function () {
    fetchWithTimeout.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ keys: [] }),
      headers: { get: () => null },
    });

    await expect(
      IsJWKSURLValid('https://example.com/.well-known/jwks.json')
    ).resolves.toBe(true);
  });

  it('rejects non-https urls', async function () {
    await expect(
      IsJWKSURLValid('http://example.com/.well-known/jwks.json')
    ).resolves.toBe(false);
    expect(fetchWithTimeout).not.toHaveBeenCalled();
  });

  it('rejects loopback and private destinations', async function () {
    await expect(IsJWKSURLValid('https://127.0.0.1/jwks.json')).resolves.toBe(
      false
    );
    await expect(IsJWKSURLValid('https://10.0.0.5/jwks.json')).resolves.toBe(
      false
    );
    await expect(IsJWKSURLValid('https://192.168.1.10/jwks.json')).resolves.toBe(
      false
    );
    expect(fetchWithTimeout).not.toHaveBeenCalled();
  });

  it('rejects hosts that resolve to private addresses', async function () {
    dns.promises.lookup.mockResolvedValue([{ address: '10.1.2.3', family: 4 }]);

    await expect(
      IsJWKSURLValid('https://internal.example.com/jwks.json')
    ).resolves.toBe(false);
    expect(fetchWithTimeout).not.toHaveBeenCalled();
  });

  it('re-validates redirect targets before following them', async function () {
    fetchWithTimeout
      .mockResolvedValueOnce({
        status: 302,
        ok: false,
        headers: {
          get: (name) =>
            name === 'location' ? 'https://example.com/final-jwks.json' : null,
        },
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ keys: [] }),
        headers: { get: () => null },
      });

    await expect(
      IsJWKSURLValid('https://example.com/start-jwks.json')
    ).resolves.toBe(true);
    expect(fetchWithTimeout).toHaveBeenCalledTimes(2);
    expect(fetchWithTimeout.mock.calls[0][1]).toEqual(
      expect.objectContaining({ redirect: 'manual' })
    );
  });

  it('rejects redirects to private destinations', async function () {
    fetchWithTimeout.mockResolvedValueOnce({
      status: 302,
      ok: false,
      headers: {
        get: (name) =>
          name === 'location' ? 'https://127.0.0.1/jwks.json' : null,
      },
    });

    await expect(
      IsJWKSURLValid('https://example.com/start-jwks.json')
    ).resolves.toBe(false);
  });
});
