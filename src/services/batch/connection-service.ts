import { Keystone } from '@keystonejs/keystone';
import { Logger } from '../../logger';
import {
  deleteRecordByInternalId,
  deleteRecordByInternalIdThrowErrors,
  getRecords,
  removeKeys,
  syncRecordsThrowErrors,
} from '../../batch/feed-worker';
import { BatchResult } from 'batch/types';
import {
  ConnectionRequestUpdateInput,
  ConnectionRequest as KeystoneConnectionRequest,
  Subsystem as KeystoneSubsystem,
  OpenApiSpec as KeystoneOpenApiSpec,
} from '../keystone/types';
import {
  ConnectionLifecycleActionInput,
  ConnectionRequestInput,
} from '../../controllers/sdx/v1/types';
import { SubsystemService } from './subsystem';
import { OpenAPISpecService } from './oas-service';
import { strict as assert } from 'assert';
import { assertEqual } from '../../controllers/ioc/assert';
import { ProvisionerService } from '../provisioner';
import { recordActivityWithBlob } from '../keystone/activity';
import { cloneDeep, get, has, isEqual, set, unset } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
const {
  lifecycleActionError,
  parseJsonObject,
} = require('./connection-lifecycle');

const logger = Logger('batch.connection');

const R1_MANAGED_CLIENT_RESOURCE_PATHS = [
  ['gatewayPatterns', 'sdx-p2p-consumer-access.r1', 'integrationClientId'],
  ['gatewayPatterns', 'sdx-p2p-consumer.r1', 'upgrades', 'token'],
  ['gatewayPatterns', 'sdx-p2p-consumer.r1', 'upgrades', 'acl'],
  ['gatewayPatterns', 'sdx-p2p-consumer.r1', 'upgrades', 'tokenExchange'],
];
const R1_MANAGED_SERVICE_RESOURCE_PATHS = [
  ['gatewayPatterns', 'sdx-p2p-provider.r1', 'upgrades', 'token'],
  ['gatewayPatterns', 'sdx-p2p-provider.r1', 'upgrades', 'tokenExchange'],
];

const resourceObject = (value: any): any =>
  typeof value === 'string' ? JSON.parse(value) : value || {};

const PROPOSAL_FIELDS = [
  'policyVersion',
  'environment',
  'requesterDetails',
  'clientResources',
  'serviceResources',
] as const;

const hasOwn = (value: any, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value || {}, key);

const CONFIGURATION_OBJECT_FIELDS = [
  'requesterDetails',
  'clientResources',
  'serviceResources',
];

const configurationValue = (field: string, value: any): any =>
  CONFIGURATION_OBJECT_FIELDS.includes(field) ? resourceObject(value) : value;

const connectionConfiguration = (connection: any): Record<string, any> =>
  PROPOSAL_FIELDS.reduce((configuration, field) => {
    if (connection && connection[field] !== undefined) {
      configuration[field] = configurationValue(field, connection[field]);
    }
    return configuration;
  }, {} as Record<string, any>);

const proposedConfiguration = (
  existing: KeystoneConnectionRequest,
  submitted: ConnectionRequestInput
): Record<string, any> => {
  const proposal = {
    ...connectionConfiguration(existing),
    ...connectionConfiguration(parseJsonObject(existing.proposedConfiguration)),
  };
  PROPOSAL_FIELDS.forEach((field) => {
    const value = (submitted as any)[field];
    if (
      hasOwn(submitted, field) &&
      !(CONFIGURATION_OBJECT_FIELDS.includes(field) && value == null)
    ) {
      proposal[field] = configurationValue(field, value);
    }
  });
  return proposal;
};

const normalizedScopes = (requesterDetails: any): string[] | undefined => {
  const scopes = resourceObject(requesterDetails).scopes;
  if (
    !Array.isArray(scopes) ||
    scopes.some((scope) => typeof scope !== 'string')
  ) {
    return undefined;
  }
  return [...new Set(scopes as string[])].sort((left, right) =>
    left.localeCompare(right)
  );
};

