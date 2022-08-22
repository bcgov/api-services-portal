import {
  GroupAccessService,
  OrganizationGroup,
  OrgAuthzService,
  OrgGroupService,
} from '../../../services/org-groups';
import {
  getOpenidFromDiscovery,
  Uma2WellKnown,
} from '../../../services/keycloak';
import fetch from 'node-fetch';
import { o } from '../../integrated/util';

describe('Org Group Access Service', function () {
  it('it should getGroupPolicyName', async function () {
    const kc = new OrgGroupService('');
    const orgGroup: OrganizationGroup = {
      name: 'databc',
      parent: '/organization-admin/ministry-citizens-services',
    };
    const name = kc.getGroupPolicyName(orgGroup);
    expect(name).toBe(
      'group-organization-admin-ministry-citizens-services-databc-policy'
    );
  });

  it('it should getGroupPermissionName', async function () {
    const kc = new OrgGroupService('');
    const orgGroup: OrganizationGroup = {
      name: 'databc',
      parent: '/organization-admin/ministry-citizens-services',
    };
    const name = kc.getGroupPermissionName(orgGroup, 'res123');
    expect(name).toBe(
      "Access to 'res123' services for role organization-admin"
    );
  });

  it('it should getValidRoles', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);

    const roles = await kc.getValidRoles();
    expect(roles.length).toBe(1);
    expect(roles[0]).toBe('organization-admin');
  });

  it('it should findGroup', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const result = kc.findGroup('b6e23545-dd71-49fd-9bbe-735ae7b8290e');
    expect(result).toBe(
      '/organization-admin/ministry-citizens-services/databc'
    );
  });

  it('it should deleteGroup', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const orgGroup: OrganizationGroup = {
      name: 'databc',
      parent: '/organization-admin/ministry-citizens-services',
    };
    await kc.deleteGroup(orgGroup);
  });

  it('it should createGroupIfMissing', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const orgGroup: OrganizationGroup = {
      name: 'databc',
      parent: '/organization-admin/ministry-citizens-services',
    };

    await kc.createGroupIfMissing(orgGroup);
  });

  it('it should createGroupIfMissing (missing)', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const orgGroup: OrganizationGroup = {
      name: 'databc_2',
      parent: '/organization-admin/ministry-citizens-services',
    };

    await kc.createGroupIfMissing(orgGroup);
  });

  it('it should getGroupPermissionsByResource', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const result = await kc.getGroupPermissionsByResource(
      'b444a5a1-8e14-4f92-9005-8b476b977e25'
    );
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('5f84d050-f50d-4a2b-946c-9a9fa6cb3317');
  });

  it('it should createOrUpdateGroupPermission (create)', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const orgGroup: OrganizationGroup = {
      name: 'databc',
      parent: '/organization-admin/ministry-citizens-services',
    };

    await kc.createOrUpdateGroupPermission(orgGroup, 'ns2', ['Namespace.View']);
  });

  it('it should createOrUpdateGroupPermission (update)', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const orgGroup: OrganizationGroup = {
      name: 'databc',
      parent: '/organization-admin/ministry-citizens-services',
    };

    await kc.createOrUpdateGroupPermission(orgGroup, 'orgcontrol', [
      'Namespace.View',
    ]);
  });

  it('it should createOrUpdateGroupPolicy (update)', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const orgGroup: OrganizationGroup = {
      name: 'databc',
      parent: '/organization-admin/ministry-citizens-services',
    };

    await kc.createOrUpdateGroupPolicy(orgGroup);
  });

  it('it should createOrUpdateGroupPolicy (create)', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const orgGroup: OrganizationGroup = {
      name: 'data-innovation',
      parent: '/organization-admin/ministry-citizens-services',
    };

    await kc.createOrUpdateGroupPolicy(orgGroup);
  });

  it('it should getGroupPathsByGroupName', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const result = await kc.getGroupPathsByGroupName('databc');
    expect(result.length).toBe(1);
    expect(result[0]).toBe(
      '/organization-admin/ministry-citizens-services/databc'
    );
  });

  it('it should getPermissionsForGroupPolicy', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const orgGroup: OrganizationGroup = {
      name: 'databc',
      parent: '/organization-admin/ministry-citizens-services',
    };

    const result = await kc.getPermissionsForGroupPolicy(
      orgGroup,
      'organization-admin'
    );
    expect(result.length).toBe(1);
    expect(result[0].resource).toBe('orgcontrol');
    expect(result[0].scopes[0]).toBe('Namespace.View');
  });

  it('it should getGroupPermissions', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const orgGroup: OrganizationGroup = {
      name: 'databc',
      parent: '/organization-admin/ministry-citizens-services',
    };

    const result = await kc.getGroupPermissions(orgGroup, ['orgcontrol']);
    o(result);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe(
      "Access to 'orgcontrol' services for role organization-admin"
    );
    expect(result[0].config.policies[0].name).toBe(
      'group-organization-admin-ministry-citizens-services-databc-policy'
    );
  });
});
