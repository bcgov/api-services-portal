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
  Product as KeystoneProduct,
  Application as KeystoneApplication,
  SubsystemIntegration as KeystoneSubsystemIntegration,
} from '../keystone/types';
import { Keystone } from '@keystonejs/keystone';
import {
  GetSubsystemEntryForSubsystem,
  ParseClientId,
} from '../gateway-patterns/catalog';
import { Logger } from '../../logger';
import { OpenAPISpecService } from './oas-service';
import { getNamespaceDetails } from '../workflow/get-namespaces';
import { context } from 'msw';
import { ProvisionerService } from '../provisioner';
import { BatchService } from '../keystone/batch-service';

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
    if ((body.integrations || []).length > 1) {
      throw new Error(
        `Subsystem '${
          body.name || 'unknown'
        }' can be associated with only one CSS integration`
      );
    }

    const requestedIntegration = body.integrations?.[0];
    if (requestedIntegration?.integrationClientId) {
      const existing = await this.lookupSubsystemForUpsert(context, body);
      if (!existing) {
        const parent = { ...body };
        delete parent.integrations;
        const created = await syncRecordsThrowErrors(
          context,
          'Subsystem',
          undefined,
          parent
        );
        const linked = await syncRecordsThrowErrors(
          context,
          'Subsystem',
          undefined,
          body
        );
        return { ...linked, result: created.result, id: created.id };
      }

      const currentIntegration = this.selectLatestRecord(
        existing.integrations || [],
        `subsystemId=${existing.id}`
      );
      if (
        currentIntegration &&
        currentIntegration.integrationClientId !==
          requestedIntegration.integrationClientId
      ) {
        const updated = await new BatchService(context).update(
          'SubsystemIntegration',
          currentIntegration.id,
          { integrationClientId: requestedIntegration.integrationClientId }
        );
        if (!updated.id) {
          throw new Error(
            updated.error || 'Failed replacing subsystem CSS integration'
          );
        }
      }
    }

    const result = await syncRecordsThrowErrors(
      context,
      'Subsystem',
      undefined,
      body
    );
    return result;
  };

  private lookupSubsystemForUpsert = async (
    context: Keystone,
    body: Subsystem
  ): Promise<KeystoneSubsystem | undefined> => {
    const records: KeystoneSubsystem[] = await getRecords(
      context,
      'Subsystem',
      'allSubsystems',
      ['integrations'],
      {
        query: '$name: String!, $organization: String!',
        clause: '{ name: $name, organization: { name: $organization } }',
        variables: {
          name: body.name,
          organization: body.organization,
        },
      }
    );
    return this.selectLatestRecord(
      records,
      `name=${body.name},organization=${body.organization}`
    );
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

  lookupSubsystemIntegration = async (
    context: Keystone,
    integrationClientId: string
  ): Promise<KeystoneSubsystemIntegration | undefined> => {
    const records: KeystoneSubsystemIntegration[] = await getRecords(
      context,
      'SubsystemIntegration',
      'allSubsystemIntegrations',
      [],
      {
        query: '$integrationClientId: String!',
        clause: '{ integrationClientId: $integrationClientId }',
        variables: { integrationClientId },
      }
    );

    return this.selectLatestRecord(
      records,
      `integrationClientId=${integrationClientId}`
    );
  };

  listSubsystemsByIntegration = async (
    context: Keystone,
    subsystemIntegrationId: string
  ): Promise<KeystoneSubsystem[]> => {
    const records: KeystoneSubsystem[] = await getRecords(
      context,
      'Subsystem',
      'allSubsystems',
      ['organization'],
      {
        query: '$subsystemIntegrationId: String!',
        clause: '{ integrations_some: { id: $subsystemIntegrationId } }',
        variables: { subsystemIntegrationId },
      }
    );
    const selected = this.selectLatestRecord(
      records,
      `subsystemIntegrationId=${subsystemIntegrationId}`
    );
    return selected ? [selected] : [];
  };

  private selectLatestRecord = <T extends { id?: string }>(
    records: T[],
    lookup: string
  ): T | undefined => {
    if (records.length === 0) {
      return undefined;
    }

    const sorted = records
      .slice()
      .sort((left, right) =>
        `${left.id || ''}`.localeCompare(`${right.id || ''}`)
      );
    const selected = sorted[sorted.length - 1];
    if (sorted.length > 1) {
      logger.warn(
        'Multiple untimestamped subsystem association records found for %s; selected id=%s using deterministic ID order and ignored ids=%j',
        lookup,
        selected.id,
        sorted.slice(0, -1).map((record) => record.id)
      );
    }
    return selected;
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

  findProduct = async (
    context: Keystone,
    organization: string,
    subsystemName: string
  ): Promise<KeystoneProduct> => {
    const records = await getRecords(
      context,
      'Product',
      'allProducts',
      ['environments'],
      {
        query: '$organization: String!',
        clause: '{ organization: { name: $organization } }',
        variables: { organization },
      }
    );
    return records.find((r: KeystoneProduct) => r.name === subsystemName);
  };

  findApplication = async (
    context: Keystone,
    organization: string,
    subsystemName: string
  ): Promise<KeystoneApplication> => {
    const records = await getRecords(
      context,
      'Application',
      'allApplications',
      [],
      {
        query: '$organization: String!',
        clause: '{ organization: { name: $organization } }',
        variables: { organization },
      }
    );
    return records.find((r: KeystoneApplication) => r.name === subsystemName);
  };

  subsystemGatewayExists = async (
    context: Keystone,
    subsystem: KeystoneSubsystem
  ): Promise<boolean> => {
    if (!subsystem.namespace) {
      return false;
    }

    const gatewayDetails = await getNamespaceDetails(
      context,
      subsystem.namespace
    );

    return gatewayDetails != null;
  };

  deleteSubsystem = async (
    context: any,
    org: string,
    name: string
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

    const gatewayExists = await this.subsystemGatewayExists(context, subsystem);

    if (gatewayExists) {
      const provisioner = new ProvisionerService(process.env.PROVISIONER_URL!);
      const resources = await provisioner.getGatewayResources(
        subsystem.namespace!
      );

      assert.strictEqual(
        resources.length === 0,
        true,
        'Subsystem cannot be deleted because gateway configuration exists'
      );
    }

    const childResults: BatchResult[] = [];
    for (const serviceSpec of serviceSpecs) {
      const serviceDeleteResult = await deleteRecordByInternalId(
        context,
        'OpenAPISpec',
        serviceSpec.id
      );
      childResults.push(serviceDeleteResult);
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
