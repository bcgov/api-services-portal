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

export function expressAuthentication(
  request: any,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  const authMiddle = container.resolve(AuthMiddle);

  return new Promise(async (resolve: any, reject: any) => {
    let sdxGatewayId: string;

    if (scopes?.find((s) => s === 'GatewayPattern.Publish')) {
      const gatewayId = await authMiddle.lookupGatewayId(
        request.params.org,
        request.params.pattern,
        request.body
      );
      if (gatewayId) {
        sdxGatewayId = gatewayId;
      } else {
        return reject(
          new ForbiddenError('permission_denied', {
            message: `Unable to find gateway detail from pattern '${request.params.pattern}'`,
          })
        );
      }
    } else if (scopes?.find((s) => s === 'Connection.Manage')) {
      // Approval (and any other serviceId-bearing call) resolves to that
      // service's gateway. Listing has no serviceId to resolve from and is
      // handled below via a discovery-based check instead.
      if (request.body?.serviceId) {
        const gatewayId = await authMiddle.lookupGatewayId(
          request.params.org,
          request.params.pattern,
          request.body
        );
        if (gatewayId) {
          sdxGatewayId = gatewayId;
        } else {
          return reject(
            new ForbiddenError('permission_denied', {
              message: `Unable to find gateway detail for service '${request.body.serviceId}'`,
            })
          );
        }
      }
    } else if (scopes?.find((s) => s === 'Subsystem.Manage')) {
      // oas-services get/spec/delete resolve to that service's own gateway (`name`);
      // oas-services create resolves to the target subsystem's gateway (`subsystem`);
      // connection create resolves via `body.serviceId`; connection delete resolves
      // via `id`, looked up to that connection's own serviceId. List (either
      // endpoint) has no identifying resource and is handled below via a
      // discovery-based check instead.
      sdxGatewayId = await authMiddle.lookupSubsystemManageGatewayId(
        request.params.org,
        request.params.name,
        request.query?.subsystem,
        request.body?.serviceId,
        request.params.id
      );
    }

    verifyJWT(request, null, async (err: any) => {
      if (err) {
        logger.debug('ERROR Verifying JWT ' + err);
        return reject(err);
      } else {
        logger.debug('RESOLVED %j', request.oauth_user);

        if (scopes.length == 0) {
          return resolve(request.oauth_user);
        }

        const discoveryScope = scopes.find(
          (s) => s === 'Subsystem.Manage' || s === 'Connection.Manage'
        );
        if (discoveryScope && !sdxGatewayId) {
          // List has no single resource to check against - "authorized" here
          // means "holds this scope on at least one gateway." The controller
          // independently re-discovers and filters by that same set to
          // decide what to actually return.
          const namespaces = await authMiddle.getPermittedNamespacesForScope(
            request,
            [discoveryScope]
          );
          if (namespaces.length === 0) {
            return reject(
              new ForbiddenError('permission_denied', {
                message: `Missing required scope: ${discoveryScope}`,
              })
            );
          }
          return resolve({ ...request.oauth_user, scope: discoveryScope });
        }

        let resource: string;
        if (sdxGatewayId) {
          resource = sdxGatewayId;
        } else if ('orgUnit' in request.params) {
          resource = `org/${request.params.orgUnit}`;
        } else if ('org' in request.params) {
          resource = `org/${request.params.org}`;
        } else if ('gatewayId' in request.params) {
          resource = request.params.gatewayId;
        } else if ('gatewayId' in request.query) {
          resource = request.query.gatewayId;
        } else {
          // assume it is namespace-based protection
          resource = request.params.ns;
        }

        const permissions: string[] = scopes.map((s) => `${resource}:${s}`);

        logger.debug(
          "[%s] Resource Authorization on '%j'",
          securityName,
          permissions
        );

        // keycloak enforcer() needs the subject_token to be the "Authorization: Bearer"
        // so ensure that this is set; is applicable when the user has authenticated via the Portal
        request.headers.authorization = `Bearer ${GetRequestAuthToken(
          request
        )}`;

        keycloak.enforcer(permissions)(
          request,
          {
            status: (s: number) => {
              logger.error(
                'permission_denied (%d) [%j] for %j',
                s,
                permissions,
                request.oauth_user
              );
              reject(
                new ForbiddenError('permission_denied', {
                  message: `Missing required scope: ${permissions.join(', ')}`,
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

              resolve({ ...request.oauth_user, ...{ scope: scopes[0] } });
            }
          }
        );
      }
    });
  });
}
