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
import { ConnectionRequestInput } from '../../controllers/sdx/v1/types';
import { SubsystemService } from './subsystem';
import { OpenAPISpecService } from './oas-service';
import { strict as assert } from 'assert';
import { assertEqual } from '../../controllers/ioc/assert';
import { ProvisionerService } from '../provisioner';

const logger = Logger('batch.connection');

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

    // `isApproved` is only an approval decision when it changes the stored value.
    // Callers such as the SDX UI Customize save resend the current value along
    // with other changes, so an unchanged value is dropped rather than treated
    // as approving or un-approving.
    let isResentApproval = false;
    if (typeof body.isApproved === 'boolean') {
      const existing = await this.findConnection(
        (context as any).createContext({ skipAccessControl: true }),
        body.clientId,
        body.serviceId
      );
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
    id: string
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
