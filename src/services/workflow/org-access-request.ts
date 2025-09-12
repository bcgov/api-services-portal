import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import {
  lookupCredentialIssuerById,
  lookupEnvironmentAndIssuerById,
  lookupProduct,
  lookupProductEnvironmentServicesBySlug,
} from '../keystone';
import {
  addAccessRequest,
  collectCredentials,
  getAccessRequest,
  getAccessRequestsByNamespace,
} from '../keystone/access-request';
import {
  createApplication,
  lookupApplicationsByNamespaces,
} from '../keystone/application';
import { AccessRequest, Application, Environment } from '../keystone/types';
import { saveConsumerLabels } from './consumer-management';
import { getGwaProductEnvironment, getOrgNamespaces } from './get-namespaces';
import { NewCredential } from './types';

const logger = Logger('wf.OrgAccessReq');

export const OrgAccessRequestCreate = async (
  context: any,
  org: string,
  orgMemberID: string,
  userId: string,
  consumerProdEnvAppId: string,
  providerProdEnvAppId: string,
  businessProcess: string,
  accessPointDN: string,
  optionalClientScopes: string[]
): Promise<{
  application: Application;
  providerProdEnv: Environment;
  accessRequest: AccessRequest;
  credential: NewCredential;
}> => {
  try {
    // get list of namespaces for this org
    const prodEnv = await getGwaProductEnvironment(context, false);
    const nsList = await getOrgNamespaces(org, prodEnv);

    // get the consumer product environment details
    const consumerProdEnv = await lookupProductEnvironmentServicesBySlug(
      context,
      consumerProdEnvAppId
    );

    assert(
      nsList.filter((ns) => ns.name === consumerProdEnv.product.namespace)
        .length === 1,
      `Consumer Product Environment ${consumerProdEnvAppId} not found`
    );

    // create the application if it does not exist
    const app = {
      appId: `sdx${consumerProdEnv.appId}`,
      name: `${consumerProdEnv.product.name} ${consumerProdEnv.name}`,
      description: `SDX Resource Locator: ${formatResourceLocator(
        orgMemberID,
        consumerProdEnv
      )} (Gateway ID ${consumerProdEnv.product.namespace})`,
      owner: { id: userId },
      namespace: consumerProdEnv.product.namespace,
    } as Application;

    const appId = await UpsertApplication(context, app);
    logger.debug('App ID: %s', appId);

    // get the provider product environment details
    const providerProdEnv = await lookupProductEnvironmentServicesBySlug(
      context,
      providerProdEnvAppId
    );

    // get the provider credential issuer details
    const providerCredIssuer = await lookupCredentialIssuerById(
      context,
      providerProdEnv.credentialIssuer.id
    );
    providerProdEnv.credentialIssuer = providerCredIssuer;

    const clientName = `${formatResourceLocator(
      orgMemberID,
      consumerProdEnv
    )} TO ${formatResourceLocator(orgMemberID, providerProdEnv)}`;

    // prepare the access request
    const controls = {
      clientName,
      subjectDn: accessPointDN,
      //defaultClientScopes: [],
      optionalClientScopes,
    };

    const accessRequestData = {
      acceptLegal: false,
      additionalDetails: 'here is some additional details',
      controls: JSON.stringify(controls),
      name: clientName,
      applicationId: appId,
      productEnvironmentId: providerProdEnv.id,
      requestor: userId,
    } as any;

    // create the access request
    const accessRequestCreated = await addAccessRequest(
      context,
      accessRequestData
    );

    // collect the credentials
    const creds = await collectCredentials(context, accessRequestCreated.id);
    const credDetails = JSON.parse(creds.credential);

    // get the latest details of the access request
    const accessRequest = await getAccessRequest(
      context,
      accessRequestCreated.id
    );

    // add some standard labels to the consumer
    const labels = [
      {
        labelGroup: 'sdx-res-locator',
        values: [formatResourceLocator(orgMemberID, consumerProdEnv)],
      },
      { labelGroup: 'sdx-member', values: [orgMemberID] },
    ];

    if (businessProcess) {
      labels.push({ labelGroup: 'purpose', values: [businessProcess] });
    }

    await saveConsumerLabels(
      context,
      providerProdEnv.product.namespace,
      accessRequest.serviceAccess.consumer.id,
      labels
    );

    return {
      application: app,
      providerProdEnv,
      accessRequest,
      credential: credDetails,
    };
  } catch (error) {
    logger.error('OrgAccessRequestCreate error: %s', error?.message || error);
    throw error;
  }
};

const UpsertApplication = async (
  context: any,
  application: Application
): Promise<string> => {
  const ns = application.namespace;
  const apps = await lookupApplicationsByNamespaces(context, [ns]);
  if (apps.filter((a) => a.appId === application.appId).length > 0) {
    logger.debug(`Application ${application.appId} already exists`);
    return apps.find((a) => a.appId === application.appId).id;
  } else {
    const app = await createApplication(context, {
      appId: application.appId,
      name: application.name,
      description: application.description,
      ownerId: application.owner?.id,
      namespace: application.namespace,
    });
    return app.id;
  }
};

const checkAccessRequestExists = async (
  context: any,
  namespace: string,
  applicationId: string,
  productEnvironmentId: string
): Promise<boolean> => {
  const accessRequests = await getAccessRequestsByNamespace(context, [
    namespace,
  ]);
  return (
    accessRequests.filter(
      (ar) =>
        ar.application.id === applicationId &&
        ar.productEnvironment.id === productEnvironmentId
    ).length > 0
  );
};

const formatResourceLocator = (
  orgMemberID: string,
  serviceProdEnv: Environment
): string => {
  const env = serviceProdEnv.name.toUpperCase();
  const serviceId = serviceProdEnv.product.name;

  return `/${env}/${orgMemberID}/${serviceId}`;
};
