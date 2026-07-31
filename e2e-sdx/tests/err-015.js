'use strict';

/**
 * ERR-015 - Validator engine failures are reported as service
 * unavailability.
 *
 * src/services/workflow/openapi-spec-validation-service.ts's createValidation
 * only masks the error when the validator's HTTP call itself returns
 * non-2xx (`!res.ok`) - a spec that's merely rule-invalid (e.g. missing
 * `info.title`) still gets a normal 200 with `valid: false` from the
 * validator, which the portal correctly surfaces as a proper
 * `OpenAPISpecValidationError` ("Validation Failed" + the real findings),
 * *not* the masked error. Confirmed by direct probing of the local
 * validator: a nullable `enum` containing a literal `null` value (the
 * same shape ERR-016 describes) reliably crashes its Spectral engine with
 * `500 Spectral validation engine internal error` - a real, reachable
 * `!res.ok` case, and the reproduction this scenario uses.
 */

const { setupSubsystem } = require('../lib/steps/scenario-helpers');
const service = require('../lib/steps/service');
const { generateFakeOpenApiSpec } = require('../lib/testdata');

function buildSteps(ctx) {
  return [
    ...setupSubsystem(ctx),
    service.createService(ctx, {
      specContent: generateFakeOpenApiSpec(ctx.state.testData, { nullEnum: true }),
      fatal: false,
    }),
    {
      id: 'assert.err-015',
      title: 'Assert whether the validator\'s 500 was masked as "unavailable"',
      fatal: false,
      run: async () => {
        const step = ctx.state.steps['service.create'] || {};
        const msg = step.error || '';
        if (step.status !== 'skipped') {
          console.log(
            `UNEXPECTED [ERR-015]: service.create ended with status "${step.status}", ` +
              'not the expected validator-crash failure - the nullable-enum spec may not ' +
              "be triggering the validator's Spectral crash the way this scenario assumes."
          );
        } else if (/unavailable/i.test(msg)) {
          console.log(
            `CONFIRMED [ERR-015]: service.create failed with "${msg}" - the validator's ` +
              'own Spectral engine crash (HTTP 500) is reported as service unavailability, ' +
              'masking the real, actionable validation-engine error.'
          );
        } else {
          console.log(
            `RESOLVED [ERR-015]: service.create failed with "${msg}", which preserves ` +
              'the validator\'s real error instead of masking it as "unavailable".'
          );
        }
      },
    },
  ];
}

module.exports = { buildSteps };
