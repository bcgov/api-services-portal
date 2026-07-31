'use strict';

/**
 * PLAT-001 - Organization-access sync silently accepts unsupported roles.
 *
 * src/services/org-groups/group-access.ts:13 defines
 * `OrganizationRoles = ['organization-admin', 'system-admin']`, but nothing
 * validates the `roles` array submitted to put-organization-access against
 * that (or any) allow-list - createOrUpdateGroupAccess just filters
 * unrecognized role names out of its sync loop and returns success either
 * way. Submitting "system-owner" (a role name that appears in
 * src/services/org-groups/roles.ts's PredefinedRolePermissions but isn't a
 * currently-supported *organization* role) should be rejected with a 4xx
 * naming the unsupported value; instead it 204s and silently assigns
 * nothing.
 *
 * This scenario only needs org.create + org.access - no runtime group,
 * subsystem, service, or connection required.
 */

const org = require('../lib/steps/org');

function buildSteps(ctx) {
  return [
    org.createOrg(ctx),
    org.orgAccess(ctx, {
      roles: ['system-owner'],
      // `ctx.call` already throws on a non-zero restish exit code, so
      // `onResult` only ever fires here on *success* - i.e. exactly the
      // PLAT-001 bug (an unsupported role silently accepted). `org.access`
      // defaults to `fatal: false`, so once the fix lands and this call
      // starts returning a 4xx instead, the step will show as a non-fatal
      // WARN with the rejection message - that WARN *is* the "resolved"
      // signal; nothing else in this file needs to change.
      onResult: () => {
        console.log(
          'CONFIRMED [PLAT-001]: put-organization-access accepted the unsupported ' +
            'role "system-owner" with a success response, and (per errata evidence) ' +
            'assigns no organization permission for it - the caller has no way to ' +
            'tell the write silently did nothing.'
        );
      },
    }),
  ];
}

module.exports = { buildSteps };
