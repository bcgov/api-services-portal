/**
 * Tests for openapi-to-kong-paths
 * Run with: npx ts-node tests/index.test.ts
 */

import {
  convertPath,
  convertPaths,
  convertOpenApiSpec,
  extractParams,
  isParameterized,
  ConversionResult,
} from './openapi-to-kong-paths.js';

// ---------------------------------------------------------------------------
// Tiny test runner
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function expect(actual: unknown) {
  return {
    toBe(expected: unknown, label: string) {
      if (actual === expected) {
        console.log(`  ✓  ${label}`);
        passed++;
      } else {
        console.error(`  ✗  ${label}`);
        console.error(`       expected: ${JSON.stringify(expected)}`);
        console.error(`       received: ${JSON.stringify(actual)}`);
        failed++;
      }
    },
    toEqual(expected: unknown, label: string) {
      const a = JSON.stringify(actual);
      const e = JSON.stringify(expected);
      if (a === e) {
        console.log(`  ✓  ${label}`);
        passed++;
      } else {
        console.error(`  ✗  ${label}`);
        console.error(`       expected: ${e}`);
        console.error(`       received: ${a}`);
        failed++;
      }
    },
  };
}

function describe(name: string, fn: () => void) {
  console.log(`\n▸ ${name}`);
  fn();
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('Static paths (no parameters)', () => {
  const r = convertPath('/pets');
  expect(r.kongPath).toBe('/pets', 'kongPath equals plain path');
  expect(r.isRegex).toBe(false, 'isRegex is false');
  expect(r.parameters).toEqual({}, 'no parameters captured');

  const r2 = convertPath('/');
  expect(r2.kongPath).toBe('/', 'root path unchanged');

  const r3 = convertPath('/a/b/c');
  expect(r3.kongPath).toBe('/a/b/c', 'nested static path unchanged');
});

describe('Single path parameter – Kong 3.x (default)', () => {
  const r = convertPath('/pets/{petId}');
  expect(r.isRegex).toBe(true, 'isRegex is true');
  expect(r.kongPath).toBe(
    '~/pets/(?<petId>[^/]+)$',
    'single param → named capture, ~ prefix, $ anchor'
  );
  expect(r.parameters).toEqual({ petId: '[^/]+' }, 'parameter map populated');
});

describe('Single path parameter – Kong 2.x', () => {
  const r = convertPath('/pets/{petId}', { kongVersion: 2 });
  expect(r.kongPath).toBe('/pets/(?<petId>[^/]+)$', 'no ~ prefix for Kong 2.x');
});

describe('Multiple path parameters', () => {
  const r = convertPath('/users/{userId}/orders/{orderId}');
  expect(r.kongPath).toBe(
    '~/users/(?<userId>[^/]+)/orders/(?<orderId>[^/]+)$',
    'two named capture groups'
  );
  expect(r.parameters).toEqual(
    { userId: '[^/]+', orderId: '[^/]+' },
    'both params in parameter map'
  );
});

describe('Path parameter in the middle', () => {
  const r = convertPath('/users/{userId}/profile');
  expect(r.kongPath).toBe(
    '~/users/(?<userId>[^/]+)/profile$',
    'static suffix preserved after param'
  );
});

describe('Path parameter at root level', () => {
  const r = convertPath('/{version}/api');
  expect(r.kongPath).toBe('~/(?<version>[^/]+)/api$', 'param at start of path');
});

describe('greedyLastParam option (openapi-2-kong JS compat)', () => {
  const r = convertPath('/pets/{id}', { greedyLastParam: true });
  expect(r.kongPath).toBe(
    '~/pets/(?<id>\\S+)$',
    'last param uses \\S+ with greedyLastParam'
  );

  const r2 = convertPath('/a/{x}/b/{y}', { greedyLastParam: true });
  expect(r2.kongPath).toBe(
    '~/a/(?<x>[^/]+)/b/(?<y>\\S+)$',
    'only last param is greedy'
  );
});

describe('Custom paramPattern', () => {
  const r = convertPath('/items/{id}', { paramPattern: '[0-9]+' });
  expect(r.kongPath).toBe(
    '~/items/(?<id>[0-9]+)$',
    'custom digit-only pattern'
  );
});

describe('trailingSlash: optional', () => {
  const r = convertPath('/pets/{petId}', { trailingSlash: 'optional' });
  expect(r.kongPath).toBe(
    '~/pets/(?<petId>[^/]+)\\/?$',
    'optional trailing slash appended'
  );

  const staticR = convertPath('/healthz', { trailingSlash: 'optional' });
  expect(staticR.isRegex).toBe(
    true,
    'static path becomes regex when optional slash needed'
  );
  expect(staticR.kongPath).toBe(
    '~/healthz\\/?$',
    'static path with optional trailing slash'
  );
});

describe('trailingSlash: required', () => {
  const r = convertPath('/pets/{petId}', { trailingSlash: 'required' });
  expect(r.kongPath).toBe(
    '~/pets/(?<petId>[^/]+)\\/$',
    'required trailing slash appended'
  );

  const staticR = convertPath('/healthz', { trailingSlash: 'required' });
  expect(staticR.kongPath).toBe('/healthz/', 'static path with required slash');
  expect(staticR.isRegex).toBe(false, 'still plain prefix');
});

describe('Special regex chars in static segments are escaped', () => {
  // A path that contains dots (common in versioning)
  const r = convertPath('/v1.0/pets/{id}');
  expect(r.kongPath).toBe(
    '~/v1\\.0/pets/(?<id>[^/]+)$',
    'dot in static segment is escaped'
  );
});

describe('extractParams', () => {
  expect(extractParams('/users/{userId}/orders/{orderId}')).toEqual(
    ['userId', 'orderId'],
    'extracts params in order'
  );
  expect(extractParams('/pets')).toEqual([], 'no params → empty array');
});

describe('isParameterized', () => {
  expect(isParameterized('/pets/{id}')).toBe(true, 'parameterized path → true');
  expect(isParameterized('/pets')).toBe(false, 'static path → false');
});

describe('convertPaths (bulk)', () => {
  const results = convertPaths([
    '/pets',
    '/pets/{petId}',
    '/users/{uid}/orders/{oid}',
  ]);
  expect(results.length).toBe(3, 'returns 3 results');
  expect(results[0].isRegex).toBe(false, 'first path is static');
  expect(results[1].kongPath).toBe(
    '~/pets/(?<petId>[^/]+)$',
    'second path has named capture'
  );
  expect(results[2].kongPath).toBe(
    '~/users/(?<uid>[^/]+)/orders/(?<oid>[^/]+)$',
    'third path has two captures'
  );
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
  expect(results.length).toBe(2, 'one result per path key');
  expect(results[0].kongPath).toBe('/pets', 'static path unchanged');
  expect(results[1].kongPath).toBe(
    '~/pets/(?<petId>[^/]+)$',
    'parameterized path converted'
  );
});

describe('Edge cases', () => {
  // Adjacent parameters (unusual but valid OAS)
  const r = convertPath('/{a}{b}/end');
  expect(r.kongPath).toBe(
    '~/(?<a>[^/]+)(?<b>[^/]+)/end$',
    'adjacent params both captured'
  );

  // Empty path ("/") with optional slash
  const r2 = convertPath('/', { trailingSlash: 'optional' });
  expect(r2.kongPath).toBe('~/\\/?$', 'root with optional slash');
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exitCode = 1;
}