const applyConsumerScopeRevocations = (
  existing: KeystoneConnectionRequest,
  submitted: ConnectionRequestInput
):
  | {
      requesterDetails: Record<string, any>;
      proposal: Record<string, any>;
    }
  | undefined => {
  const approvedScopes = normalizedScopes(existing.requesterDetails);
  const requestedScopes = normalizedScopes(submitted.requesterDetails);
  if (!approvedScopes || !requestedScopes) {
    return undefined;
  }

  const requested = new Set(requestedScopes);
  const retainedScopes = approvedScopes.filter((scope) =>
    requested.has(scope)
  );
  if (retainedScopes.length === approvedScopes.length) {
    return undefined;
  }

  const approvedRequesterDetails = resourceObject(existing.requesterDetails);
  const submittedRequesterDetails = resourceObject(submitted.requesterDetails);
  const requesterDetails = cloneDeep(submittedRequesterDetails);
  requesterDetails.scopes = retainedScopes;

  // A service version change still requires provider approval. Apply the new
  // submission metadata now so the immediate revocation callback can be
  // correlated, while retaining the currently approved service version.
  if (approvedRequesterDetails.service?.version !== undefined) {
    requesterDetails.service = {
      ...requesterDetails.service,
      version: approvedRequesterDetails.service.version,
    };
  }

  const proposal = proposedConfiguration(existing, submitted);
  const configurationAfterRevocation: Record<string, any> = {
    ...connectionConfiguration(existing),
    requesterDetails,
  };
  const hasPendingChanges = PROPOSAL_FIELDS.some(
    (field) =>
      !isEqual(proposal[field], configurationAfterRevocation[field])
  );

  return {
    requesterDetails,
    proposal: hasPendingChanges ? proposal : {},
  };
};

const preserveManagedR1Settings = (
  submitted: any,
  stored: any,
  managedPaths: string[][]
): any => {
  const result = cloneDeep(resourceObject(submitted));
  const current = resourceObject(stored);

  managedPaths.forEach((path) => {
    if (has(current, path)) {
      set(result, path, cloneDeep(get(current, path)));
    } else {
      unset(result, path);
    }
  });

  return result;
};

export interface ConnectionRequestUpdateParams {
  client: KeystoneSubsystem;
  service: KeystoneOpenApiSpec;
  request: ConnectionRequestInput;
}

export interface ConnectionRequestDeleteStatus {
  clientTag: string;
  serviceTag: string;
  clientConfigCount: number;
  serviceConfigCount: number;
}

