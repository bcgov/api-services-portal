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
  it('it should createGroupIfMissing (org level missing)', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const orgGroup: OrganizationGroup = {
      name: 'org-level',
      parent: '/data-custodian',
    };

    await kc.createGroupIfMissing(orgGroup);
  });

  it('it should createGroupIfMissing (role level)', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const orgGroup: OrganizationGroup = {
      name: 'data-custodian',
    };

    await kc.createGroupIfMissing(orgGroup);
  });

  it('it should list groups', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const orgGroup: OrganizationGroup = {
      name: 'databc',
      parent: '/data-custodian/ministry-citizens-services',
    };

    const result = kc.listGroups(orgGroup);
    expect(result.length).toBe(3);
    expect(result[0].id).toBe('5978a996-c215-4c3f-a17e-a76396a9d6a4');
    expect(result[1].id).toBe('a60c7342-d61b-4b02-a826-483b544fbe22');
    expect(result[2].id).toBe('b6e23545-dd71-49fd-9bbe-735ae7b8290e');
  });
});
