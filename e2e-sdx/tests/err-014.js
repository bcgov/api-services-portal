'use strict';

/**
 * ERR-014 - Subsystem gateway registration is create-only, with no
 * partial-state / reconcile path.
 *
 * registerSubsystemGateway -> CreateNamespaceForSubsystem -> CreateNamespace
 * (src/services/workflow/create-namespace.ts:44-70) calls
 * checkNamespaceAvailable (src/services/org-groups/namespace.ts:148-151),
 * which unconditionally asserts the target namespace group doesn't already
 * exist. There is no branch that reconciles an existing namespace, so
 * simply repeating the exact same (successful) registration call fails
 * with 422 "Namespace already exists" - independent of ERR-013's
 * broken-state setup, this reproduces with a normal, correctly-hosted
 * runtime group.
 */

const { setupSubsystem } = require('../lib/steps/scenario-helpers');
const subsystem = require('../lib/steps/subsystem');

function buildSteps(ctx) {
  return [
    ...setupSubsystem(ctx),
    subsystem.subsystemGateway(ctx, {
      id: 'subsystem.gateway.repeat',
      fatal: false,
      onResult: () => {
        console.log(
          'RESOLVED [ERR-014]: repeating register-subsystem-gateway with identical ' +
            'parameters now succeeds (reconciled) instead of 422ing.'
        );
      },
    }),
  ];
}

module.exports = { buildSteps };
