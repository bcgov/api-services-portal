/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/batchworker/apispec.js
*/
import YAML from 'yaml';
import InitKeystone from '../keystonejs/init';
import { syncRecords } from '../../../batch/feed-worker';
import { o } from '../util';
import { LoadOpenAPISpec } from '../../../services/workflow/openapi-spec-loader';

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ns = 'platform';
  const skipAccessControl = false;

  const identity = {
    id: null,
    username: 'sample_username',
    namespace: ns,
    roles: JSON.stringify(['api-owner', 'portal-user']),
    scopes: [],
    userId: null,
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });

  if (true) {
    const theSpec = await fetch(
      'https://bcgov.github.io/sdx-openapi/HTTPBUN.v1.yaml'
    );
    const spec = await theSpec.text();
    const specYAML = YAML.parse(spec);

    const json = {
      spec: YAML.stringify(specYAML),
      organization: 'ministry-of-citizens-services',
      subsystem: 'MY-SVC',
      state: 'active',
    };

    const data = await LoadOpenAPISpec(ctx, { ...json });
    const res = await syncRecords(ctx, 'OpenAPISpec', null, data);
    o(res);
  }
  await keystone.disconnect();
})();
