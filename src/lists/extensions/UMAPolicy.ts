const { EnforcementPoint } = require('../../authz/enforcement');
import { UMAPolicyService, Policy, PolicyQuery } from '../../services/uma2';
import { getEnvironmentContext, getResourceSets } from './Common';
import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import { StructuredActivityService } from '../../services/workflow';

const logger = Logger('lists.umapolicy');

const typeUMAPolicy = `
type UMAPolicy {
    id: String!,
    name: String!,
    description: String,
    type: String!
    logic: String!
    decisionStrategy: String!
    owner: String!
    users: [String]
    clients: [String]
    groups: [String]
    scopes: [String]!
}
`;

const typeUMAPolicyInput = `
input UMAPolicyInput {
    name: String!,
    description: String,
    users: [String]
    clients: [String]
    scopes: [String]!
}
`;

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [{ type: typeUMAPolicy }, { type: typeUMAPolicyInput }],
        queries: [
          {
            schema:
              'getUmaPoliciesForResource(prodEnvId: ID!, resourceId: String!): [UMAPolicy]',
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

              const policyApi = new UMAPolicyService(
                envCtx.uma2.policy_endpoint,
                envCtx.accessToken
              );

              return await policyApi.listPolicies({
                resource: args.resourceId,
              } as PolicyQuery);
            },
            access: EnforcementPoint,
          },
        ],
        mutations: [
          {
            schema:
              'createUmaPolicy(prodEnvId: ID!, resourceId: String!, data: UMAPolicyInput!): UMAPolicy',
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

              const policyApi = new UMAPolicyService(
                envCtx.uma2.policy_endpoint,
                envCtx.accessToken
              );

              // name, scopes
              const umaPolicy = await policyApi.createUmaPolicy(
                args.resourceId,
                args.data as Policy
              );

              await new StructuredActivityService(
                context.sudo(),
                context.authedItem['namespace']
              ).logNamespaceAccess(
                true,
                'granted',
                'namespace access',
                'client',
                args.data.name,
                args.data.scopes
              );

              return umaPolicy;
            },
            access: EnforcementPoint,
          },
          {
            schema:
              'deleteUmaPolicy(prodEnvId: ID!, resourceId: String!, policyId: String!): Boolean',
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

              const policyApi = new UMAPolicyService(
                envCtx.uma2.policy_endpoint,
                envCtx.accessToken
              );

              const policy = await policyApi.findPolicyByResource(
                args.resourceId,
                args.policyId
              );
              logger.warn('Policy %j', policy);

              await policyApi.deleteUmaPolicy(args.policyId);

              await new StructuredActivityService(
                context.sudo(),
                context.authedItem['namespace']
              ).logNamespaceAccess(
                true,
                'revoked',
                'namespace access',
                'client',
                policy.name,
                policy.scopes
              );

              return true;
            },
            access: EnforcementPoint,
          },
        ],
      });
    },
  ],
};
