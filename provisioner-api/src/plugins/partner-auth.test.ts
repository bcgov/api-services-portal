import { test } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { registerPartnerAuth } from './partner-auth.js';
import errorHandler from './error-handler.js';

const config = { issuer: 'https://issuer.example', audience: 'sdx', jwksUrl: 'https://issuer.example/keys', requiredScope: 'sdx:partner' };

test('partner authentication validates signature, claims and scope before handlers', async (t) => {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const jwk = await exportJWK(publicKey);
  const app = Fastify();
  await app.register(errorHandler);
  registerPartnerAuth(app, config, createLocalJWKSet({ keys: [{ ...jwk, kid: 'test', alg: 'RS256' }] }));
  let calls = 0;
  app.get('/partner', async () => { calls++; return { ok: true }; });
  t.after(() => app.close());
  const token = (overrides = {}, signingKey = privateKey) => new SignJWT({ scope: config.requiredScope, ...overrides })
    .setProtectedHeader({ alg: 'RS256', kid: 'test' }).setIssuer(config.issuer)
    .setAudience(config.audience).setSubject('css').setIssuedAt().setExpirationTime('5m').sign(signingKey);
  const wrongKey = (await generateKeyPair('RS256')).privateKey;
  const cases: [string | undefined, number][] = [
    [undefined, 401], ['Basic abc', 401], ['Bearer garbage', 401],
    [`Bearer ${await token({}, wrongKey)}`, 401],
    [`Bearer ${await new SignJWT({ scope: config.requiredScope }).setProtectedHeader({ alg: 'RS256', kid: 'test' }).setIssuer(config.issuer).setAudience(config.audience).setSubject('css').setIssuedAt().setExpirationTime(1).sign(privateKey)}`, 401],
    [`Bearer ${await token({ scope: 'other' })}`, 403],
    [`Bearer ${await token()}`, 200],
  ];
  for (const [claim, value] of [['iss', 'wrong'], ['aud', 'wrong']] as const) {
    const claims = { iss: config.issuer, aud: config.audience, sub: 'css', iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000)+300, scope: config.requiredScope, [claim]: value };
    cases.push([`Bearer ${await new SignJWT(claims).setProtectedHeader({ alg: 'RS256', kid: 'test' }).sign(privateKey)}`, 401]);
  }
  for (const [authorization, status] of cases) {
    const res = await app.inject({ url: '/partner', headers: authorization ? { authorization } : {} });
    assert.equal(res.statusCode, status);
    if (status === 401) assert.match(res.headers['www-authenticate'] as string, /^Bearer/);
    if (status >= 400) assert.equal(res.json().status, status);
  }
  assert.equal(calls, 1);
});

test('partner configuration fails closed', () => {
  assert.throws(() => registerPartnerAuth(Fastify(), { ...config, audience: '' }));
  assert.throws(() => registerPartnerAuth(Fastify(), { ...config, jwksUrl: 'ftp://issuer.example/keys' }));
});

test('empty required scope accepts a valid scopeless token but still rejects wrong audience', async (t) => {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const app = Fastify();
  await app.register(errorHandler);
  registerPartnerAuth(app, { ...config, requiredScope: '' }, createLocalJWKSet({ keys: [{ ...await exportJWK(publicKey), kid: 'test' }] }));
  app.get('/partner', async () => ({ ok: true }));
  t.after(() => app.close());
  for (const [audience, status] of [[config.audience, 200], ['wrong', 401]] as const) {
    const token = await new SignJWT({}).setProtectedHeader({ alg: 'RS256', kid: 'test' })
      .setIssuer(config.issuer).setAudience(audience).setSubject('css-partner').setIssuedAt().setExpirationTime('5m').sign(privateKey);
    assert.equal((await app.inject({ url: '/partner', headers: { authorization: `Bearer ${token}` } })).statusCode, status);
  }
  assert.equal((await app.inject('/partner')).statusCode, 401);
});


test('HTTP JWKS is allowed only in explicit development or test mode', () => {
  const previousMode = process.env.NODE_ENV;
  const local = {
    ...config,
    issuer: 'http://localhost:8080/realms/demo',
    jwksUrl: 'http://localhost:8080/realms/demo/protocol/openid-connect/certs',
  };
  try {
    for (const mode of ['development', 'test']) {
      process.env.NODE_ENV = mode;
      assert.doesNotThrow(() => registerPartnerAuth(Fastify(), local));
      assert.doesNotThrow(() => registerPartnerAuth(Fastify(), {
        ...local, jwksUrl: 'http://keycloak:9081/custom-realm/keys',
      }));
      assert.throws(() => registerPartnerAuth(Fastify(), { ...local, jwksUrl: 'ftp://localhost/keys' }));
    }
    for (const mode of ['production', 'staging', '']) {
      process.env.NODE_ENV = mode;
      assert.throws(() => registerPartnerAuth(Fastify(), local));
      assert.doesNotThrow(() => registerPartnerAuth(Fastify(), config));
    }
    delete process.env.NODE_ENV;
    assert.throws(() => registerPartnerAuth(Fastify(), local));
  } finally {
    if (previousMode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousMode;
  }
});