class ConnectionService {
  upsertConnection = async (
    context: Keystone,
    org: string,
    body: ConnectionRequestInput
  ): Promise<BatchResult> => {
    // lookup the client subsystem
    const service = new SubsystemService();
    const clientSubsystem = await service.findSubsystemByClientId(
      context,
      body.clientId
    );
    logger.debug(
      'Found client subsystem for clientId %s: %j',
      body.clientId,
      clientSubsystem
    );

    // lookup the service spec
    const oasService = new OpenAPISpecService();
    const serviceSpec = await oasService.findOpenAPISpecByName(
      context,
      body.serviceId
    );
    if (!serviceSpec) {
      throw new Error('Invalid serviceId');
    }

    if (body.environment && serviceSpec.environment !== body.environment) {
      throw new Error(
        `Service environment '${serviceSpec.environment}' does not match requested connection environment '${body.environment}'`
      );
    } else {
      body.environment = serviceSpec.environment as any;
    }

    const existing = await this.findConnection(
      (context as any).createContext({ skipAccessControl: true }),
      body.clientId,
      body.serviceId
    );

    // Preserve each R1 setting managed by the authoritative policy while
    // retaining submitted changes to resource settings callers may customize.
    if (existing?.policyVersion === 'SDX.R1.00') {
      if (body.clientResources != null) {
        body.clientResources = preserveManagedR1Settings(
          body.clientResources,
          existing.clientResources,
          R1_MANAGED_CLIENT_RESOURCE_PATHS
        );
      }
      if (body.serviceResources != null) {
        body.serviceResources = preserveManagedR1Settings(
          body.serviceResources,
          existing.serviceResources,
          R1_MANAGED_SERVICE_RESOURCE_PATHS
        );
      }
    }

    const configurationSubmitted = PROPOSAL_FIELDS.some(
      (field) =>
        hasOwn(body, field) &&
        !(
          CONFIGURATION_OBJECT_FIELDS.includes(field) &&
          (body as any)[field] == null
        ) &&
        !isEqual(
          configurationValue(field, (body as any)[field]),
          configurationValue(field, (existing as any)?.[field])
        )
    );
    const proposesApprovedChange = Boolean(
      existing?.isApproved === true &&
        (body.isApproved === false ||
          (body.isApproved === undefined && configurationSubmitted))
    );

    // Runtime state is changed only through the explicit lifecycle endpoint.
    // Legacy callers may still resend isActive with configuration updates; keep
    // the approved connection's current runtime state in that case.
    if (existing?.isApproved === true) {
      delete body.isActive;
    }

    if (proposesApprovedChange) {
      assertEqual(
        clientSubsystem.organization.name === org ||
          serviceSpec.organization.name === org,
        true,
        'clientId',
        'Only the client or service organization can propose connection changes'
      );
      const consumerRevocation =
        existing!.policyVersion === 'SDX.R1.00' &&
        clientSubsystem.organization.name === org
          ? applyConsumerScopeRevocations(existing!, body)
          : undefined;
      return await syncRecordsThrowErrors(
        context,
        'ConnectionRequest',
        undefined,
        {
          clientId: body.clientId,
          serviceId: body.serviceId,
          ...(consumerRevocation
            ? {
                requesterDetails: consumerRevocation.requesterDetails,
                proposedConfiguration: consumerRevocation.proposal,
              }
            : {
                proposedConfiguration: proposedConfiguration(existing!, body),
              }),
        }
      );
    }

    // `isApproved` is only an approval decision when it changes the stored value.
    // Callers such as the SDX UI Customize save resend the current value along
    // with other changes, so an unchanged value is dropped rather than treated
    // as approving or un-approving.
    let isResentApproval = false;
    if (typeof body.isApproved === 'boolean') {
      if (existing && Boolean(existing.isApproved) === body.isApproved) {
        delete body.isApproved;
        isResentApproval = true;
      }
    }

    // if approving or un-approving the connection, validate the service belongs to the specified organization
    if (body.isApproved === true || body.isApproved === false) {
      assertEqual(
        serviceSpec.organization.name === org,
        true,
        'isApproved',
        'Cannot approve/reject connection request when service organization does not match the specified organization'
      );
    } else if (isResentApproval) {
      assertEqual(
        clientSubsystem.organization.name === org ||
          serviceSpec.organization.name === org,
        true,
        'clientId',
        'Only the client or service organization can update a connection request'
      );
    } else {
      assertEqual(
        clientSubsystem.organization.name === org,
        true,
        'clientId',
        'Only client subsystems can create connection requests for their own organization'
      );
    }

    const result = await syncRecordsThrowErrors(
      context,
      'ConnectionRequest',
      undefined,
      body
    );
    return result;
  };

