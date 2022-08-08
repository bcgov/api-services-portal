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
import YAML from 'js-yaml';

describe('Org Group Resource Service', function () {
  it('it should ...', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgGroupService(uma2.issuer);

    await kc.backfillGroups();

    const perms = await kc.getGroupPermissionsByResource(
      'b444a5a1-8e14-4f92-9005-8b476b977e25'
    );

    const match = `
- id: 5f84d050-f50d-4a2b-946c-9a9fa6cb3317
  name: group-organization-admin-ministry-citizens-services-databc-policy
  type: group
  logic: POSITIVE
  decisionStrategy: UNANIMOUS
  owner: acd2e29a-6e1f-4895-a0d2-d9bb42d0ba81
  description: Group '/organization-admin/ministry-citizens-services' / 'databc' Policy
  scopes:
    - Namespace.View
  users:
    - user1
    - user2
    - user3
  groups:
    - /organization-admin
    - /organization-admin/ministry-citizens-services
    - /organization-admin/ministry-citizens-services/databc
`;
    expect(YAML.dump(perms, { indent: 2 }).trim()).toBe(match.trim());
  });
});
