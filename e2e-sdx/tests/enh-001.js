'use strict';

/**
 * ENH-001 - Return roles as an optional query parameter on
 * /catalog/organizations, matching the existing subsystem-side pattern
 * (getSubsystem's includeAccess, and "Subsystem Clients" which does this
 * unconditionally).
 *
 * Design decision (confirmed, not an oversight): includeAccess does NOT
 * require an authenticated caller - role membership is read from Keycloak
 * using the portal's own service credentials, the same way
 * getSubsystemRoles already resolves subsystem access. This harness always
 * calls through an authenticated restish profile, so it can't separately
 * exercise "works with zero auth" locally - it verifies the functional
 * behavior instead (the right organization gets its actual role membership
 * back).
 *
 * Requires a real, resolvable local Keycloak user for `--member-email` (the
 * default generated `sdx-test-<id>@example.gov.bc.ca` address matches no
 * real user, so `put-organization-access` warns "No suitable match" and
 * grants nothing - see `local/keycloak/master-realm.json`'s seeded `@idir`
 * users, e.g. `wendy@test.com`):
 *
 *   node run.js --test enh-001 --member-email wendy@test.com
 */

const org = require('../lib/steps/org');

function buildSteps(ctx) {
  const { state } = ctx;
  const td = state.testData;

  return [
    org.createOrg(ctx),
    org.orgAccess(ctx), // grants state.memberEmail 'system-admin' by default

    org.listOrganizations(ctx, {
      id: 'org.list.plain',
      title: 'List organizations (no includeAccess)',
      onResult: (res) => {
        const entries = res.json || [];
        const mine = entries.find((o) => o.name === td.orgName);
        if (!mine) {
          console.log(
            `UNEXPECTED [ENH-001]: ${td.orgName} not found in organization-list.`
          );
        } else if (mine.access !== undefined) {
          console.log(
            'UNEXPECTED [ENH-001]: organization-list included "access" even without --include-access.'
          );
        } else {
          console.log(
            'OK [ENH-001]: organization-list without --include-access is unchanged (no "access" field).'
          );
        }
      },
    }),

    org.listOrganizations(ctx, {
      id: 'org.list.access',
      title: 'List organizations (--include-access)',
      includeAccess: true,
      onResult: (res) => {
        const entries = res.json || [];
        const mine = entries.find((o) => o.name === td.orgName);
        if (!mine) {
          console.log(
            `UNEXPECTED [ENH-001]: ${td.orgName} not found in organization-list.`
          );
          return;
        }
        const access = mine.access || [];
        const match = access.find(
          (m) => m.member && m.member.email === state.memberEmail
        );
        if (!match) {
          console.log(
            `CONFIRMED [ENH-001]: organization-list --include-access did not return role membership for ` +
              `${state.memberEmail} on ${td.orgName} - either the parameter does not exist yet, or the ` +
              `member was not resolved (check --member-email is a real local user, e.g. wendy@test.com).`
          );
        } else if (match.roles.includes('system-admin')) {
          console.log(
            `RESOLVED [ENH-001]: organization-list --include-access returned ${state.memberEmail} with ` +
              `roles [${match.roles.join(', ')}] for ${td.orgName}.`
          );
        } else {
          console.log(
            `UNEXPECTED [ENH-001]: ${state.memberEmail} found but without 'system-admin' - roles: ` +
              `[${match.roles.join(', ')}].`
          );
        }
      },
    }),
  ];
}

module.exports = { buildSteps };
