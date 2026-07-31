'use strict';

/**
 * Full TechDocs onboarding flow, end to end, with no overrides:
 *
 *   documentation/how-to/sdx-org-onboarding.md
 *   documentation/how-to/sdx-edge-servers.md
 *   documentation/how-to/sdx-subsystems.md
 *   documentation/how-to/sdx-services.md
 *   documentation/how-to/sdx-connections.md
 *
 * This is the direct successor to the original monolithic lib/steps.js -
 * same steps, same ids, same order, now composed from lib/steps/*.js (via
 * lib/steps/scenario-helpers.js's setup prefixes) so every error scenario
 * under tests/ can reuse the same building blocks.
 */

const rg = require('../lib/steps/runtime-group');
const service = require('../lib/steps/service');
const connection = require('../lib/steps/connection');
const cleanup = require('../lib/steps/cleanup');
const { setupApprovedConnection } = require('../lib/steps/scenario-helpers');

function buildSteps(ctx) {
  return [
    // ---- Org onboarding, runtime group, subsystem, service, connection
    //      request/approval (sdx-org-onboarding.md, sdx-edge-servers.md's
    //      registration steps, sdx-subsystems.md, sdx-services.md,
    //      sdx-connections.md's request-access-and-approve steps) ----
    ...setupApprovedConnection(ctx),

    // ---- The rest of Install a Runtime Group (sdx-edge-servers.md) ----
    // (rg.token/routes/keys aren't required for setupService's serviceId
    // capture, so they run here, matching the original step order.)
    rg.runtimeGroupToken(ctx),
    rg.runtimeGroupRoutes(ctx),
    rg.generateCert(ctx),
    rg.runtimeGroupKeys(ctx),

    // ---- The rest of Managing Services (sdx-services.md) ----
    service.getServiceSpec(ctx),

    // ---- The rest of Connecting a Service (sdx-connections.md) ----
    connection.openConsumerConnection(ctx),
    connection.openProviderConnection(ctx),

    // ---- Cleanup (best-effort; reverse dependency order) ----
    cleanup.deactivateConnection(ctx),
    cleanup.deleteConnection(ctx),
    cleanup.deleteService(ctx),
    cleanup.deleteSubsystem(ctx),
    cleanup.deleteRuntimeGroupKeys(ctx),
    cleanup.deleteRuntimeGroup(ctx),
  ];
}

module.exports = { buildSteps };
