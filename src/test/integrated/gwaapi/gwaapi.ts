/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/gwaapi/gwaapi.js

*/

import { o } from '../util';

import {
  camelCaseAttributes,
  transformSingleValueAttributes,
} from '../../../services/utils';

import { GWAService } from '../../../services/gwaapi';

(async () => {
  const client = new GWAService(process.env.GWA_API_URL);

  const result = await client.getDefaultNamespaceSettings();
  o(result);

  const detail = {
    name: 'mynamespace',
  };

  if (true) {
    const group: any = {
      name: 'mynamespace',
      attributes: {
        'perm-domains': ['.local'],
        'perm-data-plane': ['kong-dp'],
        'perm-protected-ns': ['allow'],
        org: ['the-org'],
        'org-unit': ['the-org-unit'],
      },
    };
    transformSingleValueAttributes(group.attributes, [
      'perm-data-plane',
      'perm-protected-ns',
      'org',
      'org-unit',
    ]);

    const merged = {
      ...detail,
      ...result,
      ...group.attributes,
    };
    o(merged);
  }
  if (true) {
    const group: any = {
      name: 'mynamespace',
      attributes: {},
    };
    transformSingleValueAttributes(group.attributes, [
      'perm-data-plane',
      'perm-protected-ns',
      'org',
      'org-unit',
    ]);

    const merged = {
      ...detail,
      ...result,
      ...group.attributes,
    };
    camelCaseAttributes(merged, [
      'perm-domains',
      'perm-data-plane',
      'perm-protected-ns',
      'org',
      'org-unit',
    ]);
    o(merged);
  }
  // console.log(await kc.listMembers('660cadef-9233-4532-ba45-5393beaddea4'));
})();
