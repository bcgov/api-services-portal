import { EnforcementPoint } from '../../authz/enforcement';
import { strict as assert } from 'assert';
import { UMAResourceRegistrationService } from '../../services/uma2';
import { getResourceSets, getEnvironmentContext } from './Common';

const typeUMAScope = `
type UMAScope {
    name: String!
}`;

const typeUMAResourceSet = `
type UMAResourceSet {
    id: String!,
    name: String!,
    type: String!,
    owner: String!,
    ownerManagedAccess: Boolean,
    uris: [String]
    resource_scopes: [UMAScope]
}`;

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [{ type: typeUMAScope }, { type: typeUMAResourceSet }],
        queries: [
          {
            schema:
              'allResourceSets(prodEnvId: ID!, type: String): [UMAResourceSet]',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const envCtx = await getEnvironmentContext(
                context,
                args.prodEnvId,
                access
              );

              const resourceIds = await getResourceSets(envCtx);

              const resourcesApi = new UMAResourceRegistrationService(
                envCtx.uma2.resource_registration_endpoint,
                envCtx.accessToken
              );
              return await resourcesApi.listResourcesByIdList(resourceIds);
            },
            access: EnforcementPoint,
          },
          {
            schema:
              'getResourceSet(prodEnvId: ID!, resourceId: String!): UMAResourceSet',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const envCtx = await getEnvironmentContext(
                context,
                args.prodEnvId,
                access
              );

              const resourceIds = await getResourceSets(envCtx);
              assert.strictEqual(
                resourceIds.filter((rid) => rid === args.resourceId).length,
                1,
                'Invalid Resource'
              );

              const resourcesApi = new UMAResourceRegistrationService(
                envCtx.uma2.resource_registration_endpoint,
                envCtx.accessToken
              );
              return await resourcesApi.getResourceSet(args.resourceId);
            },
            access: EnforcementPoint,
          },
        ],
        mutations: [],
      });
    },
  ],
};