  decideProposedConfiguration = async (
    context: Keystone,
    org: string,
    clientId: string,
    serviceId: string,
    approve: boolean
  ): Promise<BatchResult> => {
    const existing = await this.findConnection(
      (context as any).createContext({ skipAccessControl: true }),
      clientId,
      serviceId
    );
    assertEqual(
      Boolean(existing),
      true,
      'clientId',
      'Connection request not found'
    );

    const serviceSpec = await new OpenAPISpecService().findOpenAPISpecByName(
      context,
      serviceId
    );
    assertEqual(
      serviceSpec.organization.name === org,
      true,
      'organization',
      'Only the service owner can approve or reject proposed connection changes'
    );

    const proposal = parseJsonObject(existing!.proposedConfiguration);
    assertEqual(
      Object.keys(proposal).length > 0,
      true,
      'proposedConfiguration',
      'This connection has no proposed changes awaiting approval'
    );

    const data: any = {
      clientId,
      serviceId,
      proposedConfiguration: {},
    };
    if (approve) {
      Object.assign(data, proposal, { isApproved: true });
    }

    return await syncRecordsThrowErrors(
      context,
      'ConnectionRequest',
      undefined,
      data
    );
  };

  revokeConnection = async (
    context: Keystone,
    org: string,
    id: string
  ): Promise<BatchResult> => {
    let connection: KeystoneConnectionRequest;
    try {
      connection = await this.getConnectionById(context, id);
    } catch (err) {
      const isMissingConnection =
        err instanceof Error && err.message === 'Connection request not found';
      if (isMissingConnection) {
        return { status: 200, result: 'already-revoked', id };
      }
      throw err;
    }

    await this.assertRelatedOrganization(context, org, connection);
    const currentIntent = parseJsonObject(connection.lifecycleIntent);
    const requestedAction =
      currentIntent.action === 'revoke' ? 'retry' : 'revoke';
    const policyError = lifecycleActionError(
      connection,
      requestedAction
    );
    assertEqual(
      policyError,
      undefined,
      'action',
      policyError || 'Invalid revoke action'
    );

    return await this.orchestrateRevoke(
      context,
      org,
      connection,
      requestedAction
    );
  };

  lifecycleConnection = async (
    context: Keystone,
    org: string,
    id: string,
    input: ConnectionLifecycleActionInput
  ): Promise<BatchResult> => {
    let connection: KeystoneConnectionRequest;
    try {
      connection = await this.getConnectionById(context, id);
    } catch (err) {
      const isMissingConnection =
        err instanceof Error && err.message === 'Connection request not found';
      if (
        isMissingConnection && input.action === 'retry'
      ) {
        return { status: 200, result: 'already-revoked', id };
      }
      throw err;
    }

    await this.assertRelatedOrganization(context, org, connection);
    const policyError = lifecycleActionError(connection, input.action, input);
    assertEqual(
      policyError,
      undefined,
      'action',
      policyError || 'Invalid lifecycle action'
    );

    const currentIntent = parseJsonObject(connection.lifecycleIntent);
    if (input.action === 'retry' && currentIntent.action === 'revoke') {
      return await this.orchestrateRevoke(
        context,
        org,
        connection,
        input.action
      );
    }

    const status = parseJsonObject(connection.provisionerStatus);
    let targetActive: boolean;
    if (input.action === 'retry') {
      targetActive = status.operation === 'provision';
    } else {
      targetActive = input.action === 'activate';
    }
    const operationId = uuidv4();
    const intent = {
      action: input.action,
      operationId,
      phase: targetActive ? 'provision' : 'deprovision',
      ...(input.confirmAbandonRevoke ? { confirmAbandonRevoke: true } : {}),
    };

    return await syncRecordsThrowErrors(
      context,
      'ConnectionRequest',
      undefined,
      {
        clientId: connection.clientId,
        serviceId: connection.serviceId,
        isActive: targetActive,
        lifecycleIntent: intent,
      }
    );
  };

