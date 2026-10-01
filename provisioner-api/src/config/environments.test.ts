/**
 * Tests for environments.ts
 * Run with: npx tsx src/config/environments.test.ts
 */

import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  getRequiredEnvUrl,
  loadEnvironments,
  resetEnvironmentsCache,
} from './environments.js';

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
  };
}

function describe(name: string, fn: () => void) {
  console.log(`\n▸ ${name}`);
  fn();
}

// ---------------------------------------------------------------------------
// Fixture: a temp environments config file
// ---------------------------------------------------------------------------

const configPath = join(tmpdir(), `environments.test.${process.pid}.json`);
writeFileSync(
  configPath,
  JSON.stringify({
    dev: {
      oauth_token_url: 'https://oidc.example.gov.bc.ca/token',
      kong_admin_url: 'http://kong:8001',
      operator_edge_url: 'https://edge.dev.example.gov.bc.ca',
      sdx_token_exchange_client_id: 'sdx-edge-exchange',
      sdx_token_exchange_token_url:
        'https://issuer.example.gov.bc.ca/realms/standard/protocol/openid-connect/token',
      sdx_trusted_issuers: ['https://issuer.example.gov.bc.ca/realms/standard'],
    },
    test: {
      oauth_token_url: 'https://oidc.example.gov.bc.ca/token',
      kong_admin_url: 'http://kong:8001',
    },
  })
);
process.env.ENVIRONMENTS_CONFIG_FILE = configPath;
resetEnvironmentsCache();

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('getRequiredEnvUrl', () => {
  expect(
    getRequiredEnvUrl('dev', 'operator_edge_url', 'SDX Operator edge server')
  ).toBe(
    'https://edge.dev.example.gov.bc.ca',
    'returns the configured URL for the field'
  );

  let threw = false;
  try {
    getRequiredEnvUrl('test', 'operator_edge_url', 'SDX Operator edge server');
  } catch (err) {
    threw = true;
    expect((err as Error).message).toBe(
      "SDX Operator edge server is not configured for environment 'test'",
      'error names the environment and description when the field is unconfigured'
    );
  }
  expect(threw).toBe(
    true,
    'throws when the environment exists but lacks the field'
  );

  threw = false;
  try {
    getRequiredEnvUrl(undefined, 'public_url', 'SDX public URL');
  } catch (err) {
    threw = true;
  }
  expect(threw).toBe(
    true,
    'throws instead of looking up an undefined environment'
  );

  threw = false;
  try {
    getRequiredEnvUrl('missing-env', 'public_url', 'SDX public URL');
  } catch (err) {
    threw = true;
  }
  expect(threw).toBe(
    true,
    'throws when the environment is not in the config at all'
  );
});

describe('SDX R1 environment settings', () => {
  const config = loadEnvironments();
  expect(config.dev.sdx_token_exchange_client_id).toBe(
    'sdx-edge-exchange',
    'loads the dedicated edge exchange client separately'
  );
  expect(JSON.stringify(config.dev.sdx_trusted_issuers)).toBe(
    JSON.stringify(['https://issuer.example.gov.bc.ca/realms/standard']),
    'loads the trusted issuer list'
  );

  writeFileSync(
    configPath,
    JSON.stringify({
      dev: {
        oauth_token_url: 'https://oidc.example.gov.bc.ca/token',
        kong_admin_url: 'http://kong:8001',
        sdx_trusted_issuers: 'https://issuer.example.gov.bc.ca',
      },
    })
  );
  resetEnvironmentsCache();

  let threw = false;
  try {
    loadEnvironments();
  } catch (err) {
    threw = true;
    expect((err as Error).message.includes('array of strings')).toBe(
      true,
      'rejects a non-array trusted issuer value'
    );
  }
  expect(threw).toBe(true, 'rejects malformed R1 environment settings');
});

unlinkSync(configPath);
resetEnvironmentsCache();

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exitCode = 1;
}
