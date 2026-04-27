import { Keystone } from '@keystonejs/keystone';
import { Logger } from '../../logger';
import {
  getRecords,
  removeEmpty,
  removeKeys,
  syncRecordsThrowErrors,
} from '../../batch/feed-worker';
import { ConnectionRequest, OpenAPISpec, Subsystem } from './types';
import { BatchResult } from 'batch/types';
import {
  ConnectionRequestUpdateInput,
  ConnectionRequest as KeystoneConnectionRequest,
  Subsystem as KeystoneSubsystem,
  OpenApiSpec as KeystoneOpenApiSpec,
  ConnectionRequestsUpdateInput,
} from '../keystone/types';
import { ConnectionRequestInput } from '../../controllers/sdx/v1/types';
import { SubsystemService } from './subsystem';
import { OpenAPISpecService } from './oas-service';
import { strict as assert } from 'assert';
import { assertEqual } from '../../controllers/ioc/assert';

const logger = Logger('batch.connection');

export interface ConnectionRequestUpdateParams {
  client: KeystoneSubsystem;
  service: KeystoneOpenApiSpec;
  request: ConnectionRequestInput;
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
    assertEqual(
      body.isApproved === true && serviceSpec.organization.name === org,
      true,
      'isApproved',
      'Cannot approve connection request when service organization does not match the specified organization'
    );

    assertEqual(
      body.isApproved == false && clientSubsystem.organization.name === org,
      true,
      'clientId',
      'Only client subsystems can create connection requests for their own organization'
    );

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
      query: '$id: String',
      clause: '{ id: $id}',
      variables: { id },
    };

    const records: KeystoneConnectionRequest[] = await getRecords(
      context,
      'ConnectionRequest',
      'allConnectionRequests',
      [],
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

  listConnectionsByOrganization = async (
    context: Keystone,
    org: string
  ): Promise<KeystoneConnectionRequest[]> => {
    const batchClause = {
      query: '$org: String',
      clause:
        '{ OR: [{ clientOrganization: { name: $org } }, { providerOrganization: { name: $org } }] }',
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
