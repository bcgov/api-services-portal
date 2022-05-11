import {
  linkCredRefsToServiceAccess,
  lookupApplication,
  lookupCredentialReferenceByServiceAccess,
} from '../../services/keystone';
import { EnforcementPoint } from '../../authz/enforcement';
import { KeycloakClientService } from '../../services/keycloak';
import { NewCredential } from '../../services/workflow/types';
import { getEnvironmentContext } from '../../services/workflow/get-namespaces';
import { replaceApiKey } from '../../services/workflow/kong-api-key-replace';

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [],
        queries: [],
        mutations: [
          {
            schema: 'regenerateCredentials(id: ID!): AccessRequest',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              const serviceAccess = await lookupCredentialReferenceByServiceAccess(
                context,
                args.id
              );

              const flow = serviceAccess.productEnvironment.flow;

              if (flow == 'kong-api-key-acl' || flow == 'kong-api-key-only') {
                const clientId = serviceAccess.consumer.customId;

                const newApiKey = await replaceApiKey(
                  clientId,
                  (serviceAccess.credentialReference as any).id
                );

                const credentialReference = {
                  id: newApiKey.apiKey.keyAuthPK,
                  clientId,
                };
                const noauthContext = keystone.createContext({
                  skipAccessControl: true,
                });
                await linkCredRefsToServiceAccess(
                  noauthContext,
                  serviceAccess.id,
                  credentialReference
                );

                const newCredential = {
                  flow: serviceAccess.productEnvironment.flow,
                  apiKey: newApiKey.apiKey.apiKey,
                } as NewCredential;

                return {
                  credential: JSON.stringify(newCredential),
                };
              } else if (flow == 'client-credentials') {
                const noauthContext = keystone.createContext({
                  skipAccessControl: true,
                });
                const envCtx = await getEnvironmentContext(
                  noauthContext,
                  serviceAccess.productEnvironment.id,
                  {},
                  false
                );

                const kcClientService = new KeycloakClientService(
                  envCtx.issuerEnvConfig.issuerUrl
                );
                await kcClientService.login(
                  envCtx.issuerEnvConfig.clientId,
                  envCtx.issuerEnvConfig.clientSecret
                );

                const client = await kcClientService.findByClientId(
                  serviceAccess.consumer.customId
                );
                const newSecret = await kcClientService.regenerateSecret(
                  client.id
                );

                const newCredential = {
                  flow: serviceAccess.productEnvironment.flow,
                  clientId: serviceAccess.consumer.customId,
                  clientSecret: newSecret,
                  issuer: envCtx.openid.issuer,
                  tokenEndpoint: envCtx.openid.token_endpoint,
                } as NewCredential;

                return {
                  credential: JSON.stringify(newCredential),
                };
              } else {
                throw new Error('Invalid Service Access Action');
              }
            },
            access: EnforcementPoint,
          },
        ],
      });
    },
  ],
};
