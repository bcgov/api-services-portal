import crypto from 'crypto';
import {
  linkCredRefsToServiceAccess,
  lookupApplication,
  lookupCredentialReferenceByServiceAccess,
} from '../../services/keystone';
import { EnforcementPoint } from '../../authz/enforcement';
import {
  ClientAuthenticator,
  KeycloakClientService,
} from '../../services/keycloak';
import {
  CredentialReference,
  NewCredential,
} from '../../services/workflow/types';
import { getEnvironmentContext } from '../../services/workflow/get-namespaces';
import { replaceApiKey } from '../../services/workflow/kong-api-key-replace';
import { strict as assert } from 'assert';
import { UpdateCredentials } from '../../services/workflow';

const typeCredentialReferenceUpdateInput = `
input CredentialReferenceUpdateInput {
    clientCertificate: String,
    jwksUrl: String
}
`;

module.exports = {
  extensions: [
    (keystone: any) => {
      keystone.extendGraphQLSchema({
        types: [{ type: typeCredentialReferenceUpdateInput }],
        queries: [],
        mutations: [
          {
            schema:
              'updateServiceAccessCredential(id: ID!, controls: CredentialReferenceUpdateInput): AccessRequest',
            resolver: async (
              item: any,
              args: any,
              context: any,
              info: any,
              { query, access }: any
            ) => {
              return await UpdateCredentials(context, args.id, args.controls);
            },
            access: EnforcementPoint,
          },
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
              const clientAuthenticator =
                serviceAccess.productEnvironment?.credentialIssuer
                  ?.clientAuthenticator;

              if (flow === 'kong-api-key-acl' || flow === 'kong-api-key-only') {
                const clientId = serviceAccess.consumer.customId;

                const newApiKey = await replaceApiKey(
                  clientId,
                  (serviceAccess.credentialReference as CredentialReference)
                    .keyAuthPK
                );

                const credentialReference: CredentialReference = {
                  keyAuthPK: newApiKey.apiKey.keyAuthPK,
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
              } else if (flow === 'client-credentials') {
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

                const newCredential = {
                  flow: serviceAccess.productEnvironment.flow,
                  clientId: serviceAccess.consumer.customId,
                  issuer: envCtx.openid.issuer,
                  tokenEndpoint: envCtx.openid.token_endpoint,
                } as NewCredential;

                if (clientAuthenticator === 'client-secret') {
                  const newSecret = await kcClientService.regenerateSecret(
                    client.id
                  );
                  newCredential['clientSecret'] = newSecret;
                } else if (clientAuthenticator === 'client-jwt') {
                  // regenerate private/public keys

                  const { publicKey, privateKey } = crypto.generateKeyPairSync(
                    'rsa',
                    {
                      modulusLength: 4096,
                      publicKeyEncoding: {
                        type: 'spki',
                        format: 'pem',
                      },
                      privateKeyEncoding: {
                        type: 'pkcs8',
                        format: 'pem',
                      },
                    }
                  );

                  await kcClientService.uploadCertificate(client.id, publicKey);

                  newCredential['clientPrivateKey'] = privateKey;
                  newCredential['clientPublicKey'] = publicKey;
                }

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
