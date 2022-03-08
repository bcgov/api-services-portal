import jwt, { UnauthorizedError } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { Logger } from '../logger';
import express from 'express';
import Keycloak from 'keycloak-connect';
import GetRequestAuthToken from './auth-token';

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
  getToken: (req) => GetRequestAuthToken(req),
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
  return new Promise((resolve: any, reject: any) => {
    verifyJWT(request, null, (err: any) => {
      if (err) {
        logger.debug('ERROR Verifying JWT ' + err);
        return reject(err);
      } else {
        logger.debug('RESOLVED %j', request.oauth_user);

        if (scopes.length == 0) {
          return resolve(request.oauth_user);
        }
        const resource =
          'orgUnit' in request.params
            ? `org/${request.params.orgUnit}`
            : 'org' in request.params
            ? `org/${request.params.org}`
            : `${request.params.ns}`;

        const permissions: string[] =
          scopes.length == 1
            ? [`${resource}:${scopes[0]}`]
            : scopes.map((s) => `${resource}:${s}`);

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

        const resp: any = keycloak.enforcer(permissions)(
          request,
          {
            status: (s: number) => {
              logger.error('invalid_token (%d) for %j', s, request.oauth_user);
              reject(
                new UnauthorizedError('invalid_token', {
                  message: `Missing authorization scope. (${s})`,
                })
              );
            },
            end: (text: string) => false,
          } as any,
          (authzerr: any) => {
            if (authzerr) {
              reject(
                new UnauthorizedError('invalid_token', {
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
