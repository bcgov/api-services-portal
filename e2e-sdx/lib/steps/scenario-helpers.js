'use strict';

// Shared setup prefixes used by multiple tests/<issue-id>.js scenarios, so
// each scenario file only has to spell out the one step it's actually
// demonstrating instead of re-listing the whole onboarding chain.
// Each helper returns an *array* of steps (not a step itself) meant to be
// spread into a scenario's buildSteps() result, optionally followed by
// more steps / overridden variants of the next step in the chain.

const org = require('./org');
const rg = require('./runtime-group');
const subsystem = require('./subsystem');
const service = require('./service');
const connection = require('./connection');

/** org.create -> org.access -> org.gateway -> rg.create -> rg.gateway. */
function setupOrgAndRuntimeGroup(ctx, { rgOverrides = {} } = {}) {
  return [
    org.createOrg(ctx),
    org.orgAccess(ctx),
    org.orgGateway(ctx),
    rg.createRuntimeGroup(ctx, rgOverrides),
    rg.runtimeGroupGateway(ctx),
  ];
}

/** setupOrgAndRuntimeGroup + subsystem created, registered, verified. */
function setupSubsystem(ctx, { rgOverrides = {}, gatewayOverrides = {} } = {}) {
  return [
    ...setupOrgAndRuntimeGroup(ctx, { rgOverrides }),
    subsystem.createSubsystem(ctx),
    subsystem.subsystemGateway(ctx, gatewayOverrides),
    subsystem.verifySubsystemClient(ctx),
  ];
}

/** setupSubsystem + service registered and located (serviceId captured). */
function setupService(ctx, { rgOverrides = {}, gatewayOverrides = {}, serviceOverrides = {} } = {}) {
  return [
    ...setupSubsystem(ctx, { rgOverrides, gatewayOverrides }),
    service.createService(ctx, serviceOverrides),
    service.locateService(ctx),
  ];
}

/** setupService + connection requested, listed, and approved. */
function setupApprovedConnection(
  ctx,
  { rgOverrides = {}, gatewayOverrides = {}, serviceOverrides = {}, requestOverrides = {} } = {}
) {
  return [
    ...setupService(ctx, { rgOverrides, gatewayOverrides, serviceOverrides }),
    connection.requestConnection(ctx, requestOverrides),
    connection.listConnections(ctx),
    connection.approveConnection(ctx),
  ];
}

module.exports = { setupOrgAndRuntimeGroup, setupSubsystem, setupService, setupApprovedConnection };
