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
  it('it should getValidRoles', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);

    const roles = await kc.getValidRoles();
    expect(roles.length).toBe(1);
    expect(roles[0]).toBe('data-custodian');
  });

  it('it should findGroup', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const result = kc.findGroup('b6e23545-dd71-49fd-9bbe-735ae7b8290e');
    expect(result).toBe('/data-custodian/ministry-citizens-services/databc');
  });

  it('it should deleteGroup', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const orgGroup: OrganizationGroup = {
      name: 'databc',
      parent: '/data-custodian/ministry-citizens-services',
    };
    await kc.deleteGroup(orgGroup);
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

  it('it should getGroupPermissionsByResource', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();
  });
});
