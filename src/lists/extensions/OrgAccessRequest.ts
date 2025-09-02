const { EnforcementPoint } = require('../../authz/enforcement');
import { Logger } from '../../logger';
import { OrgAccessRequestCreate } from '../..//services/workflow/org-access-request';

const logger = Logger('lists.orgaccessreq');

const typeOrgAccessRequestCreateInput = `
    input OrgAccessRequestCreateInput {
      org: String!,
      orgMemberId: String!,
      userId: String!,
      consumerProductEnvAppId: String!,
      providerProductEnvAppId: String!,
      businessProcess: String!,
      accessPointDN: String!,
      optionalClientScopes: [String!]
    }
`;

const typeOrgAccessRequest = `
    type OrgAccessRequest {
      application: Application,
      providerProdEnv: Environment,
      accessRequest: AccessRequest,
    }
`;

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [
          { type: typeOrgAccessRequestCreateInput },
          { type: typeOrgAccessRequest },
        ],
        queries: [],
        mutations: [
          {
            schema:
              'orgCreateAccessRequest(data: OrgAccessRequestCreateInput): OrgAccessRequest',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const result = await OrgAccessRequestCreate(
                context,
                args.data.org,
                args.data.orgMemberId,
                args.data.userId,
                args.data.consumerProductEnvAppId,
                args.data.providerProductEnvAppId,
                args.data.businessProcess,
                args.data.accessPointDN,
                args.data.optionalClientScopes || []
              );
              logger.debug('OrgCreateAccessRequest: %j', result);
              return {
                application: {
                  appId: result.accessRequest.application.appId,
                },
                accessRequest: {
                  id: result.accessRequest.id,
                },
              };
            },
            access: EnforcementPoint,
          },
        ],
      });
    },
  ],
};
