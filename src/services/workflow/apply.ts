import {
  deleteRecord,
  lookupEnvironmentAndApplicationByAccessRequest,
  lookupCredentialIssuerById,
  markActiveTheServiceAccess,
  markAccessRequestAsNotIssued,
  recordActivity,
  lookupConsumerPlugins,
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
import { AccessRequest, Environment, GatewayConsumer } from '../keystone/types';
import { updateAccessRequestState } from '../keystone';
import { syncPlugins } from './consumer-plugins';
import { saveConsumerLabels } from './consumer-management';
import { StructuredActivityService } from './namespace-activity';

const logger = Logger('wf.Apply');

/* Is called After the AccessRequest is updated */
export const Apply = async (
  subjectContext: any,
  context: any,
  operation: any,
  existingItem: any,
  originalInput: any,
  updatedItem: any
) => {
  const message = { text: '' };

  if (originalInput['credential'] == 'NEW') {
    const requestDetails = await lookupEnvironmentAndApplicationByAccessRequest(
      context,
      existingItem.id
    );
    const productNamespace =
      requestDetails.productEnvironment.product.namespace;

    try {
      const newCredential = await generateCredential(context, requestDetails);

      updatedItem['credential'] = JSON.stringify(newCredential);
      message.text = 'received credentials';

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

        await setupAuthorizationAndEnable(
          subjectContext,
          context,
          requestDetails.productEnvironment,
          setup
        );

        await updateAccessRequestState(context, requestDetails.id, {
          isApproved: true,
          isIssued: true,
          isComplete: true,
        });

        message.text = 'received credentials (immediate approval)';
      }

      await new StructuredActivityService(
        context,
        productNamespace
      ).logCollectedCredentials(
        true,
        {
          accessRequest: requestDetails,
          environment: requestDetails.productEnvironment,
          product: requestDetails.productEnvironment.product,
          application: requestDetails.application,
          consumerUsername: newCredential.clientId,
        },
        requestDetails.productEnvironment.approval == true
      );

      // await recordActivity(
      //   context,
      //   operation,
      //   'AccessRequest',
      //   updatedItem.id,
      //   message.text,
      //   'success',
      //   JSON.stringify(originalInput),
      //   productNamespace
      // );
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
        'failed',
        '',
        productNamespace
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

      const productNamespace =
        requestDetails.productEnvironment.product.namespace;

      const setup = <SetupAuthorizationInput>{
        flow: requestDetails.productEnvironment.flow,
        namespace: productNamespace,
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

      if ('labels' in requestDetails && requestDetails.labels != null) {
        const labels = JSON.parse(requestDetails.labels);
        await saveConsumerLabels(
          context,
          setup.namespace,
          setup.consumer.id,
          labels
        );
      }
      await setupAuthorizationAndEnable(
        subjectContext,
        context,
        requestDetails.productEnvironment,
        setup
      );

      message.text = 'approved access';

      // only log another activity record if this is part of approval
      if (requestDetails.productEnvironment.approval == true) {
        await new StructuredActivityService(
          context,
          productNamespace
        ).logApproveAccess(true, {
          accessRequest: requestDetails,
          environment: requestDetails.productEnvironment,
          product: requestDetails.productEnvironment.product,
          application: requestDetails.application,
          consumerUsername: requestDetails.serviceAccess.consumer.customId,
        });
      }
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

      const productNamespace =
        requestDetails.productEnvironment.product.namespace;

      await deleteRecord(
        context,
        'ServiceAccess',
        { id: requestDetails.serviceAccess.id },
        ['id']
      );
      message.text = 'rejected access request';

      await new StructuredActivityService(
        context,
        productNamespace
      ).logRejectAccess(true, {
        accessRequest: requestDetails,
        environment: requestDetails.productEnvironment,
        product: requestDetails.productEnvironment.product,
        application: requestDetails.application,
        consumerUsername: requestDetails.serviceAccess.consumer.customId,
      });
      // } else if (isRequested(existingItem, updatedItem)) {
    }
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
  subjectContext: any,
  context: any,
  prodEnv: Environment,
  setup: SetupAuthorizationInput
) {
  const kongApi = new KongConsumerService(process.env.KONG_URL);
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
        ? await new KeycloakTokenService(
            openid.token_endpoint
          ).getKeycloakSession(
            issuerEnvConfig.clientId,
            issuerEnvConfig.clientSecret
          )
        : issuerEnvConfig.initialAccessToken;

    const controls: RequestControls = {
      ...{ defaultClientScopes: [] },
      ...setup.controls,
    };

    const kcClientService = new KeycloakClientRegistrationService(
      issuerEnvConfig.issuerUrl,
      openid.registration_endpoint,
      token
    );

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

    await kcClientService.updateClientRegistration(clientId, {
      clientId,
      enabled: true,
    });

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
  } else if (flow == 'kong-api-key-only') {
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

  if ('plugins' in controls) {
    const consumer = await lookupConsumerPlugins(context, setup.consumer.id);
    await syncPlugins(subjectContext, ns, consumer, prodEnv, controls.plugins);
  }

  // Call /feeds to sync the Consumer with KeystoneJS
  await feederApi.forceSync('kong', 'consumer', kongConsumerPK);
}
