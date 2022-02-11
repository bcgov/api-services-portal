import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { Logger } from '../logger';
import express from 'express';
import Keycloak from 'keycloak-connect';

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
        // Check if JWT contains all required scopes
        const tokenScopes = request.oauth_user.scope.split(' ');
        logger.debug('Token Scopes = %s', tokenScopes);
        if (scopes.length == 0) {
          return resolve(request.oauth_user);
        }
        const permission =
          securityName === 'jwt-org'
            ? `org/${request.params.org}:${scopes[0]}`
            : `${request.params.ns}:${scopes[0]}`;

        logger.debug(
          "[%s] Resource Authorization on '%s'",
          securityName,
          permission
        );

        const resp: any = keycloak.enforcer(permission)(
          request,
          {
            status: (s: number) => {
              reject(new Error('JWT does not contain required scope.'));
            },
            end: (text: string) => false,
          } as any,
          (authzerr: any) => {
            if (authzerr) {
              reject(new Error('Access Denied'));
            } else {
              resolve({ ...request.oauth_user, ...{ scope: scopes[0] } });
            }
          }
        );
      }
    });
  });
}
