const { EnforcementPoint } = require('../../authz/enforcement');

import {
  UMAPolicyService,
  Policy,
  PolicyQuery,
  UMAResourceRegistrationService,
  ResourceSetQuery,
  ResourceSet,
} from '../../services/uma2';

import {
  getSuitableOwnerToken,
  getEnvironmentContext,
  getResourceSets,
} from './Common';
import type { TokenExchangeResult } from './Common';
import { strict as assert } from 'assert';
import { OrgGroupService } from '../../services/org-groups';
import { Logger } from '../../logger';

const logger = Logger('List.Ext.OrgPolicy');

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [],
        queries: [
          {
            schema:
              'getOrgPoliciesForResource(prodEnvId: ID!, resourceId: String!): [UMAPolicy]',
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

              const orgGroupService = new OrgGroupService(envCtx.uma2.issuer);
              await orgGroupService.login(
                envCtx.issuerEnvConfig.clientId,
                envCtx.issuerEnvConfig.clientSecret
              );
              await orgGroupService.backfillGroups();

              try {
                return await orgGroupService.getGroupPermissionsByResource(
                  args.resourceId
                );
              } catch (ex) {
                logger.error('[getOrgPoliciesForResource] %j', ex.toJSON());
                throw ex;
              }
            },
            access: EnforcementPoint,
          },
        ],
        mutations: [],
      });
    },
  ],
};
