require('reflect-metadata');

// express-jwt's JWT verification is stubbed so tests control whether the
// caller's token "verifies" without doing any real crypto/network work.
let mockVerifyJWTImpl;
jest.mock('express-jwt', () => {
  const mockJwt = jest.fn(() => (request, _response, callback) => {
    mockVerifyJWTImpl(request, callback);
  });
  return Object.assign(mockJwt, {
    UnauthorizedError: class UnauthorizedError extends Error {},
  });
});

jest.mock('jwks-rsa', () => ({
  expressJwtSecret: jest.fn(() => 'secret-callback'),
}));

// keycloak-connect's enforcer is stubbed so tests control, per permission
// string, whether that single scope check passes or fails - this is the
// piece that used to run N-at-a-time (racing) for stacked @Security
// decorators and now runs one at a time, in order, via authorizeAnyScope.
let mockEnforcerImpl;
const mockEnforcer = jest.fn((permissions) => (request, response, next) => {
  mockEnforcerImpl(permissions, request, response, next);
});
jest.mock('keycloak-connect', () =>
  jest.fn().mockImplementation(() => ({ enforcer: mockEnforcer }))
);

const mockAuthMiddle = {
  lookupGatewayId: jest.fn(),
  lookupSubsystemManageGatewayId: jest.fn(),
  getPermittedNamespacesForScope: jest.fn(),
};
jest.mock('tsyringe', () => ({
  container: { resolve: jest.fn(() => mockAuthMiddle) },
  inject: () => () => {},
  injectable: () => () => {},
}));

// auth-sdx-middle.ts and keystoneInjector.ts both use tsyringe's
// @injectable()/@inject() decorators, which this jest/babel setup isn't
// configured to parse. auth-tsoa.ts only needs AuthMiddle/KeystoneService
// as identifiers (container.resolve(AuthMiddle) and a type reference,
// respectively), never their real implementations, so stub both modules
// out entirely rather than let babel try to parse the real decorated
// classes.
jest.mock('../../auth/auth-sdx-middle', () => ({ AuthMiddle: class {} }));
jest.mock('../../controllers/ioc/keystoneInjector', () => ({
  KeystoneService: class {},
}));

const { expressAuthentication } = require('../../auth/auth-tsoa');

function makeRequest(overrides = {}) {
  return {
    params: { org: 'test-org' },
    query: {},
    body: {},
    headers: { authorization: 'Bearer faketoken' },
    ...overrides,
  };
}

describe('expressAuthentication - multi-scope OR', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyJWTImpl = (request, callback) => {
      request.oauth_user = { sub: 'user-1', scope: 'System.Manage Subsystem.Manage' };
      callback();
    };
    // Org-scoped System.Manage never needs a gateway lookup.
    mockAuthMiddle.lookupSubsystemManageGatewayId.mockResolvedValue(undefined);
  });

  it('tries scopes in declared order and short-circuits on the first success', async () => {
    mockEnforcerImpl = (permissions, request, response, next) => {
      if (permissions[0] === 'org/test-org:System.Manage') {
        return next();
      }
      throw new Error(`unexpected permission check: ${permissions[0]}`);
    };

    const request = makeRequest();
    const user = await expressAuthentication(request, 'jwt', [
      'System.Manage',
      'Subsystem.Manage',
    ]);

    expect(user.scope).toBe('System.Manage');
    expect(mockEnforcer).toHaveBeenCalledTimes(1);
    // The cheaper System.Manage check won, so Subsystem.Manage's gateway
    // resolution should never have run - proving no wasted work, unlike
    // the old concurrent/racing behavior where every branch always ran.
    expect(
      mockAuthMiddle.lookupSubsystemManageGatewayId
    ).not.toHaveBeenCalled();
  });

  it('falls through to the next scope when the first one fails', async () => {
    mockAuthMiddle.lookupSubsystemManageGatewayId.mockResolvedValue(
      'gw-namespace-1'
    );
    mockEnforcerImpl = (permissions, request, response, next) => {
      if (permissions[0] === 'org/test-org:System.Manage') {
        return response.status(403);
      }
      if (permissions[0] === 'gw-namespace-1:Subsystem.Manage') {
        return next();
      }
      throw new Error(`unexpected permission check: ${permissions[0]}`);
    };

    const request = makeRequest({ params: { org: 'test-org', name: 'svc-1' } });
    const user = await expressAuthentication(request, 'jwt', [
      'System.Manage',
      'Subsystem.Manage',
    ]);

    expect(user.scope).toBe('Subsystem.Manage');
    expect(mockEnforcer).toHaveBeenCalledTimes(2);
  });

  it('rejects with a single ForbiddenError describing every scope tried when all fail', async () => {
    mockAuthMiddle.lookupSubsystemManageGatewayId.mockResolvedValue(
      'gw-namespace-1'
    );
    mockEnforcerImpl = (permissions, request, response) => {
      response.status(403);
    };

    const request = makeRequest({ params: { org: 'test-org', name: 'svc-1' } });

    await expect(
      expressAuthentication(request, 'jwt', ['System.Manage', 'Subsystem.Manage'])
    ).rejects.toMatchObject({
      status: 403,
      message: expect.stringContaining('System.Manage'),
    });

    await expect(
      expressAuthentication(request, 'jwt', ['System.Manage', 'Subsystem.Manage'])
    ).rejects.toMatchObject({
      message: expect.stringContaining('Subsystem.Manage'),
    });
  });

  it('behaves the same as a plain single-scope check when only one scope is declared', async () => {
    mockEnforcerImpl = (permissions, request, response, next) => next();

    const request = makeRequest();
    const user = await expressAuthentication(request, 'jwt', ['System.Manage']);

    expect(user.scope).toBe('System.Manage');
    expect(mockEnforcer).toHaveBeenCalledTimes(1);
    expect(mockEnforcer).toHaveBeenCalledWith(['org/test-org:System.Manage']);
  });

  it('rejects immediately on an invalid JWT without attempting any scope checks', async () => {
    mockVerifyJWTImpl = (request, callback) => callback(new Error('bad token'));

    const request = makeRequest();

    await expect(
      expressAuthentication(request, 'jwt', ['System.Manage', 'Subsystem.Manage'])
    ).rejects.toThrow('bad token');
    expect(mockEnforcer).not.toHaveBeenCalled();
  });

  it('resolves via UMA2 discovery for the list case when Subsystem.Manage has no single resource', async () => {
    mockAuthMiddle.lookupSubsystemManageGatewayId.mockResolvedValue(undefined);
    mockAuthMiddle.getPermittedNamespacesForScope.mockResolvedValue([
      'gw-namespace-1',
    ]);
    mockEnforcerImpl = (permissions, request, response) => {
      // System.Manage is tried first and fails, falling through to
      // Subsystem.Manage's discovery-based check.
      response.status(403);
    };

    const request = makeRequest();
    const user = await expressAuthentication(request, 'jwt', [
      'System.Manage',
      'Subsystem.Manage',
    ]);

    expect(user.scope).toBe('Subsystem.Manage');
    expect(mockAuthMiddle.getPermittedNamespacesForScope).toHaveBeenCalledWith(
      request,
      ['Subsystem.Manage']
    );
  });
});
