'use strict';

// Steps from documentation/how-to/sdx-services.md.

const fs = require('fs');
const path = require('path');

/**
 * "Register a service from the fake OpenAPI spec" (create-oas-service).
 *
 * By default reads `api-spec.yaml` from the run directory (written once at
 * run start from the plain `generateFakeOpenApiSpec(testData)`). Pass
 * `overrides.specContent` (a full OAS YAML string, e.g. from
 * `generateFakeOpenApiSpec(testData, { ... })`) to register a
 * scenario-specific spec instead - it also overwrites `api-spec.yaml` so
 * the substituted spec is visible in the run's artifacts.
 */
function createService(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'service.create',
    title: 'Register a service from the fake OpenAPI spec',
    fatal: overrides.fatal,
    run: async () => {
      const specPath = path.join(ctx.runDir, 'api-spec.yaml');
      const spec = overrides.specContent || fs.readFileSync(specPath, 'utf8');
      if (overrides.specContent) fs.writeFileSync(specPath, overrides.specContent);
      const res = await ctx.call(
        overrides.id || 'service.create',
        state.sdxAlias,
        [
          'create-oas-service',
          td.orgName,
          '--subsystem',
          td.subsystemName,
          '--environment',
          state.environment,
          '--rsh-header',
          'Content-Type: application/yaml',
        ],
        { input: spec }
      );
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

function locateService(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'service.locate',
    title: 'Locate the registered service in the catalog and capture serviceId',
    fatal: overrides.fatal,
    run: async () => {
      const res = await ctx.call(overrides.id || 'service.locate', state.sdxAlias, ['list-service-catalog']);
      const catalog = Array.isArray(res.json) ? res.json : [];
      const match = catalog.find((entry) => entry.subsystem && entry.subsystem.name === td.subsystemName);
      if (!match) {
        throw new Error(
          `Could not find a catalog entry for subsystem "${td.subsystemName}" after service.create. ` +
            'See logs/service.locate.log for the full catalog response.'
        );
      }
      state.captured.serviceId = match.name;
      state.captured.serviceTitle = match.title;
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

function getServiceSpec(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'service.get-spec',
    title: "Retrieve the registered service's OpenAPI spec (roundtrip check)",
    fatal: overrides.fatal !== undefined ? overrides.fatal : false,
    run: async () => {
      if (!state.captured.serviceId) throw new Error('No serviceId captured yet');
      const res = await ctx.call(
        overrides.id || 'service.get-spec',
        state.sdxAlias,
        ['get-organization-service-spec', td.orgName, state.captured.serviceId]
      );
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

/**
 * Preview (or apply) the sdx-service.r1 gateway pattern for the registered
 * service - used to inspect generated Kong route paths / plugin config
 * without needing a live deployed edge (ERR-018, ERR-029).
 */
function previewServicePattern(ctx, overrides = {}) {
  const { state } = ctx;
  const td = state.testData;
  return {
    id: overrides.id || 'service.pattern-preview',
    title: 'Preview sdx-service.r1 gateway pattern',
    fatal: overrides.fatal !== undefined ? overrides.fatal : false,
    run: async () => {
      if (!state.captured.serviceId) throw new Error('No serviceId captured yet');
      const res = await ctx.call(
        overrides.id || 'service.pattern-preview',
        state.sdxAlias,
        ['provision-config-from-pattern', td.orgName, 'sdx-service.r1', '--action', overrides.action || 'preview'],
        {
          body: {
            parameters: {
              serviceId: state.captured.serviceId,
              environment: state.environment,
              upstreamUrl: state.upstreamUrl,
              ...overrides.parameters,
            },
          },
        }
      );
      state.captured.servicePatternPreview = res.json;
      if (overrides.onResult) await overrides.onResult(res, ctx);
    },
  };
}

module.exports = { createService, locateService, getServiceSpec, previewServicePattern };
