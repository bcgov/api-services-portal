/**
 * SDX Consumer
 *
 * When a Connection Request is approved, a Consumer should be created with the corresponding clientId
 *
 * The Consumer should include Labels relevant for SDX (member, subsystem Id)
 * *
 */
import { SubsystemService } from '../batch/subsystem';
import {
  GetCatalogByName,
  GetSubsystemEntryForSubsystem,
} from '../gateway-patterns/catalog';
import {
  addServiceAccess,
  lookupKongConsumerByUsername,
  lookupKongConsumerIdByName,
} from '../keystone';
import { Application, ConsumerLabel } from '../keystone/types';
import { KongConsumerService } from '../kong';
import { saveConsumerLabels } from './consumer-management';
import { StructuredActivityService } from './namespace-activity';
import { Logger } from '../../logger';
import { AddClientConsumer } from './add-client-consumer';
import { assertEqual } from '../../controllers/ioc/assert';
import { ApplicationService } from '../batch/application-service';

const logger = Logger('sdx-consumer');

export interface SetupServiceAccessForConsumerProps {
  connId: string;
  clientId: string;
  azpClientId: string;
  serviceId: string;
  env: 'dev' | 'test' | 'prod';
}

export const AddConsumerIfNotExists = async (
  context: any,
  clientId: string,
  consumerUsername: string
): Promise<void> => {
  // find the subsystem by SDX Client ID
  const subsystem = await new SubsystemService().findSubsystemByClientId(
    context,
    clientId
  );

  const subsystemEntry = GetSubsystemEntryForSubsystem(subsystem);

  const labels: ConsumerLabel[] = [
    {
      labelGroup: 'sdx.subsystem',
      values: [subsystemEntry.name],
    },
    {
      labelGroup: 'sdx.organization',
      values: [
        `${subsystemEntry.member.memberClass}.${subsystemEntry.member.memberId}`,
      ],
    },
  ];

  const app = {
    name: subsystemEntry.name,
    description: subsystemEntry.description,
    organization: subsystemEntry.organization.name,
  };

  // create the app if it isn't already created
  const appService = new ApplicationService();

  const appResult = await appService.upsertApplication(context, app);
  logger.debug(
    "Created application for subsystem '%s' %j",
    subsystemEntry.name,
    appResult
  );

  const newApp = await appService.lookupApplication(context, appResult.id);

  const kongConsumerSerivce = new KongConsumerService(process.env.SDX_KONG_URL);

  const consumer = await kongConsumerSerivce.createOrGetConsumer(
    consumerUsername,
    null,
    newApp
  );

  let consumerPK;

  if (consumer.created == true) {
    consumerPK = await AddClientConsumer(
      context,
      consumerUsername,
      null,
      consumer.consumer.id
    );
  } else {
    const ksConsumer = await lookupKongConsumerByUsername(
      context,
      consumerUsername
    );
    consumerPK = ksConsumer.id;
  }

  if (labels && labels.length > 0) {
    await saveConsumerLabels(
      context,
      subsystemEntry.gateway.id,
      consumerPK,
      labels
    );
  }
  logger.debug('Updated consumer %j with labels %j', consumer, labels);
};

/**
 * Lookup the related product environment (service provider) and application (service client)
 * Create the new Service Access record
 * Record in activity
 *
 * @param context
 * @param clientId
 * @param serviceId
 */
export const SetupServiceAccessForConsumer = async (
  context: any,
  {
    connId,
    clientId,
    azpClientId,
    serviceId,
    env,
  }: SetupServiceAccessForConsumerProps
): Promise<string> => {
  const subsystemService = new SubsystemService();

  const client = await subsystemService.findSubsystemByClientId(
    context,
    clientId
  );

  // get the productEnvironment and application for the subsystem
  const application = await subsystemService.findApplication(
    context,
    client.organization.name,
    client.name
  );
  assertEqual(
    Boolean(application),
    true,
    'clientId',
    `Application not found for subsystem ${client.name} in org ${client.organization.name}`
  );

  const service = await GetCatalogByName(context, serviceId, false);

  const product = await subsystemService.findProduct(
    context,
    service.subsystem.organization.name,
    service.subsystem.name
  );
  const productEnvironment = product.environments.find((e) => e.name === env);

  const aclEnabled = false;
  const credentialReference = {};
  const consumerType = 'client';

  const consumer = await lookupKongConsumerByUsername(context, azpClientId);

  const serviceAccessId = await addServiceAccess(
    context,
    `${connId}:${service.name}`,
    false,
    aclEnabled,
    consumerType,
    credentialReference,
    null,
    consumer.id,
    productEnvironment,
    application
  );

  logger.debug(
    "Created service access with id '%s' for consumer '%j'",
    serviceAccessId,
    consumer
  );

  await new StructuredActivityService(
    context,
    service.subsystem.gateway.id
  ).logApproveAccess(true, {
    environment: productEnvironment,
    product: product,
    application: application,
    consumerUsername: azpClientId,
  });

  return serviceAccessId;
};
