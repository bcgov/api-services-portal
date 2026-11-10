import assert from 'node:assert/strict';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import {
  getRequiredEnvUrl,
  loadEnvironments,
  resetEnvironmentsCache,
} from './environments.js';

// ---------------------------------------------------------------------------
// Fixture: a temp environments config file
// ---------------------------------------------------------------------------

const configPath = join(tmpdir(), `environments.test.${process.pid}.json`);

const validConfig = {
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
};

function writeConfig(config: unknown): void {
  writeFileSync(configPath, JSON.stringify(config));
  resetEnvironmentsCache();
}

before(() => {
  process.env.ENVIRONMENTS_CONFIG_FILE = configPath;
  writeConfig(validConfig);
});

after(() => {
  unlinkSync(configPath);
  resetEnvironmentsCache();
});

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('getRequiredEnvUrl', () => {
  it('returns the configured URL for the field', () => {
    assert.equal(
      getRequiredEnvUrl('dev', 'operator_edge_url', 'SDX Operator edge server'),
      'https://edge.dev.example.gov.bc.ca'
    );
  });

  it('throws naming the environment and description when the field is unconfigured', () => {
    assert.throws(
      () =>
        getRequiredEnvUrl(
          'test',
          'operator_edge_url',
          'SDX Operator edge server'
        ),
      {
        message:
          "SDX Operator edge server is not configured for environment 'test'",
      }
    );
  });

  it('throws instead of looking up an undefined environment', () => {
    assert.throws(() =>
      getRequiredEnvUrl(undefined, 'public_url', 'SDX public URL')
    );
  });

  it('throws when the environment is not in the config at all', () => {
    assert.throws(() =>
      getRequiredEnvUrl('missing-env', 'public_url', 'SDX public URL')
    );
  });
});

describe('SDX R1 environment settings', () => {
  it('loads the dedicated edge exchange client separately', () => {
    writeConfig(validConfig);
    assert.equal(
      loadEnvironments().dev.sdx_token_exchange_client_id,
      'sdx-edge-exchange'
    );
  });

  it('loads the trusted issuer list', () => {
    writeConfig(validConfig);
    assert.deepEqual(loadEnvironments().dev.sdx_trusted_issuers, [
      'https://issuer.example.gov.bc.ca/realms/standard',
    ]);
  });

  it('rejects a non-array trusted issuer value', () => {
    writeConfig({
      dev: {
        oauth_token_url: 'https://oidc.example.gov.bc.ca/token',
        kong_admin_url: 'http://kong:8001',
        sdx_trusted_issuers: 'https://issuer.example.gov.bc.ca',
      },
    });
    assert.throws(() => loadEnvironments(), /array of strings/);
  });
});
