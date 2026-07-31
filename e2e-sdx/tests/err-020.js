'use strict';

/**
 * ERR-020 - Connection creation omits a runtime-required policy version.
 *
 * src/lists/ConnectionRequest.js:44-48 marks `policyVersion` required at
 * the Keystone list layer, but src/controllers/sdx/v1/types.ts's
 * `ConnectionRequestInput.policyVersion` is optional at the public
 * controller/DTO layer - so omitting it isn't caught until deep in the
 * batch-create path, which only reports a generic `create-failed` with no
 * field-specific explanation.
 */

const fs = require('fs');
const path = require('path');
const { setupService } = require('../lib/steps/scenario-helpers');
const connection = require('../lib/steps/connection');

function buildSteps(ctx) {
  return [
    ...setupService(ctx),
    connection.requestConnection(ctx, { omit: ['policyVersion'], fatal: false }),
    {
      id: 'assert.err-020',
      title: 'Assert whether the missing policyVersion produced a field-specific error',
      fatal: false,
      run: async () => {
        const step = ctx.state.steps['connection.request'] || {};
        // The terse `error` message (from describeFailure's last-stdout-line
        // heuristic) isn't reliable here since this response has no
        // top-level `.message` - read the full transcript instead.
        const log = fs.readFileSync(path.join(ctx.runDir, 'logs', 'connection.request.log'), 'utf8');
        const reasonMatch = log.match(/"reason":\s*"([^"]*)"/);
        const reason = reasonMatch ? reasonMatch[1] : '(no "reason" field found)';

        if (step.status !== 'skipped') {
          console.log(
            `UNEXPECTED [ERR-020]: connection.request ended with status "${step.status}" - ` +
              'omitting policyVersion may no longer cause a failure at all.'
          );
        } else if (/policyversion/i.test(reason)) {
          console.log(`RESOLVED [ERR-020]: connection.request failed with a policyVersion-specific reason: "${reason}".`);
        } else {
          console.log(
            `CONFIRMED [ERR-020]: connection.request failed with a generic reason - "${reason}" - ` +
              'that never names policyVersion as the missing field.'
          );
        }
      },
    },
  ];
}

module.exports = { buildSteps };
