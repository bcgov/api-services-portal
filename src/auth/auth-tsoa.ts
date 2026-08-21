import jwt, { UnauthorizedError } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { Logger } from '../logger';
import express from 'express';
import Keycloak from 'keycloak-connect';
import GetRequestAuthToken from './auth-token';
import { ForbiddenError } from './forbidden-error';
import { KeystoneService } from '../controllers/ioc/keystoneInjector';
import { container, inject, injectable } from 'tsyringe';
import { AuthMiddle } from './auth-sdx-middle';

const logger = Logger('auth-tsoa');

const jwtCheck = jwksRsa.expressJwtSecret({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: process.env.JWKS_URL,
});

const verifyJWT = jwt({
  secret: jwtCheck,
  algorithms: ['RS256'],
  getToken: (req: any) => GetRequestAuthToken(req),
  credentialsRequired: true,
  requestProperty: 'oauth_user',
});

let kcConfig: any = {
  clientId: process.env.GWA_RES_SVR_CLIENT_ID,
  secret: process.env.GWA_RES_SVR_CLIENT_SECRET,
  public: false,
  bearerOnly: true,
  serverUrl: process.env.KEYCLOAK_AUTH_URL,
  realm: process.env.KEYCLOAK_REALM,
  verifyTokenAudience: false,
};

let keycloak = new Keycloak({}, kcConfig);

/**
 * Resolves the specific gateway namespace resource that `scope` should be
 * checked against for this request, for the scopes that resolve dynamically
 * per-request. Returns undefined for scopes with no per-request resource
 * resolution (e.g. `System.Manage`, resolved generically in
 * `resolveGenericResource` below) or for the list/discovery case (no
 * identifying resource on the request at all).
 *
 * Throws a `ForbiddenError` for the two cases where a resource is required
 * to even attempt the check but couldn't be resolved (`GatewayPattern.Publish`,
 * and `Connection.Manage` when a `serviceId` was supplied but doesn't resolve) -
 * this mirrors the original behavior of rejecting immediately rather than
 * falling through to a generic/discovery check that could never succeed.
 */
async function resolveGatewayIdForScope(
  request: any,
  authMiddle: AuthMiddle,
  scope: string
): Promise<string | undefined> {
  if (scope === 'GatewayPattern.Publish') {
    const gatewayId = await authMiddle.lookupGatewayId(
      request.params.org,
      request.params.pattern,
      request.body
    );
    if (!gatewayId) {
      throw new ForbiddenError('permission_denied', {
        message: `Unable to find gateway detail from pattern '${request.params.pattern}'`,
      });
    }
    return gatewayId;
  }

  if (scope === 'Connection.Manage') {
    // Approval (and any other serviceId-bearing call) resolves to that
    // service's gateway. Listing has no serviceId to resolve from and is
    // handled by the discovery-based check instead.
    if (!request.body?.serviceId) {
      return undefined;
    }
    const gatewayId = await authMiddle.lookupGatewayId(
      request.params.org,
      request.params.pattern,
      request.body
    );
    if (!gatewayId) {
      throw new ForbiddenError('permission_denied', {
        message: `Unable to find gateway detail for service '${request.body.serviceId}'`,
      });
    }
    return gatewayId;
  }

  if (scope === 'Subsystem.Manage') {
    // oas-services get/spec/delete resolve to that service's own gateway (`name`);
    // oas-services create resolves to the target subsystem's gateway (`subsystem`);
    // connection create resolves via `body.serviceId`; connection delete resolves
    // via `id`, looked up to that connection's own serviceId. List (either
    // endpoint) has no identifying resource and is handled by the
    // discovery-based check instead.
    return authMiddle.lookupSubsystemManageGatewayId(
      request.params.org,
      request.params.name,
      request.query?.subsystem,
      request.body?.serviceId,
      request.params.id
    );
  }

  return undefined;
}

function resolveGenericResource(request: any): string {
  if ('orgUnit' in request.params) {
    return `org/${request.params.orgUnit}`;
  } else if ('org' in request.params) {
    return `org/${request.params.org}`;
  } else if ('gatewayId' in request.params) {
    return request.params.gatewayId;
  } else if ('gatewayId' in request.query) {
    return request.query.gatewayId;
  }
  // assume it is namespace-based protection
  return request.params.ns;
}

