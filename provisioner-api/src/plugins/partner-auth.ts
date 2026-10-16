import type { FastifyInstance } from 'fastify';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { ForbiddenError, UnauthorizedError } from '../errors/api-errors.js';

export interface PartnerAuthConfig {
  issuer: string;
  audience: string;
  jwksUrl: string;
  requiredScope: string;
}

export function partnerAuthConfig(): PartnerAuthConfig {
  const required = (name: string): string => {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`${name} is required for the partner listener`);
    return value;
  };
  return {
    issuer: required('PARTNER_JWT_ISSUER'),
    audience: required('PARTNER_JWT_AUDIENCE'),
    jwksUrl: required('PARTNER_JWT_JWKS_URL'),
    requiredScope: required('PARTNER_JWT_REQUIRED_SCOPE'),
  };
}

export function registerPartnerAuth(
  app: FastifyInstance,
  config: PartnerAuthConfig,
  key?: JWTVerifyGetKey
): void {
  if (!config.issuer || !config.audience || !config.requiredScope) {
    throw new Error('Partner issuer, audience and scope must be configured');
  }
  const url = new URL(config.jwksUrl);
  if (url.protocol !== 'https:') throw new Error('Partner JWKS URL must use HTTPS');
  const getKey = key ?? createRemoteJWKSet(url);
  app.addHook('onRequest', async (request, reply) => {
    const match = /^Bearer ([^\s]+)$/i.exec(request.headers.authorization ?? '');
    if (!match) {
      reply.header('WWW-Authenticate', 'Bearer');
      throw new UnauthorizedError('A bearer token is required');
    }
    let payload;
    try {
      ({ payload } = await jwtVerify(match[1], getKey, {
        issuer: config.issuer,
        audience: config.audience,
        algorithms: ['RS256'],
        requiredClaims: ['exp', 'iat', 'sub'],
      }));
    } catch {
      reply.header('WWW-Authenticate', 'Bearer error="invalid_token"');
      throw new UnauthorizedError('Invalid bearer token');
    }
    const scopes = typeof payload.scope === 'string' ? payload.scope.split(' ') : [];
    if (!scopes.includes(config.requiredScope)) {
      throw new ForbiddenError('Required partner scope is missing');
    }
  });
}
