const { EnforcementPoint } = require('../../authz/enforcement');
import { UMAPolicyService, Policy, PolicyQuery } from '../../services/uma2';
import { getEnvironmentContext, getResourceSets } from './Common';
import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import { StructuredActivityService } from '../../services/workflow';
import {
  createUmaPolicy,
  updateUmaPolicy,
  revokeUmaPolicy,
} from '../../services/workflow/ns-uma-policy-access';
import PolicyRepresentation from '@keycloak/keycloak-admin-client/lib/defs/policyRepresentation';
import { UmaPolicyInput } from '../../services/keystone/types';

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

              const input: UmaPolicyInput = args.data;

              const umaPolicy: Policy = {
                name: input.name,
                description: `Service Acct ${input.name}`,
                clients: [input.name],
                scopes: args.data.scopes,
              };
              return await createUmaPolicy(
                context,
                envCtx,
                args.resourceId,
                umaPolicy
              );
            },
            access: EnforcementPoint,
          },
          {
            schema:
              'updateUmaPolicy(prodEnvId: ID!, resourceId: String!, data: UMAPolicyInput!): UMAPolicy',
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

              const input: UmaPolicyInput = args.data;

              return await updateUmaPolicy(
                context,
                envCtx,
                args.resourceId,
                input.name,
                input.scopes
              );
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

              await revokeUmaPolicy(
                context,
                envCtx,
                args.resourceId,
                args.policyId
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
