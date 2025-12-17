/*
Wire up directly with Keycloak and use the Services
To run:
npm run ts-build
npm run ts-watch
node dist/test/integrated/keystonejs/product-apispec.js
*/

import InitKeystone from './init';
import {
  getRecords,
  deleteRecord,
  parseJsonString,
  transformAllRefID,
  removeEmpty,
  removeKeys,
  syncRecords,
  parseBlobString,
} from '../../../batch/feed-worker';
import { o } from '../util';
import { dynamicallySetEnvironmentDetails, lookupServiceAccessesByEnvironment } from '../../../services/keystone';
import {
  getActivity,
  recordActivity,
  recordActivityWithBlob,
} from '../../../services/keystone/activity';
import { id } from 'date-fns/locale';
import {
  UpdateAPISpec,
  GetAPISpecsByOrg,
} from '../../../services/workflow/api-specs';
import { Environment } from '../../../services/keystone/types';
import { gql } from 'graphql-request';
import YAML from 'yaml';
import { OrgNamespace } from '../../../services/org-groups/types';
import { getGwaProductEnvironment } from '../../../services/workflow';
import { NamespaceService } from '../../../services/org-groups';

async function getNamespaceAttributes(
  ctx: any,
  ns: string
): Promise<OrgNamespace> {
  const prodEnv = await getGwaProductEnvironment(ctx, false);
  const envConfig = prodEnv.issuerEnvConfig;

  const svc = new NamespaceService(envConfig.issuerUrl);
  await svc.login(envConfig.clientId, envConfig.clientSecret);
  return await svc.getNamespaceOrganizationDetails(ns);
}

(async () => {
  const keystone = await InitKeystone();
  console.log('K = ' + keystone);

  const ns = 'gw-31a33';
  const skipAccessControl = true;

  const userId = '12';

  const identity = {
    id: null,
    username: 'sample_username',
    name: 'SampleF UserL',
    namespace: ns,
    roles: JSON.stringify(['api-owner']),
    scopes: [],
    userId,
  } as any;

  const ctx = keystone.createContext({
    skipAccessControl,
    authentication: { item: identity },
  });

  if (true) {
    const list = gql`
      query OrgProductCatalog {
        allEnvironments {
          appId
          name
          spec {
            blob
          }
          credentialIssuer {
            name
            clientId
            inheritFrom {
              environmentDetails
            } 
          }
          product {
            name
            namespace
            organization {
              name
            }
          }
        }
      }
    `;

    const result = await keystone.executeGraphQL({
      context: ctx,
      query: list,
    });
    o(result);
    const envs = result.data.allEnvironments.filter(
      (e: Environment) => e.product.organization != null
    );

    const output = envs.map((env: any) => {
      if (env.credentialIssuer != null) {
        const envDetails = JSON.parse(dynamicallySetEnvironmentDetails(env.credentialIssuer));
        const credEnv = envDetails.find((e: any) => e.environment === env.name);
        o(env)
        env.credentialIssuer = {
          issuerUrl: credEnv?.issuerUrl,
          clientId: credEnv?.clientId,
        }
          o(env)
      }
    });

  //     o(env.credentialIssuer?.environmentDetails)
  //     return
  //     const envs = JSON.parse(env.credentialIssuer?.environmentDetails);

  //     const issuerEnv = envs?.find((e: any) => e.environment === env.name);
  //     o(issuerEnv); 
  //     return {
  //       appId: env.appId,
  //       name: env.name,
  //       credentialIssuer: {
  //         issuer: issuerEnv.issuerUrl,
  //         clientId: issuerEnv.clientId,
  //       },
  //       product: {
  //         name: env.product.name,
  //         namespace: env.product.namespace,
  //         organization: {
  //           name: env.product.organization.name,
  //         },
  //       },
  //     };
  //   });
  //   o(output);
  }

  if (false) {
    const result = await GetAPISpecsByOrg(
      ctx,
      'ministry-of-puppies-and-kittens'
    );
    o(result);
  }
  if (false) {
    const spec = 'https://bcgov.github.io/sdx-openapi/%3CService%3E.v1.yaml';
    const result = await UpdateAPISpec(ctx, spec, 'E7FEB796');
    o(result);
  }

  if (false) {
    // upgrade

    const variables = {
      id: '20',
      namespace: ns,
      blobRef: 'B1678A2ADDD0-APISPEC-v1',
      blobType: 'yaml',
      blob: `gateway: gw-31a33
patterns:
  - name: pattern-1
    description: Pattern 1
    apis:
    `,
    };

    const blobExists = await ctx.executeGraphQL({
      query: `query ($blobRef: String!) {
                allBlobs (where: { ref: $blobRef}) {
                  id
                }
             }`,
      variables,
    });
    o(blobExists);
    if (blobExists.data.allBlobs.length == 1) {
      const result = await ctx.executeGraphQL({
        query: `mutation ($id: String!) {
                deleteBlob (id: $id) {
                  id
                }
             }`,
        variables: { id: blobExists.data.allBlobs[0].id },
      });
      o(result);
    }

    const result = await ctx.executeGraphQL({
      query: `mutation ($id: String, $oldBlobId: String, $blob: String, $blobType: String, $blobRef: String) {
                updateEnvironment (id: $id, data: {
                  spec: {
                    create: {
                      ref: $blobRef,
                      type: $blobType,
                      blob: $blob
                    }
                  }
                }) {
                  id
                  spec {
                    id
                  }
                }
             }`,
      variables,
    });
    o(result);

    const getSpec = await ctx.executeGraphQL({
      query: `query ($blobRef: String!) {
                allEnvironments (where: { spec: { ref: $blobRef}}) {
                  id
                  spec {
                    blob
                  }
                }
             }`,
      variables,
    });
    o(getSpec);
    console.log(getSpec.data.allEnvironments[0].spec.blob);
  }

  await keystone.disconnect();
})();
