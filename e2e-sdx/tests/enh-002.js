'use strict';

/**
 * ENH-002 - Ability to change RBAC role membership for a subsystem
 * (System Owner / Access Manager / Tech Lead).
 *
 * The write primitive (SysGroupAccessService.createOrUpdateGroupAccess)
 * already existed and already supports granting *and* revoking members in
 * one sync call - it was only ever invoked once, internally, to bootstrap
 * the subsystem creator's own three roles at registration time. This adds
 * GET/PUT /organizations/{org}/subsystems/{name}/access to expose it, plus
 * up-front role-name validation (porting PLAT-001's fix forward - the
 * underlying write primitive still only *filters* unsupported role names
 * instead of rejecting them).
 *
 * The local stack only has one real authenticated identity available (the
 * restish caller itself, already granted all three roles when
 * `subsystem.gateway` ran), so rather than inventing a second, unverifiable
 * synthetic member, this scenario does a self-consistent round trip: read
 * the caller's own access record back, submit an unsupported role for that
 * same member (expect a field-specific 4xx), then resubmit the member with
 * `access-manager` dropped and verify the sync actually revoked it while
 * leaving `system-owner`/`tech-lead` intact.
 */

const { setupSubsystem } = require('../lib/steps/scenario-helpers');
const subsystem = require('../lib/steps/subsystem');

const ALL_ROLES = ['system-owner', 'tech-lead', 'access-manager'];

function findMemberWithRoles(members) {
  return (members || []).find((m) => m.roles && m.roles.length > 0);
}

function buildSteps(ctx) {
  const { state } = ctx;
  const td = state.testData;

  return [
    ...setupSubsystem(ctx),

    subsystem.getSubsystemAccess(ctx, {
      id: 'access.get.before',
      onResult: (res) => {
        const members = res.json || [];
        const withRoles = findMemberWithRoles(members);
        if (!withRoles) {
          console.log(
            'CONFIRMED [ENH-002]: get-subsystem-access returned no role members for a ' +
              'just-registered subsystem - either the operation does not exist yet, or the ' +
              'bootstrap grant at registration is not visible through it.'
          );
          return;
        }
        const roles = new Set(withRoles.roles);
        const hasAll = ALL_ROLES.every((r) => roles.has(r));
        console.log(
          hasAll
            ? 'RESOLVED [ENH-002]: get-subsystem-access returned the registering caller with all three bootstrap roles.'
            : `UNEXPECTED [ENH-002]: caller has roles [${[...roles].join(', ')}], expected all three bootstrap roles.`
        );
        // Identify the member by email only - getSubsystemRoles's Keycloak
        // read also returns a `name` field that the write side's UserReference
        // schema doesn't declare, so blindly echoing the full read-model back
        // as a write body gets rejected as an excess property. A real caller
        // should identify members explicitly anyway, not round-trip a read
        // model.
        state.captured.subsystemAccessMember = { email: withRoles.member.email };
        state.captured.subsystemAccessBefore = members;
      },
    }),

    {
      id: 'access.put.invalid-role',
      title: 'Reject an unsupported role on subsystem access (ports PLAT-001 forward)',
      fatal: false,
      run: async () => {
        if (!state.captured.subsystemAccessMember) {
          console.log(
            'SKIP [ENH-002]: no captured member from access.get.before - cannot test invalid-role validation.'
          );
          return;
        }
        try {
          await ctx.call(
            'access.put.invalid-role',
            state.sdxAlias,
            ['put-subsystem-access', td.orgName, td.subsystemName],
            {
              body: {
                members: [
                  {
                    member: state.captured.subsystemAccessMember,
                    roles: ['not-a-real-role'],
                  },
                ],
              },
            }
          );
          console.log(
            'UNEXPECTED [ENH-002]: put-subsystem-access accepted an unsupported role name - ' +
              "PLAT-001's validation was not ported forward to the subsystem-access write path."
          );
        } catch (err) {
          console.log(
            `RESOLVED [ENH-002]: put-subsystem-access rejected an unsupported role: ${err.message}`
          );
        }
      },
    },

    {
      id: 'access.put.revoke',
      title: 'Drop access-manager for the captured member (sync/revoke)',
      fatal: false,
      run: async () => {
        if (!state.captured.subsystemAccessMember) {
          console.log(
            'SKIP [ENH-002]: no captured member from access.get.before - cannot test revocation.'
          );
          return;
        }
        try {
          await ctx.call(
            'access.put.revoke',
            state.sdxAlias,
            ['put-subsystem-access', td.orgName, td.subsystemName],
            {
              body: {
                members: [
                  {
                    member: state.captured.subsystemAccessMember,
                    roles: ['system-owner', 'tech-lead'],
                  },
                ],
              },
            }
          );
        } catch (err) {
          console.log(
            `CONFIRMED [ENH-002]: put-subsystem-access is not available (${err.message}) - no supported way to change subsystem RBAC membership.`
          );
        }
      },
    },

    subsystem.getSubsystemAccess(ctx, {
      id: 'access.get.after',
      onResult: (res) => {
        if (!state.captured.subsystemAccessMember) return;
        const members = res.json || [];
        const after = findMemberWithRoles(members);
        if (!after) {
          console.log(
            'UNEXPECTED [ENH-002]: no role members found after the revoke call.'
          );
          return;
        }
        const roles = new Set(after.roles);
        const stillHasBoth =
          roles.has('system-owner') && roles.has('tech-lead');
        const revoked = !roles.has('access-manager');
        console.log(
          stillHasBoth && revoked
            ? 'RESOLVED [ENH-002]: put-subsystem-access synced membership - access-manager revoked, system-owner/tech-lead retained.'
            : `UNEXPECTED [ENH-002]: post-revoke roles are [${[...roles].join(', ')}] (expected system-owner+tech-lead, no access-manager).`
        );
      },
    }),
  ];
}

module.exports = { buildSteps };