  private orchestrateRevoke = async (
    context: Keystone,
    org: string,
    connection: KeystoneConnectionRequest,
    requestedAction: 'retry' | 'revoke'
  ): Promise<BatchResult> => {
    let current = connection;
    let status = parseJsonObject(current.provisionerStatus);
    let intent = parseJsonObject(current.lifecycleIntent);
    const operationId =
      intent.action === 'revoke' && intent.operationId
        ? intent.operationId
        : uuidv4();

    await this.recordLifecycleActivity(
      context,
      org,
      current,
      requestedAction,
      operationId,
      status.status === 'deprovisioned' ? 'delete' : 'deprovision',
      'pending',
      `${requestedAction === 'retry' ? 'Retrying' : 'Revoking'} connection ${
        current.clientId
      } -> ${current.serviceId}.`
    );

    if (current.isActive || status.status !== 'deprovisioned') {
      try {
        await syncRecordsThrowErrors(context, 'ConnectionRequest', undefined, {
          clientId: current.clientId,
          serviceId: current.serviceId,
          isActive: false,
          lifecycleIntent: {
            action: 'revoke',
            operationId,
            phase: 'deprovision',
          },
        });
        current = await this.getConnectionById(context, current.id!);
        status = parseJsonObject(current.provisionerStatus);
      } catch (err) {
        logger.error(
          'Revoke cleanup failed for connection %s: %s',
          current.id,
          err
        );
        await this.recordLifecycleActivity(
          context,
          org,
          current,
          'revoke',
          operationId,
          'deprovision',
          'failed',
          `Revoke failed while removing access configuration for ${current.clientId} -> ${current.serviceId}.`
        );
        assertEqual(
          false,
          true,
          'action',
          'Revoke failed while removing access configuration. Access may be partially removed. Retry revoke.'
        );
      }
    }

    if (status.status !== 'deprovisioned') {
      await this.recordLifecycleActivity(
        context,
        org,
        current,
        'revoke',
        operationId,
        'deprovision',
        'failed',
        `Revoke failed while removing access configuration for ${current.clientId} -> ${current.serviceId}.`
      );
    }
    assertEqual(
      status.status,
      'deprovisioned',
      'action',
      'Revoke failed while removing access configuration. Access may be partially removed. Retry revoke.'
    );

    const { clientSubsystem, serviceSpec } =
      await this.assertRelatedOrganization(context, org, current);
    let deleteStatus: ConnectionRequestDeleteStatus;
    try {
      deleteStatus = await this.getConnectionDeleteStatus(
        current,
        clientSubsystem,
        serviceSpec
      );
    } catch (err) {
      logger.error(
        'Unable to verify revoke cleanup for connection %s: %s',
        current.id,
        err
      );
      await this.recordLifecycleActivity(
        context,
        org,
        current,
        'revoke',
        operationId,
        'verify',
        'failed',
        `Revoke could not verify access removal for ${current.clientId} -> ${current.serviceId}.`
      );
      assertEqual(
        false,
        true,
        'action',
        'Revoke failed while removing access configuration. Access may be partially removed. Retry revoke.'
      );
      throw err;
    }
    if (
      deleteStatus.clientConfigCount + deleteStatus.serviceConfigCount !==
      0
    ) {
      await this.recordLifecycleActivity(
        context,
        org,
        current,
        'revoke',
        operationId,
        'verify',
        'failed',
        `Revoke found remaining access configuration for ${current.clientId} -> ${current.serviceId}.`
      );
    }
    assertEqual(
      deleteStatus.clientConfigCount + deleteStatus.serviceConfigCount,
      0,
      'action',
      'Revoke failed while removing access configuration. Access may be partially removed. Retry revoke.'
    );

    try {
      await syncRecordsThrowErrors(context, 'ConnectionRequest', undefined, {
        clientId: current.clientId,
        serviceId: current.serviceId,
        lifecycleIntent: {
          action: 'revoke',
          operationId,
          phase: 'delete',
        },
      });
      const result = await this.deleteConnection(context, org, current.id!, true);
      await this.recordLifecycleActivity(
        context,
        org,
        current,
        'revoke',
        operationId,
        'delete',
        'success',
        `Revoked connection ${current.clientId} -> ${current.serviceId}.`
      );
      return result;
    } catch (err) {
      logger.error(
        'Final revoke deletion failed for connection %s: %s',
        current.id,
        err
      );
      await this.recordLifecycleActivity(
        context,
        org,
        current,
        'revoke',
        operationId,
        'delete',
        'failed',
        `Access was removed but the connection record could not be deleted for ${current.clientId} -> ${current.serviceId}.`
      );
      assertEqual(
        false,
        true,
        'action',
        'Access has been removed, but the connection record could not be deleted. The client no longer has access. Retry revoke to finish.'
      );
      throw err;
    }
  };

