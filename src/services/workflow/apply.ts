import {
  deleteRecord,
  lookupEnvironmentAndApplicationByAccessRequest,
  lookupCredentialIssuerById,
  markActiveTheServiceAccess,
  markAccessRequestAsNotIssued,
  recordActivity,
} from '../keystone';
import { strict as assert } from 'assert';
import {
  KeycloakClientRegistrationService,
  KeycloakTokenService,
  getOpenidFromIssuer,
} from '../keycloak';
import { KongConsumerService } from '../kong';
import { FeederService } from '../feeder';
import { RequestControls } from './types';
import { IssuerEnvironmentConfig, getIssuerEnvironmentConfig } from './types';
import { generateCredential } from './generate-credential';
import {
  isUpdatingToIssued,
  isUpdatingToRejected,
  isRequested,
} from './common';
import { Logger } from '../../logger';
import { AccessRequest, GatewayConsumer } from '../keystone/types';
import { updateAccessRequestState } from '../keystone';

const logger = Logger('wf.Apply');

/* Is called After the AccessRequest is updated */
export const Apply = async (
  context: any,
  operation: any,
  existingItem: any,
  originalInput: any,
  updatedItem: any
) => {
  const message = { text: '' };

  if (originalInput['credential'] == 'NEW') {
    try {
      const requestDetails = await lookupEnvironmentAndApplicationByAccessRequest(
        context,
        existingItem.id
      );

      const newCredential = await generateCredential(context, requestDetails);
      if (newCredential != null) {
        updatedItem['credential'] = JSON.stringify(newCredential);
        message.text = 'received credentials';
      }

      if (requestDetails.productEnvironment.approval == false) {
        const requestDetails = await lookupEnvironmentAndApplicationByAccessRequest(
          context,
          existingItem.id
        );
        assert.strictEqual(
          requestDetails.serviceAccess != null,
          true,
          'Service Access is Missing!'
        );

        logger.debug('[UpdatingToIssued] ExistingItem = %j', existingItem);

        const setup = <SetupAuthorizationInput>{
          flow: requestDetails.productEnvironment.flow,
          namespace: requestDetails.productEnvironment.product.namespace,
          controls:
            'controls' in requestDetails
              ? JSON.parse(requestDetails.controls)
              : {},
          environmentName: requestDetails.productEnvironment.name,
          environmentAppId: requestDetails.productEnvironment.appId,
          credentialIssuerId:
            requestDetails.productEnvironment.credentialIssuer?.id,
          serviceAccessId: requestDetails.serviceAccess.id,
          consumer: requestDetails.serviceAccess.consumer,
        };

        await setupAuthorizationAndEnable(context, setup);

        await updateAccessRequestState(context, requestDetails.id, {
          isApproved: true,
          isIssued: true,
          isComplete: true,
        });

        message.text = 'received credentials (immediate approval)';
      }

      await recordActivity(
        context,
        operation,
        'AccessRequest',
        updatedItem.id,
        message.text,
        'success',
        JSON.stringify(originalInput)
      );
    } catch (err) {
      logger.error('Workflow Error %s', err);
      await markAccessRequestAsNotIssued(context, updatedItem.id).catch(
        (err: any) => {
          logger.error('Failed to rollback access request %s', err);
        }
      );
      await recordActivity(
        context,
        operation,
        'AccessRequest',
        updatedItem.id,
        'Failed to Apply Workflow - ' + err,
        'failed'
      );
      throw err;
    }
    return;
  }

  try {
    if (isUpdatingToIssued(existingItem, updatedItem)) {
      const requestDetails = await lookupEnvironmentAndApplicationByAccessRequest(
        context,
        existingItem.id
      );
      assert.strictEqual(
        requestDetails.serviceAccess == null,
        false,
        'Service Access is Missing!'
      );

      logger.debug('[UpdatingToIssued] ExistingItem = %j', existingItem);

      const setup = <SetupAuthorizationInput>{
        flow: requestDetails.productEnvironment.flow,
        namespace: requestDetails.productEnvironment.product.namespace,
        controls:
          'controls' in requestDetails
            ? JSON.parse(requestDetails.controls)
            : {},
        environmentName: requestDetails.productEnvironment.name,
        environmentAppId: requestDetails.productEnvironment.appId,
        credentialIssuerId:
          requestDetails.productEnvironment.credentialIssuer?.id,
        serviceAccessId: requestDetails.serviceAccess.id,
        consumer: requestDetails.serviceAccess.consumer,
      };

      await setupAuthorizationAndEnable(context, setup);

      message.text = 'approved access';
    } else if (isUpdatingToRejected(existingItem, updatedItem)) {
      const requestDetails = await lookupEnvironmentAndApplicationByAccessRequest(
        context,
        existingItem.id
      );
      assert.strictEqual(
        requestDetails.serviceAccess == null,
        false,
        'Service Access is Missing!'
      );
      await deleteRecord(
        context,
        'ServiceAccess',
        { id: requestDetails.serviceAccess.id },
        ['id']
      );
      message.text = 'rejected access request';
    } else if (isRequested(existingItem, updatedItem)) {
      message.text = 'requested access';
    }

    const refId = updatedItem.id;
    const action = operation;

    await recordActivity(
      context,
      action,
      'AccessRequest',
      refId,
      message.text,
      'success',
      JSON.stringify(originalInput)
    );
  } catch (err) {
    logger.error('Workflow Error %s', err);
    await markAccessRequestAsNotIssued(context, updatedItem.id).catch(
      (err: any) => {
        logger.error('Failed to rollback access request %s', err);
      }
    );
    await recordActivity(
      context,
      operation,
      'AccessRequest',
      updatedItem.id,
      'Failed to Apply Workflow - ' + err,
      'failed'
    );
    throw err;
  }
};

