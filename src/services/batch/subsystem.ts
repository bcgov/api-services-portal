import { BatchResult } from '../../batch/types';
import {
  deleteRecordByInternalId,
  getRecords,
  removeEmpty,
  removeKeys,
  replaceKey,
  syncRecordsThrowErrors,
  transformAllRefID,
} from '../../batch/feed-worker';
import { regExprValidation } from '../utils';
import { strict as assert } from 'assert';
import { Subsystem } from './types';
import {
  ConnectionRequest as KeystoneConnectionRequest,
  Subsystem as KeystoneSubsystem,
} from '../keystone/types';
import { Keystone } from '@keystonejs/keystone';
import {
  GetSubsystemEntryForSubsystem,
  ParseClientId,
} from '../gateway-patterns/catalog';
import { Logger } from '../../logger';
import { OpenAPISpecService } from './oas-service';
import { getNamespaceDetails } from '../workflow/get-namespaces';

const logger = Logger('batch.subsystem');

class SubsystemService {
  validateSubsystem = (name: string): void => {
    regExprValidation(
      '^[A-Z0-9-]{3,20}$',
      name,
      "Subsystem name must be between 3 and 20 uppercase alpha-numeric characters (including special character '-')"
    );
  };

  upsertSubsystem = async (
    context: Keystone,
    body: Subsystem
  ): Promise<BatchResult> => {
    const result = await syncRecordsThrowErrors(
      context,
      'Subsystem',
      undefined,
      body
    );
    return result;
  };

  listSubsystemsByOrganization = async (
    context: Keystone,
    org: string
  ): Promise<KeystoneSubsystem[]> => {
    const batchClause = {
      query: '$org: String',
      clause: '{ organization: { name: $org } }',
      variables: { org },
    };

    const records: KeystoneSubsystem[] = await getRecords(
      context,
      'Subsystem',
      'allSubsystems',
      [],
      batchClause
    );
    return records;
  };

  listSubsystems = async (context: Keystone): Promise<KeystoneSubsystem[]> => {
    const records: KeystoneSubsystem[] = await getRecords(
      context,
      'Subsystem',
      'allSubsystems',
      ['organization']
    );
    return records;
  };

  listActiveConnectionsByClientId = async (
    context: Keystone,
    clientId: string
  ): Promise<KeystoneConnectionRequest[]> => {
    return await getRecords(
      context,
      'ConnectionRequest',
      'allConnectionRequests',
      [],
      {
        query: '$clientId: String!',
        clause: '{ clientId: $clientId, isActive: true }',
        variables: { clientId },
      }
    );
  };

  subsystemGatewayExists = async (
    context: Keystone,
    subsystem: KeystoneSubsystem
  ): Promise<boolean> => {
    if (!subsystem.namespace) {
      return false;
    }

    const gatewayDetails = await getNamespaceDetails(context, subsystem.namespace);

    return gatewayDetails != null;
  };

  deleteSubsystem = async (
    context: any,
    org: string,
    name: string,
    force: boolean = false
  ): Promise<BatchResult> => {
    const subsystem = await this.findSubsystemByName(context, org, name);
    const subsystemEntry = GetSubsystemEntryForSubsystem(subsystem);

    const activeClientConnections = await this.listActiveConnectionsByClientId(
      context,
      subsystemEntry.clientId
    );

    assert.strictEqual(
      activeClientConnections.length === 0,
      true,
      'Subsystem cannot be deleted because it has active connection requests as a client'
    );

    const gatewayExists = await this.subsystemGatewayExists(context, subsystem);

    assert.strictEqual(
      gatewayExists,
      false,
      'Subsystem cannot be deleted because gateway configuration exists'
    );

    const oasService = new OpenAPISpecService();
    const serviceSpecs = await oasService.listOpenAPISpecsBySubsystemId(
      context,
      subsystem.id
    );

    const activeProviderConnections: KeystoneConnectionRequest[] = [];
    for (const serviceSpec of serviceSpecs) {
      const activeConnections =
        await oasService.listActiveConnectionsByServiceId(
          context,
          serviceSpec.name
        );
      activeProviderConnections.push(...activeConnections);
    }

    assert.strictEqual(
      activeProviderConnections.length === 0,
      true,
      'Subsystem cannot be deleted because it has active connection requests as a service provider'
    );

    const childResults: BatchResult[] = [];
    for (const serviceSpec of serviceSpecs) {
      childResults.push(
        await deleteRecordByInternalId(context, 'OpenAPISpec', serviceSpec.id)
      );
    }

    const result = await deleteRecordByInternalId(
      context,
      'Subsystem',
      subsystem.id
    );

    result.childResults = [...(result.childResults || []), ...childResults];

    return result;
  };

  findSubsystemByName = async (
    context: Keystone,
    org: string,
    name: string
  ): Promise<KeystoneSubsystem> => {
    const records = await getRecords(
      context,
      'Subsystem',
      undefined,
      ['organization'],
      {
        query: '$org: String!, $name: String!',
        clause: '{ organization: { name: $org }, name: $name }',
        variables: { org, name },
      }
    );

    assert.strictEqual(records.length == 0, false, 'Subsystem not found');
    return records.pop();
  };

  findSubsystemByClientId = async (
    context: Keystone,
    clientId: string
  ): Promise<KeystoneSubsystem> => {
    const client = ParseClientId(clientId);

    logger.info('Client = %j', client);
    const records = await getRecords(
      context,
      'Subsystem',
      undefined,
      ['organization', 'namespace'],
      {
        query: '$name: String!, $tag: String!',
        clause: '{ organization: { tags_contains: $tag }, name: $name }',
        variables: {
          name: client.subsystem.name,
          tag: `member_id:${client.member.memberId}`,
        },
      }
    );

    assert.strictEqual(records.length == 0, false, 'Subsystem not found');
    assert.strictEqual(records.length > 1, false, 'Multiple subsystems found');
    return records.pop();
  };
}

export { SubsystemService };