  private recordLifecycleActivity = async (
    context: Keystone,
    org: string,
    connection: KeystoneConnectionRequest,
    action: 'activate' | 'deactivate' | 'retry' | 'revoke',
    operationId: string,
    phase: string,
    result: 'pending' | 'success' | 'failed',
    message: string
  ): Promise<void> => {
    try {
      const activityContext = JSON.stringify({
        message: '{action} connection {client} -> {service}: {result}',
        params: {
          action,
          client: connection.clientId,
          service: connection.serviceId,
          result,
        },
      });
      const activityContextClient =
        typeof (context as any).sudo === 'function'
          ? (context as any).sudo()
          : context;
      await recordActivityWithBlob(
        activityContextClient,
        action,
        'ConnectionRequest',
        connection.id!,
        message,
        result,
        activityContext,
        { action, operationId, phase },
        [
          `org:${org}`,
          `sdxClient:${connection.clientId}`,
          `sdxService:${connection.serviceId}`,
        ]
      );
    } catch (err) {
      logger.error(
        'Unable to record %s lifecycle activity for connection %s: %s',
        action,
        connection.id,
        err
      );
    }
  };

  private assertRelatedOrganization = async (
    context: Keystone,
    org: string,
    connection: KeystoneConnectionRequest
  ): Promise<{
    clientSubsystem: KeystoneSubsystem;
    serviceSpec: KeystoneOpenApiSpec;
  }> => {
    const clientSubsystem =
      await new SubsystemService().findSubsystemByClientId(
        context,
        connection.clientId!
      );
    const serviceSpec = await new OpenAPISpecService().findOpenAPISpecByName(
      context,
      connection.serviceId!
    );
    assertEqual(
      clientSubsystem.organization.name === org ||
        serviceSpec.organization.name === org ||
        serviceSpec.subsystem?.organization?.name === org,
      true,
      'organization',
      'Organization not related to this connection request'
    );
    return { clientSubsystem, serviceSpec };
  };

  findConnection = async (
    context: Keystone,
    clientId: string,
    serviceId: string
  ): Promise<KeystoneConnectionRequest | undefined> => {
    const records: KeystoneConnectionRequest[] = await getRecords(
      context,
      'ConnectionRequest',
      'allConnectionRequests',
      [],
      {
        query: '$clientId: String, $serviceId: String',
        clause: '{ clientId: $clientId, serviceId: $serviceId }',
        variables: { clientId, serviceId },
      }
    );
    return records.pop();
  };

  // R0 records the user who created the request as the requester. Later
  // updates keep that requester, so notifications reach the original
  // requester rather than whoever last changed the connection.
  applyR0Requester = (
    input: ConnectionRequestInput,
    existing: KeystoneConnectionRequest | undefined,
    caller: { name?: string; email?: string }
  ): ConnectionRequestInput => {
    const policyVersion = input.policyVersion ?? existing?.policyVersion;
    if (
      policyVersion !== 'SDX.R0.00' ||
      (existing && !input.requesterDetails)
    ) {
      return input;
    }

    let existingRequester;
    try {
      const details =
        typeof existing?.requesterDetails === 'string'
          ? JSON.parse(existing.requesterDetails)
          : existing?.requesterDetails;
      existingRequester = details?.requester;
    } catch {
      existingRequester = undefined;
    }

    return {
      ...input,
      requesterDetails: {
        ...input.requesterDetails,
        requester: existingRequester ?? {
          name: caller.name,
          email: caller.email,
        },
      },
    };
  };

