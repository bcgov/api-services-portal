import { OrgAuthzService } from '../../../services/org-groups';
import {
  getOpenidFromDiscovery,
  Uma2WellKnown,
} from '../../../services/keycloak';
import fetch from 'node-fetch';

describe('Org Group Access Service', function () {
  it('it should createIfMissingResource - already exists', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgAuthzService(uma2);

    await kc.createIfMissingResource('databc');
  });

  it('it should createIfMissingResource', async function () {
    const uma2: Uma2WellKnown = await (
      await fetch('https://provider/.well-known/uma2-configuration')
    ).json();

    const kc = new OrgAuthzService(uma2);

    const result = await kc.createIfMissingResource('newresource');
    expect(result).toBe('0001');
  });
});