/** Runs the keycloak UMA2 enforcer for a single `resource:scope` permission. */
function enforcePermission(
  request: any,
  securityName: string,
  permission: string,
  scope: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    logger.debug("[%s] Resource Authorization on '%j'", securityName, [
      permission,
    ]);

    // keycloak enforcer() needs the subject_token to be the "Authorization: Bearer"
    // so ensure that this is set; is applicable when the user has authenticated via the Portal
    request.headers.authorization = `Bearer ${GetRequestAuthToken(request)}`;

    keycloak.enforcer([permission])(
      request,
      {
        status: (s: number) => {
          logger.error(
            'permission_denied (%d) [%j] for %j',
            s,
            [permission],
            request.oauth_user
          );
          reject(
            new ForbiddenError('permission_denied', {
              message: `Missing required scope: ${permission}`,
            })
          );
        },
        end: (text: string) => false,
      } as any,
      (authzerr: any) => {
        if (authzerr) {
          reject(
            new ForbiddenError('permission_denied', {
              message: 'Denied access to resource',
            })
          );
        } else {
          logger.debug('Returned Permissions %j', request.permissions);
          resolve({ ...request.oauth_user, scope });
        }
      }
    );
  });
}

/**
 * Attempts authorization for a single scope, returning the resolved user on
 * success or throwing a `ForbiddenError` on failure. Used both for a single
 * required scope and, via `authorizeAnyScope` below, as one alternative of
 * several tried in order for a stacked/OR'd `@Security` requirement.
 */
async function authorizeScope(
  request: any,
  authMiddle: AuthMiddle,
  securityName: string,
  scope: string
): Promise<any> {
  const sdxGatewayId = await resolveGatewayIdForScope(
    request,
    authMiddle,
    scope
  );

  const isDiscoveryScope =
    scope === 'Subsystem.Manage' || scope === 'Connection.Manage';
  if (isDiscoveryScope && !sdxGatewayId) {
    // List has no single resource to check against - "authorized" here
    // means "holds this scope on at least one gateway." The controller
    // independently re-discovers and filters by that same set to decide
    // what to actually return.
    const namespaces = await authMiddle.getPermittedNamespacesForScope(
      request,
      [scope]
    );
    if (namespaces.length === 0) {
      throw new ForbiddenError('permission_denied', {
        message: `Missing required scope: ${scope}`,
      });
    }
    return { ...request.oauth_user, scope };
  }

  const resource = sdxGatewayId || resolveGenericResource(request);

  return enforcePermission(
    request,
    securityName,
    `${resource}:${scope}`,
    scope
  );
}

/**
 * Tries each scope in `scopes`, in order, stopping at the first one that
 * succeeds - a single, deterministic, sequential OR rather than tsoa's
 * default behavior of racing every stacked `@Security` decorator
 * concurrently via `Promise.any` (see routes.ts's generated
 * `authenticateMiddleware`). Sequential trial also means a request that's
 * authorized by an earlier, cheaper scope (e.g. org-wide `System.Manage`)
 * never pays for a later, more expensive one's lookups (e.g. `Subsystem.Manage`'s
 * gateway resolution + UMA2 discovery call).
 *
 * Throws a single `ForbiddenError` listing every scope that was tried if
 * none succeed, rather than an arbitrary "whichever attempt happened to
 * fail last" message.
 */
async function authorizeAnyScope(
  request: any,
  authMiddle: AuthMiddle,
  securityName: string,
  scopes: string[]
): Promise<any> {
  const failures: string[] = [];
  for (const scope of scopes) {
    try {
      return await authorizeScope(request, authMiddle, securityName, scope);
    } catch (err: any) {
      failures.push(`${scope} (${err?.message || err})`);
    }
  }

  throw new ForbiddenError('permission_denied', {
    message: `Missing required scope. Tried: ${failures.join('; ')}`,
  });
}

export function expressAuthentication(
  request: any,
  securityName: string,
  scopes: string[] = []
): Promise<any> {
  const authMiddle = container.resolve(AuthMiddle);

  return new Promise((resolve: any, reject: any) => {
    verifyJWT(request, null, async (err: any) => {
      if (err) {
        logger.debug('ERROR Verifying JWT ' + err);
        return reject(err);
      }

      logger.debug('RESOLVED %j', request.oauth_user);

      if (scopes.length === 0) {
        return resolve(request.oauth_user);
      }

      try {
        resolve(
          await authorizeAnyScope(request, authMiddle, securityName, scopes)
        );
      } catch (authzErr) {
        reject(authzErr);
      }
    });
  });
}