  getConnectionById = async (
    context: Keystone,
    id: string
  ): Promise<KeystoneConnectionRequest> => {
    const batchClause = {
      query: '$id: ID',
      clause: '{ id: $id}',
      variables: { id },
    };

    const records: KeystoneConnectionRequest[] = await getRecords(
      context,
      'ConnectionRequest',
      'allConnectionRequests',
      ['clientOrganization', 'serviceOrganization'],
      batchClause
    );
    assert.strictEqual(
      records.length === 1,
      true,
      'Connection request not found'
    );

    records.forEach((o) => removeKeys(o, ['slug']));

    return records.pop();
  };

  buildConnectionConfigTags = (
    connection: KeystoneConnectionRequest,
    clientSubsystem: KeystoneSubsystem,
    serviceSpec: KeystoneOpenApiSpec
  ): { clientTag: string; serviceTag: string } => {
    assert.strictEqual(
      Boolean(clientSubsystem.namespace),
      true,
      'Client subsystem gateway not found'
    );
    assert.strictEqual(
      Boolean(serviceSpec.subsystem?.namespace),
      true,
      'Service subsystem gateway not found'
    );

    return {
      clientTag: `ns.${clientSubsystem.namespace}.${connection.id}.c`,
      serviceTag: `ns.${serviceSpec.subsystem.namespace}.${connection.id}.p`,
    };
  };

  getConnectionDeleteStatus = async (
    connection: KeystoneConnectionRequest,
    clientSubsystem: KeystoneSubsystem,
    serviceSpec: KeystoneOpenApiSpec
  ): Promise<ConnectionRequestDeleteStatus> => {
    const { clientTag, serviceTag } = this.buildConnectionConfigTags(
      connection,
      clientSubsystem,
      serviceSpec
    );

    assert.strictEqual(
      Boolean(process.env.PROVISIONER_URL),
      true,
      'PROVISIONER_URL not set'
    );

    const provisioner = new ProvisionerService(process.env.PROVISIONER_URL!);

    const [clientConfig, serviceConfig] = await Promise.all([
      provisioner.getGatewayResources(
        clientSubsystem.namespace!,
        connection.environment!,
        clientTag
      ),
      provisioner.getGatewayResources(
        serviceSpec.subsystem!.namespace!,
        connection.environment!,
        serviceTag
      ),
    ]);

    return {
      clientTag,
      serviceTag,
      clientConfigCount: clientConfig.length,
      serviceConfigCount: serviceConfig.length,
    };
  };

