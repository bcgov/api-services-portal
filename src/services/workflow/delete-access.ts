import { strict as assert } from 'assert';

import {
  deleteRecord,
  deleteRecords,
  lookupCredentialReferenceByServiceAccess,
  lookupCredentialIssuerById,
} from '../keystone';
import {
  KeycloakClientRegistrationService,
  KeycloakTokenService,
  getOpenidFromIssuer,
} from '../keycloak';
import { KongConsumerService } from '../kong';
import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from './types';
import { Logger } from '../../logger';
import { UMAPolicyService } from '../uma2';

const logger = Logger('wf.DeleteAccess');

export const DeleteAccess = async (context: any, operation: any, keys: any) => {
  const kongApi = new KongConsumerService(
    process.env.KONG_URL,
    process.env.GWA_API_URL
  );

  // From the Application, get all the related ServiceAccesses
  // From these, call Kong and Keycloak to delete them
  if ('application' in keys) {
    const applicationId = keys.application;

    /*
     */
    // const tasks = new Tasked(process.env.WORKING_PATH)
    // .add('AccessRequest', async (ctx, v) => { deleteRecords(context, 'AccessRequest', { application: { id: applicationId }}, true, ['id']) })
    // .add('task2', async (ctx, v) => { return { answer: ctx.task1.out}}, 'goodbye')
    // .add('task3', async () => true, 'hi')
    // await tasks.start()

    await deleteRecords(
      context,
      'AccessRequest',
      { application: { id: applicationId } },
      true,
      ['id']
    ).then(
      (app: any) =>
        deleteRecords(
          context,
          'ServiceAccess',
          { application: { id: applicationId } },
          true,
          ['id']
        )
      // .then((svc) => svc != null && deleteRecord(context, 'GatewayConsumer', { id: svc.consumer.id }, ['id'])
      //     .then((con) => svc != null && kongApi.deleteConsumer(svc.consumer.extForeignKey)
      //         .then((async () => {
      //             const issuer = await lookupCredentialIssuerById(context, svc.productEnvironment.credentialIssuer.id)
      //             const openid = await getOpenidFromDiscovery(issuer.oidcDiscoveryUrl)
      //             const token = issuer.clientRegistration == 'anonymous' ? null : (issuer.clientRegistration == 'managed' ? await new KeycloakTokenService(openid.issuer).getKeycloakSession(issuer.clientId, issuer.clientSecret) : issuer.initialAccessToken)
      //             // Need extra privilege to delete clients!
      //             return await new KeycloakClientService(null, null).deleteClientRegistration(openid.issuer, token, svc.consumer.customId)
      //         }))
      //     )
      // )
    );
  } else {
    const serviceAccessId = keys.serviceAccess;

    assert.strictEqual(
      serviceAccessId != null && typeof serviceAccessId != 'undefined',
      true
    );

    const svc = await lookupCredentialReferenceByServiceAccess(
      context,
      serviceAccessId
    );

    const flow = svc.productEnvironment.flow;

    // const tasks = new Tasked(process.env.WORKING_PATH)
    // .add('AccessRequest', async (ctx, v) => { deleteRecords(context, 'AccessRequest', { application: { id: applicationId }}, true, ['id']) })

    await deleteRecord(
      context,
      'AccessRequest',
      { serviceAccess: { id: serviceAccessId } },
      ['id']
    );
    svc.consumer != null &&
      svc.consumerType == 'client' &&
      deleteRecord(context, 'GatewayConsumer', { id: svc.consumer.id }, [
        'id',
        'extForeignKey',
        'customId',
      ]);

    svc.consumer != null &&
      svc.consumerType == 'client' &&
      kongApi.deleteConsumer(svc.consumer.extForeignKey).then(async () => {
        if (flow == 'client-credentials') {
          const issuer = await lookupCredentialIssuerById(
            context,
            svc.productEnvironment.credentialIssuer.id
          );
          const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(
            issuer,
            svc.productEnvironment.name
          );
          const openid = await getOpenidFromIssuer(issuerEnvConfig.issuerUrl);
          const token =
            issuerEnvConfig.clientRegistration == 'anonymous'
              ? null
              : issuerEnvConfig.clientRegistration == 'managed'
              ? await new KeycloakTokenService(
                  openid.token_endpoint
                ).getKeycloakSession(
                  issuerEnvConfig.clientId,
                  issuerEnvConfig.clientSecret
                )
              : issuerEnvConfig.initialAccessToken;

          // Delete the Policies that are associated with the client!!
          // Use the kcprotect service to find the UMA Policies that have this client ID
          // and then delete each one
          logger.debug('Deleting policies for %s', svc.consumer.customId);
          const policyApi = new UMAPolicyService(openid.issuer, token);
          const relatedPolicies = await policyApi.listPolicies({
            name: svc.consumer.customId,
          });
          for (const policy of relatedPolicies.filter(
            (p) => p.name == svc.consumer.customId
          )) {
            await policyApi.deleteUmaPolicy(policy.id);
          }

          await new KeycloakClientRegistrationService(
            issuerEnvConfig.issuerUrl,
            openid.registration_endpoint,
            token
          ).deleteClientRegistration(svc.consumer.customId);
        }
      });
  }
};
