import { ListQuery, ItemQuery, SchemaType, AliasConfig } from './resolvers';
import CredentialIssuerHook from './hooks/CredentialIssuerHook';

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
          hook: CredentialIssuerHook,
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