  deleteConnection = async (
    context: Keystone,
    org: string,
    id: string,
    allowApproved = false
  ): Promise<BatchResult> => {
    const connection = await this.getConnectionById(context, id);

    const subsystemService = new SubsystemService();
    const clientSubsystem = await subsystemService.findSubsystemByClientId(
      context,
      connection.clientId
    );

    const oasService = new OpenAPISpecService();
    const serviceSpec = await oasService.findOpenAPISpecByName(
      context,
      connection.serviceId
    );

    assertEqual(
      clientSubsystem.organization.name === org ||
        serviceSpec.subsystem!.organization.name === org,
      true,
      'organization',
      `Organization not related to this connection request`
    );

    assertEqual(
      Boolean(connection.isApproved && !allowApproved),
      false,
      'action',
      'Use DELETE with action=revoke to revoke an approved connection'
    );

    assertEqual(
      Boolean(!connection.isApproved && connection.isActive),
      false,
      'isActive',
      'Cannot reject changes by deleting an active connection. Existing access must be preserved; revoke the connection separately.'
    );

    assertEqual(
      Boolean(connection.isActive),
      false,
      'isActive',
      'Cannot revoke an active connection. Deactivate it and wait for access configuration removal to finish.'
    );

    if (connection.isApproved) {
      const provisionerStatus = resourceObject(connection.provisionerStatus);
      assertEqual(
        provisionerStatus.status === 'deprovisioned',
        true,
        'provisionerStatus',
        'Cannot revoke this connection until its access configuration has been removed. Deactivate it and wait for access configuration removal to finish.'
      );
    }

    const status = await this.getConnectionDeleteStatus(
      connection,
      clientSubsystem,
      serviceSpec
    );

    const remainingConfigMessages: string[] = [];

    if (status.clientConfigCount > 0) {
      remainingConfigMessages.push(
        `client gateway configuration still exists for tag ${status.clientTag}`
      );
    }

    if (status.serviceConfigCount > 0) {
      remainingConfigMessages.push(
        `service gateway configuration still exists for tag ${status.serviceTag}`
      );
    }

    assert.strictEqual(
      remainingConfigMessages.length === 0,
      true,
      `Connection request cannot be deleted because ${remainingConfigMessages.join(
        ' and '
      )}`
    );

    return await deleteRecordByInternalIdThrowErrors(
      context,
      'ConnectionRequest',
      id
    );
  };

  listConnectionsByOrganization = async (
    context: Keystone,
    org: string
  ): Promise<KeystoneConnectionRequest[]> => {
    const batchClause = {
      query: '$org: String',
      clause:
        '{ OR: [{ clientOrganization: { name: $org } }, { serviceOrganization: { name: $org } }] }',
      variables: { org },
    };

    const records: KeystoneConnectionRequest[] = await getRecords(
      context,
      'ConnectionRequest',
      'allConnectionRequests',
      [],
      batchClause
    );
    return records;
  };

  /**
   * Lists connections for services belonging to the given subsystem gateway
   * namespaces (rather than the whole org) - used to scope the list to just
   * what a Connection.Manage-only caller (no org-wide System.Manage) has been
   * granted, mirroring GatewayServiceController's Subsystem.Manage list filtering.
   */
  listConnectionsByServiceNamespaces = async (
    context: Keystone,
    org: string,
    namespaces: string[]
  ): Promise<KeystoneConnectionRequest[]> => {
    const serviceIds = await this.getServiceIdsForNamespaces(
      context,
      org,
      namespaces
    );
    if (serviceIds.length === 0) {
      return [];
    }

    const batchClause = {
      query: '$serviceIds: [String]',
      clause: '{ serviceId_in: $serviceIds }',
      variables: { serviceIds },
    };

    const records: KeystoneConnectionRequest[] = await getRecords(
      context,
      'ConnectionRequest',
      'allConnectionRequests',
      [],
      batchClause
    );
    return records;
  };

  private getServiceIdsForNamespaces = async (
    context: Keystone,
    org: string,
    namespaces: string[]
  ): Promise<string[]> => {
    const result: any = await (context as any).executeGraphQL({
      query: `query ServicesByNamespaces($org: String!, $namespaces: [String]) {
        allOpenAPISpecs(where: { organization: { name: $org }, namespace_in: $namespaces }) {
          name
        }
      }`,
      variables: { org, namespaces },
    });
    return (result.data?.allOpenAPISpecs || []).map((s: any) => s.name);
  };

  listConnectionsByClientId = async (
    context: Keystone,
    clientId: string
  ): Promise<KeystoneConnectionRequest[]> => {
    const batchClause = {
      query: '$clientId: String',
      clause: '{ clientId: $clientId }',
      variables: { clientId },
    };

    const records: KeystoneConnectionRequest[] = await getRecords(
      context,
      'ConnectionRequest',
      'allConnectionRequests',
      [],
      batchClause
    );
    return records;
  };
}

export { ConnectionService };