interface SetupAuthorizationInput {
  flow: string;
  namespace: string;
  controls: RequestControls;
  environmentName: string;
  environmentAppId: string;
  credentialIssuerId: string;
  serviceAccessId: string;
  consumer: GatewayConsumer;
}

async function setupAuthorizationAndEnable(
  context: any,
  setup: SetupAuthorizationInput
) {
  const kongApi = new KongConsumerService(
    process.env.KONG_URL,
    process.env.GWA_API_URL
  );
  const feederApi = new FeederService(process.env.FEEDER_URL);

  const flow = setup.flow;
  const ns = setup.namespace;
  const controls = setup.controls;
  const aclEnabled =
    setup.flow == 'kong-api-key-acl' || setup.flow == 'kong-acl-only';

  let kongConsumerPK: string;

  // get the KongConsumerPK
  // kongConsumerPK
  kongConsumerPK = setup.consumer.extForeignKey;

  // update the clientRegistration to 'active'
  if (flow == 'client-credentials') {
    const clientId = setup.consumer.customId;

    // Find the credential issuer and based on its type, go do the appropriate action
    const issuer = await lookupCredentialIssuerById(
      context,
      setup.credentialIssuerId
    );
    const issuerEnvConfig: IssuerEnvironmentConfig = getIssuerEnvironmentConfig(
      issuer,
      setup.environmentName
    );

    const openid = await getOpenidFromIssuer(issuerEnvConfig.issuerUrl);

    // token is NULL if 'iat'
    // token is retrieved from doing a /token login using the provided client ID and secret if 'managed'
    // issuer.initialAccessToken if 'iat'
    const token =
      issuerEnvConfig.clientRegistration == 'anonymous'
        ? null
        : issuerEnvConfig.clientRegistration == 'managed'
        ? await new KeycloakTokenService(openid.issuer).getKeycloakSession(
            issuerEnvConfig.clientId,
            issuerEnvConfig.clientSecret
          )
        : issuerEnvConfig.initialAccessToken;

    const controls: RequestControls = {
      ...{ defaultClientScopes: [] },
      ...setup.controls,
    };

    const kcClientService = new KeycloakClientRegistrationService(
      openid.issuer,
      token
    );

    await kcClientService.updateClientRegistration(clientId, {
      clientId,
      enabled: true,
    });

    // Only valid for 'managed' client registration
    // const kcadminApi = new KeycloakClientService(baseUrl, realm)
    await kcClientService.login(
      issuerEnvConfig.clientId,
      issuerEnvConfig.clientSecret
    );
    await kcClientService.syncAndApply(
      clientId,
      controls.defaultClientScopes,
      []
    );

    await markActiveTheServiceAccess(context, setup.serviceAccessId);
  } else if (flow == 'kong-api-key-acl' || flow == 'kong-acl-only') {
    // update the Consumer ACL group membership to requestDetails.productEnvironment.appId
    await kongApi.updateConsumerACLByNamespace(
      kongConsumerPK,
      ns,
      [setup.environmentAppId],
      true
    );

    await markActiveTheServiceAccess(context, setup.serviceAccessId);
  }

  // Update the ACLs in Kong if they are enabled
  if (aclEnabled && 'aclGroups' in controls) {
    await kongApi.updateConsumerACLByNamespace(
      kongConsumerPK,
      ns,
      controls.aclGroups,
      true
    );
  }

  // Add the controls to the Consumer for Services/Routes that are part of the ProductEnvironment
  // request.controls:
  /*
        {
            aclGroups: ['group1','group2'],
            plugins: [
                { name: "rate-limiting", service: { name: "abc" }, config: { "minutes": 100 } },
                { name: "rate-limiting", route: { name: "def" }, config: { "minutes": 100 } }
            ],
            clientRoles: [
                'Read', 'Write'
            ]
        }
    */
  // Convert the service or route name to a extForeignKey
  if ('plugins' in controls) {
    for (const plugin of controls.plugins) {
      // assume the service and route IDs are Kong's unique IDs for them
      await kongApi.addPluginToConsumer(
        kongConsumerPK,
        plugin,
        context.req.user.namespace
      );
    }
  }

  // Call /feeds to sync the Consumer with KeystoneJS
  await feederApi.forceSync('kong', 'consumer', kongConsumerPK);
}
