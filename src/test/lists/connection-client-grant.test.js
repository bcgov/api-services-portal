const grantList = require('../../lists/ConnectionClientGrant');

describe('ConnectionClientGrant list', () => {
  const resolveInput = grantList.hooks.resolveInput;

  it('normalizes identities, requester details, and scopes on create', () => {
    const resolved = resolveInput({
      operation: 'create',
      existingItem: undefined,
      resolvedData: {
        integrationId: ' integration-1 ',
        oauthClientId: ' oauth-client-1 ',
        requesterDetails: { name: 'Requester' },
        scopes: ['write', 'read', 'write'],
      },
    });

    expect(resolved).toMatchObject({
      integrationId: 'integration-1',
      oauthClientId: 'oauth-client-1',
      requesterDetails: '{"name":"Requester"}',
      scopes: '["read","write"]',
    });
  });

  it('returns an approved grant to pending when scopes change', () => {
    const resolved = resolveInput({
      operation: 'update',
      existingItem: { scopes: '["read"]', status: 'approved' },
      resolvedData: { scopes: ['write'] },
    });

    expect(resolved).toEqual({ scopes: '["write"]', status: 'pending' });
  });

  it('does not reset approval when normalized scopes are unchanged', () => {
    const resolved = resolveInput({
      operation: 'update',
      existingItem: { scopes: '["read","write"]', status: 'approved' },
      resolvedData: { scopes: ['write', 'read', 'write'] },
    });

    expect(resolved).toEqual({ scopes: '["read","write"]' });
  });

  it('returns an approved grant to pending when the reviewed version changes', () => {
    const resolved = resolveInput({
      operation: 'update',
      existingItem: {
        requesterDetails: '{"service":{"version":"1.0.0"}}',
        status: 'approved',
      },
      resolvedData: {
        requesterDetails: { service: { version: '2.0.0' } },
      },
    });

    expect(resolved).toEqual({
      requesterDetails: '{"service":{"version":"2.0.0"}}',
      status: 'pending',
    });
  });

  it('preserves approval when only requester contact details change', () => {
    const resolved = resolveInput({
      operation: 'update',
      existingItem: {
        requesterDetails:
          '{"requester":{"name":"Before"},"service":{"version":"1.0.0"}}',
        status: 'approved',
      },
      resolvedData: {
        requesterDetails: {
          requester: { name: 'After' },
          service: { version: '1.0.0' },
        },
      },
    });

    expect(resolved).toEqual({
      requesterDetails:
        '{"requester":{"name":"After"},"service":{"version":"1.0.0"}}',
    });
  });

  it('returns a rejected grant to pending for a new submission', () => {
    const resolved = resolveInput({
      operation: 'update',
      existingItem: {
        submissionId: 'submission-1',
        status: 'rejected',
      },
      resolvedData: { submissionId: ' submission-2 ' },
    });

    expect(resolved).toEqual({
      submissionId: 'submission-2',
      status: 'pending',
    });
  });

  it('accepts the existing parent connection and removes the redundant write', () => {
    const resolved = resolveInput({
      operation: 'update',
      existingItem: { connection: '42', scopes: '[]' },
      resolvedData: {
        connection: { connect: { id: '42' } },
        requesterDetails: {},
      },
    });

    expect(resolved).toEqual({ requesterDetails: '{}' });
  });

  it('rejects moving a grant to another parent connection', () => {
    expect(() =>
      resolveInput({
        operation: 'update',
        existingItem: { connection: '42', scopes: '[]' },
        resolvedData: {
          connection: { connect: { id: '99' } },
        },
      })
    ).toThrow('connection cannot be changed');
  });

  it('builds a stable slug from a relationship connect input', () => {
    const slug = grantList.fields.slug.generate({
      resolvedData: {
        connection: { connect: { id: '42' } },
        integrationId: 'integration-1',
        oauthClientId: 'oauth-client-1',
      },
      existingItem: undefined,
    });

    expect(slug).toBe('42::integration-1::oauth-client-1');
  });
  it.each([['not-an-array'], [['']], [[null]], [[42]]])(
    'rejects malformed scopes %j',
    (scopes) => {
      expect(() =>
        resolveInput({
          operation: 'create',
          existingItem: undefined,
          resolvedData: { scopes },
        })
      ).toThrow();
    }
  );

  it('rejects blank grant identities', () => {
    expect(() =>
      resolveInput({
        operation: 'create',
        existingItem: undefined,
        resolvedData: {
          integrationId: ' ',
          oauthClientId: 'client',
          scopes: [],
        },
      })
    ).toThrow('integrationId must not be blank');
  });
});
