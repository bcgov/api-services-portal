'use strict';

/**
 * ERR-013 - Subsystem gateway registration succeeds for an org not hosted
 * by the runtime.
 *
 * src/controllers/sdx/v1/OrgSubsystemController.ts's registerSubsystemGateway
 * (150-186) delegates to src/services/batch/runtime-group.ts's
 * findHostedRuntimeGroupsByName (159-185), which asserts only that a
 * runtime group with the given *name* exists anywhere, then filters by
 * hostedOrganizations - an empty filtered result is never rejected. This
 * scenario creates a runtime group that hosts a *different* organization
 * than the one under test, then registers the subsystem against it -
 * this currently succeeds and returns a gateway id, leaving an
 * inconsistent namespace with no host domain.
 */

const org = require('../lib/steps/org');
const rg = require('../lib/steps/runtime-group');
const subsystem = require('../lib/steps/subsystem');

function buildSteps(ctx) {
  const td = ctx.state.testData;
  // create-runtime-group requires every hostedOrganizations entry to be a
  // real, existing organization (a made-up name 400s at creation, and an
  // empty array breaks the unrelated register-runtime-group-gateway step
  // with a 500) - so this registers a second, otherwise-unused "other" org
  // purely to be the runtime's one hosted organization, leaving the
  // scenario's actual org (below) unhosted.
  const otherOrgName = `${td.orgName}-other`;

  return [
    org.createOrg(ctx, {
      id: 'org.create.other',
      body: {
        name: otherOrgName,
        title: `SDX Test Org ${td.suffix} (other, hosts the RG instead)`,
        tags: [`member_class:${td.memberClass}`, `member_id:${td.memberId}OTH`, `test_run:${td.suffix}`],
      },
    }),
    org.createOrg(ctx),
    org.orgAccess(ctx),
    org.orgGateway(ctx),
    // register-runtime-group-gateway itself 500s if called under an org
    // that isn't in the runtime's hostedOrganizations - a related but
    // separate defect from ERR-013 (which is specifically about
    // registerSubsystemGateway), so this scenario skips it: it isn't a
    // prerequisite for registerSubsystemGateway's own hosted-org check.
    rg.createRuntimeGroup(ctx, { hostedOrganizations: [otherOrgName] }),
    subsystem.createSubsystem(ctx),
    subsystem.subsystemGateway(ctx, {
      fatal: false,
      onResult: () => {
        console.log(
          'CONFIRMED [ERR-013, part 1]: register-subsystem-gateway succeeded even ' +
            `though the runtime group's hostedOrganizations is [${otherOrgName}], not this org.`
        );
      },
    }),
    subsystem.verifySubsystemClient(ctx, {
      fatal: false,
      onResult: (res) => {
        const client = res.json || {};
        const rgNames = (client.runtimeGroups || []).map((r) => r.name);
        if (rgNames.length === 0) {
          console.log(
            'CONFIRMED [ERR-013, part 2]: get-subsystem-client reports runtimeGroups: [] ' +
              'even though register-subsystem-gateway reported success - the same ' +
              'inconsistent-state signature from the errata evidence.'
          );
        } else {
          console.log(
            `RESOLVED (or partially): get-subsystem-client now reports runtimeGroups: ${JSON.stringify(rgNames)} ` +
              'after registering against an unhosted runtime group.'
          );
        }
      },
    }),
  ];
}

module.exports = { buildSteps };
