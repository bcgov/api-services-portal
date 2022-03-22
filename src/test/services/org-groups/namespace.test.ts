import {
  GroupAccessService,
  NamespaceService,
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

/*
- assignNamespaceToOrganization
- unassignNamespaceFromOrganization
- listAssignedNamespacesByOrg
*/

describe('Org Group Namespace Service', function () {
  it('it should do nothing (already assigned)', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new NamespaceService(uma2.issuer);

    const result = await kc.assignNamespaceToOrganization(
      'orgcontrol_2',
      'ministry-of-citizens-services',
      'databc'
    );
    expect(result).toBe(false);
  });

  it('it should do assign org details', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new NamespaceService(uma2.issuer);

    const result = await kc.assignNamespaceToOrganization(
      'orgcontrol',
      'ministry-of-citizens-services',
      'databc'
    );
    expect(result).toBe(true);
  });

  it('it should unassign', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new NamespaceService(uma2.issuer);

    await kc.unassignNamespaceFromOrganization(
      'orgcontrol',
      'ministry-of-citizens-services',
      'databc'
    );
  });

  it('it should list', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new NamespaceService(uma2.issuer);

    const result = await kc.listAssignedNamespacesByOrg(
      'ministry-of-citizens-services'
    );
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('orgcontrol_2');
    expect(result[0].orgUnit).toBe('databc');
  });
});
