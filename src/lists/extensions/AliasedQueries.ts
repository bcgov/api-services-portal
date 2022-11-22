import { CredentialIssuer, Environment } from '@/services/keystone/types';
import { IssuerEnvironmentConfig } from '@/services/workflow/types';
import {
  ListQuery,
  ItemQuery,
  SchemaType,
  AliasType,
  AliasConfig,
} from './resolvers';

module.exports = {
  extensions: [
    (keystone: any) => {
      const aliases: AliasConfig[] = [
        {
          gqlName: 'allDiscoverableProducts',
          list: 'Product',
          type: SchemaType.ListQuery,
        },
        {
          gqlName: 'allGatewayServicesByNamespace',
          list: 'GatewayService',
          type: SchemaType.ListQuery,
        },
        {
          gqlName: 'allGatewayRoutesByNamespace',
          list: 'GatewayRoute',
          type: SchemaType.ListQuery,
        },
        {
          gqlName: 'allGatewayPluginsByNamespace',
          list: 'GatewayPlugin',
          type: SchemaType.ListQuery,
        },
        {
          gqlName: 'allGatewayServiceMetricsByNamespace',
          list: 'Metric',
          type: SchemaType.ListQuery,
        },
        {
          gqlName: 'allContentsByNamespace',
          list: 'Content',
          type: SchemaType.ListQuery,
        },
        {
          gqlName: 'allProductsByNamespace',
          list: 'Product',
          type: SchemaType.ListQuery,
        },
        {
          gqlName: 'allAccessRequestsByNamespace',
          list: 'AccessRequest',
          type: SchemaType.ListQuery,
        },
        {
          gqlName: 'allServiceAccessesByNamespace',
          list: 'ServiceAccess',
          type: SchemaType.ListQuery,
        },
        {
          gqlName: 'allCredentialIssuersByNamespace',
          list: 'CredentialIssuer',
          type: SchemaType.ListQuery,
          hook: (issuers: CredentialIssuer[]) => {
            issuers.forEach((data) => {
              const envDetails = JSON.parse(data.environmentDetails);
              envDetails.forEach(function (env: IssuerEnvironmentConfig) {
                if (env.clientSecret) {
                  env.clientSecret = '****';
                } else if (env.initialAccessToken) {
                  env.initialAccessToken = '****';
                }
                env.exists = true;
              });
              data.environmentDetails = JSON.stringify(envDetails);
            });
            return issuers;
          },
        },
        {
          gqlName: 'allNamespaceServiceAccounts',
          list: 'ServiceAccess',
          type: SchemaType.ListQuery,
        },
        {
          gqlName: 'OwnedEnvironment',
          list: 'Environment',
          type: SchemaType.ItemQuery,
        },
        {
          gqlName: 'DiscoverableProduct',
          list: 'Product',
          type: SchemaType.ItemQuery,
        },
        {
          gqlName: 'OwnedEnvironment',
          list: 'Environment',
          type: SchemaType.ItemQuery,
          // hook: (data: Environment) => {
          //   if (
          //     data.credentialIssuer == null ||
          //     data.credentialIssuer.environmentDetails == null
          //   ) {
          //     return data;
          //   }
          //   const envDetails = JSON.parse(
          //     data.credentialIssuer.environmentDetails
          //   );
          //   envDetails.forEach(function (env: IssuerEnvironmentConfig) {
          //     if (env.clientId || env.clientSecret) {
          //       env.clientId = '****';
          //       env.clientSecret = '****';
          //     } else if (env.initialAccessToken) {
          //       env.initialAccessToken = '****';
          //     }
          //     env.exists = true;
          //   });
          //   data.credentialIssuer.environmentDetails = JSON.stringify(
          //     envDetails
          //   );
          //   return data;
          // },
        },
        {
          gqlName: 'OwnedCredentialIssuer',
          list: 'CredentialIssuer',
          type: SchemaType.ItemQuery,
          hook: (data: CredentialIssuer) => {
            const envDetails = JSON.parse(data.environmentDetails);
            envDetails.forEach(function (env: IssuerEnvironmentConfig) {
              if (env.clientId || env.clientSecret) {
                env.clientId = '****';
                env.clientSecret = '****';
              } else if (env.initialAccessToken) {
                env.initialAccessToken = '****';
              }
              env.exists = true;
            });
            data.environmentDetails = JSON.stringify(envDetails);
            return data;
          },
        },
        {
          gqlName: 'CredentialIssuerSummary',
          list: 'CredentialIssuer',
          type: SchemaType.ItemQuery,
        },
        {
          gqlName: 'myServiceAccesses',
          list: 'ServiceAccess',
          type: SchemaType.ListQuery,
        },
        {
          gqlName: 'myAccessRequests',
          list: 'AccessRequest',
          type: SchemaType.ListQuery,
        },
        {
          gqlName: 'myApplications',
          list: 'Application',
          type: SchemaType.ListQuery,
        },
        { gqlName: 'mySelf', list: 'User', type: SchemaType.ItemQuery },
        {
          gqlName: 'allDiscoverableContents',
          list: 'Content',
          type: SchemaType.ListQuery,
        },
      ];

      for (const alias of aliases) {
        if (alias.type == SchemaType.ListQuery) {
          keystone.extendGraphQLSchema(ListQuery(keystone, alias));
        } else if (alias.type == SchemaType.ItemQuery) {
          keystone.extendGraphQLSchema(ItemQuery(keystone, alias));
        }
      }
    },
  ],
};
