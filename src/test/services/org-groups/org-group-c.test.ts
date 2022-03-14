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
  it('it should createGroupIfMissing (missing)', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);
    await kc.backfillGroups();

    const orgGroup: OrganizationGroup = {
      name: 'databc_2',
      parent: '/data-custodian/ministry-citizens-services',
    };

    await kc.createGroupIfMissing(orgGroup);
  });
});
