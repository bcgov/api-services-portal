const {
  EnforcementPoint,
  loadRulesAndWatch,
} = require('../../authz/enforcement');

const authorizeField = (role, fieldKey, operation) =>
  EnforcementPoint({
    listKey: 'ConnectionRequest',
    fieldKey,
    gqlName: 'allConnectionRequests',
    operation,
    itemId: undefined,
    itemIds: [],
    originalInput: {},
    authentication: {
      item: {
        id: 'test-user',
        userId: 'test-user',
        username: 'test-user',
        roles: JSON.stringify([role]),
        scopes: '',
        namespace: '',
      },
    },
    context: { baseQueryName: 'allConnectionRequests' },
  });

beforeAll(async () => {
  loadRulesAndWatch(false);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (authorizeField('system-admin', 'isActive', 'read') === true) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  throw new Error('Authorization matrix did not load');
});

describe('ConnectionRequest lifecycle field authorization', () => {
  test.each([
    ['subsystem-manager', 'read'],
    ['system-admin', 'read'],
    ['connection-manager', 'read'],
    ['subsystem-manager', 'create'],
    ['system-admin', 'create'],
    ['subsystem-manager', 'update'],
    ['system-admin', 'update'],
    ['connection-manager', 'update'],
  ])('%s can %s lifecycle fields', (role, operation) => {
    expect(authorizeField(role, 'proposedConfiguration', operation)).toBe(
      true
    );
    expect(authorizeField(role, 'lifecycleIntent', operation)).toBe(true);
  });
});
