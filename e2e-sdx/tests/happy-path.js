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
 * same steps, same ids, same order, now composed from lib/steps/*.js so
 * every error scenario under tests/ can reuse the same building blocks.
 */

const org = require('../lib/steps/org');
const rg = require('../lib/steps/runtime-group');
const subsystem = require('../lib/steps/subsystem');
const service = require('../lib/steps/service');
const connection = require('../lib/steps/connection');
const cleanup = require('../lib/steps/cleanup');

function buildSteps(ctx) {
  return [
    // ---- Organization Onboarding (sdx-org-onboarding.md) ----
    org.createOrg(ctx),
    org.orgAccess(ctx),
    org.orgGateway(ctx),

    // ---- Install a Runtime Group (sdx-edge-servers.md) ----
    rg.createRuntimeGroup(ctx),
    rg.runtimeGroupGateway(ctx),
    rg.runtimeGroupToken(ctx),
    rg.runtimeGroupRoutes(ctx),
    rg.generateCert(ctx),
    rg.runtimeGroupKeys(ctx),

    // ---- Managing Subsystems (sdx-subsystems.md) ----
    subsystem.createSubsystem(ctx),
    subsystem.listAvailableRuntimeGroups(ctx),
    subsystem.subsystemGateway(ctx),
    subsystem.verifySubsystemClient(ctx),

    // ---- Managing Services (sdx-services.md) ----
    service.createService(ctx),
    service.locateService(ctx),
    service.getServiceSpec(ctx),

    // ---- Connecting a Service (sdx-connections.md) ----
    connection.requestConnection(ctx),
    connection.listConnections(ctx),
    connection.approveConnection(ctx),
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
