import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  convertPath,
  convertPaths,
  convertOpenApiSpec,
  extractParams,
  isParameterized,
} from './openapi-to-kong-paths.js';

describe('Static paths (no parameters)', () => {
  const r = convertPath('/pets');
  it('kongPath equals plain path', () => assert.equal(r.kongPath, '/pets'));
  it('isRegex is false', () => assert.equal(r.isRegex, false));
  it('no parameters captured', () => assert.deepEqual(r.parameters, {}));

  it('root path unchanged', () => assert.equal(convertPath('/').kongPath, '/'));
  it('nested static path unchanged', () =>
    assert.equal(convertPath('/a/b/c').kongPath, '/a/b/c'));
});

describe('Single path parameter – Kong 3.x (default)', () => {
  const r = convertPath('/pets/{petId}');
  it('isRegex is true', () => assert.equal(r.isRegex, true));
  it('single param → named capture, ~ prefix, $ anchor', () =>
    assert.equal(r.kongPath, '~/pets/(?<petId>[^/]+)$'));
  it('parameter map populated', () =>
    assert.deepEqual(r.parameters, { petId: '[^/]+' }));
});

describe('Single path parameter – Kong 2.x', () => {
  it('no ~ prefix for Kong 2.x', () =>
    assert.equal(
      convertPath('/pets/{petId}', { kongVersion: 2 }).kongPath,
      '/pets/(?<petId>[^/]+)$'
    ));
});

describe('Multiple path parameters', () => {
  const r = convertPath('/users/{userId}/orders/{orderId}');
  it('two named capture groups', () =>
    assert.equal(
      r.kongPath,
      '~/users/(?<userId>[^/]+)/orders/(?<orderId>[^/]+)$'
    ));
  it('both params in parameter map', () =>
    assert.deepEqual(r.parameters, { userId: '[^/]+', orderId: '[^/]+' }));
});

describe('Path parameter in the middle', () => {
  it('static suffix preserved after param', () =>
    assert.equal(
      convertPath('/users/{userId}/profile').kongPath,
      '~/users/(?<userId>[^/]+)/profile$'
    ));
});

describe('Path parameter at root level', () => {
  it('param at start of path', () =>
    assert.equal(
      convertPath('/{version}/api').kongPath,
      '~/(?<version>[^/]+)/api$'
    ));
});

describe('greedyLastParam option (openapi-2-kong JS compat)', () => {
  it('last param uses \\S+ with greedyLastParam', () =>
    assert.equal(
      convertPath('/pets/{id}', { greedyLastParam: true }).kongPath,
      '~/pets/(?<id>\\S+)$'
    ));
  it('only last param is greedy', () =>
    assert.equal(
      convertPath('/a/{x}/b/{y}', { greedyLastParam: true }).kongPath,
      '~/a/(?<x>[^/]+)/b/(?<y>\\S+)$'
    ));
});

describe('Custom paramPattern', () => {
  it('custom digit-only pattern', () =>
    assert.equal(
      convertPath('/items/{id}', { paramPattern: '[0-9]+' }).kongPath,
      '~/items/(?<id>[0-9]+)$'
    ));
});

describe('trailingSlash: optional', () => {
  it('optional trailing slash appended', () =>
    assert.equal(
      convertPath('/pets/{petId}', { trailingSlash: 'optional' }).kongPath,
      '~/pets/(?<petId>[^/]+)\\/?$'
    ));

  const staticR = convertPath('/healthz', { trailingSlash: 'optional' });
  it('static path becomes regex when optional slash needed', () =>
    assert.equal(staticR.isRegex, true));
  it('static path with optional trailing slash', () =>
    assert.equal(staticR.kongPath, '~/healthz\\/?$'));
});

describe('trailingSlash: required', () => {
  it('required trailing slash appended', () =>
    assert.equal(
      convertPath('/pets/{petId}', { trailingSlash: 'required' }).kongPath,
      '~/pets/(?<petId>[^/]+)\\/$'
    ));

  const staticR = convertPath('/healthz', { trailingSlash: 'required' });
  it('static path with required slash', () =>
    assert.equal(staticR.kongPath, '/healthz/'));
  it('still plain prefix', () => assert.equal(staticR.isRegex, false));
});

describe('Special regex chars in static segments are escaped', () => {
  // A path that contains dots (common in versioning)
  it('dot in static segment is escaped', () =>
    assert.equal(
      convertPath('/v1.0/pets/{id}').kongPath,
      '~/v1\\.0/pets/(?<id>[^/]+)$'
    ));
});

describe('extractParams', () => {
  it('extracts params in order', () =>
    assert.deepEqual(extractParams('/users/{userId}/orders/{orderId}'), [
      'userId',
      'orderId',
    ]));
  it('no params → empty array', () =>
    assert.deepEqual(extractParams('/pets'), []));
});

describe('isParameterized', () => {
  it('parameterized path → true', () =>
    assert.equal(isParameterized('/pets/{id}'), true));
  it('static path → false', () =>
    assert.equal(isParameterized('/pets'), false));
});

describe('convertPaths (bulk)', () => {
  const results = convertPaths([
    '/pets',
    '/pets/{petId}',
    '/users/{uid}/orders/{oid}',
  ]);
  it('returns 3 results', () => assert.equal(results.length, 3));
  it('first path is static', () => assert.equal(results[0].isRegex, false));
  it('second path has named capture', () =>
    assert.equal(results[1].kongPath, '~/pets/(?<petId>[^/]+)$'));
  it('third path has two captures', () =>
    assert.equal(
      results[2].kongPath,
      '~/users/(?<uid>[^/]+)/orders/(?<oid>[^/]+)$'
    ));
});

describe('convertOpenApiSpec', () => {
  const spec = {
    openapi: '3.0.0',
    paths: {
      '/pets': { get: {} },
      '/pets/{petId}': { get: {}, put: {}, delete: {} },
    },
  };
  const results = convertOpenApiSpec(spec);
  it('one result per path key', () => assert.equal(results.length, 2));
  it('static path unchanged', () => assert.equal(results[0].kongPath, '/pets'));
  it('parameterized path converted', () =>
    assert.equal(results[1].kongPath, '~/pets/(?<petId>[^/]+)$'));
});

describe('Edge cases', () => {
  // Adjacent parameters (unusual but valid OAS)
  it('adjacent params both captured', () =>
    assert.equal(
      convertPath('/{a}{b}/end').kongPath,
      '~/(?<a>[^/]+)(?<b>[^/]+)/end$'
    ));

  // Empty path ("/") with optional slash
  it('root with optional slash', () =>
    assert.equal(
      convertPath('/', { trailingSlash: 'optional' }).kongPath,
      '~/\\/?$'
    ));
});
