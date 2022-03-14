import {
  GroupAccessService,
  OrgAuthzService,
} from '../../../services/org-groups';
import {
  getOpenidFromDiscovery,
  Uma2WellKnown,
} from '../../../services/keycloak';
import fetch from 'node-fetch';
import { o } from '../../integrated/util';

describe('Org Group Access Service', function () {
  it('it should getGroupAccess', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new GroupAccessService(uma2);

    const access = await kc.getGroupAccess('databc');
    o(access);
  });
});
