import { Keystone } from '@keystonejs/keystone';
import { Logger } from '../../logger';
import {
  deleteRecordByInternalId,
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
import { KongTagService } from '../kong/tag-service';

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
    body: ConnectionRequestUpdateInput
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

    // if approving the connection, validate the client and service belong to the same organization
    if (body.isApproved) {
      assertEqual(
        serviceSpec.organization.name === org,
        true,
        'isApproved',
        'Cannot approve connection request when service organization does not match the specified organization'
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

    assert.strictEqual(Boolean(process.env.KONG_URL), true, 'KONG_URL not set');

    const kongTagService = new KongTagService(process.env.KONG_URL);
    const [clientConfig, serviceConfig] = await Promise.all([
      kongTagService.listTaggedConfig(clientTag),
      kongTagService.listTaggedConfig(serviceTag),
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

    assertEqual(
      clientSubsystem.organization.name === org,
      true,
      'organization',
      'Not authorized to access this connection request'
    );

    const oasService = new OpenAPISpecService();
    const serviceSpec = await oasService.findOpenAPISpecByName(
      context,
      connection.serviceId
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

    return await deleteRecordByInternalId(context, 'ConnectionRequest', id);
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
}

export { ConnectionService };