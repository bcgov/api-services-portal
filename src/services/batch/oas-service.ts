import { Keystone } from '@keystonejs/keystone';
import {
  deleteRecordByInternalId,
  getRecords,
} from '../../batch/feed-worker';
import { BatchResult } from '../../batch/types';
import { strict as assert } from 'assert';
import {
  ConnectionRequest as KeystoneConnectionRequest,
  OpenApiSpec,
} from '../keystone/types';
import { assertEqual } from '../../controllers/ioc/assert';

class OpenAPISpecService {
  majorPart = (version: string | undefined): string => {
    if (!version) return 'v1';
    const major = version.split('.')[0];
    return `v${major}`;
  };

  titleToServiceName = (title: string): string => {
    // remove all characters except alphanumeric and replace spaces with dashes
    // remove various endings like -API, -SERVICE, -SERVICES, -SVC
    return title
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9-\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(
        /(-API|-SERVICE|-SERVICE-SVC|-SERVICE-API|-API-SERVICE|-SERVICES|-SVC)$/,
        ''
      )
      .toLocaleUpperCase();
  };

  findOpenAPISpecByName = async (
    context: Keystone,
    name: string
  ): Promise<OpenApiSpec> => {
    const records = await getRecords(
      context,
      'OpenAPISpec',
      undefined,
      ['subsystem', 'organization'],
      {
        query: '$name: String!',
        clause: '{ name: $name }',
        variables: { name },
      }
    );

    assert.strictEqual(records.length == 0, false, 'OpenAPI Spec not found');
    return records.pop();
  };

  listActiveConnectionsByServiceId = async (
    context: Keystone,
    serviceId: string
  ): Promise<KeystoneConnectionRequest[]> => {
    return await getRecords(
      context,
      'ConnectionRequest',
      'allConnectionRequests',
      [],
      {
        query: '$serviceId: String!',
        clause: '{ serviceId: $serviceId, isActive: true }',
        variables: { serviceId },
      }
    );
  };

  listOpenAPISpecsBySubsystemId = async (
    context: Keystone,
    subsystemId: string
  ): Promise<OpenApiSpec[]> => {
    return await getRecords(
      context,
      'OpenAPISpec',
      'allOpenAPISpecs',
      ['subsystem', 'organization'],
      {
        query: '$subsystemId: ID!',
        clause: '{ subsystem: { id: $subsystemId } }',
        variables: { subsystemId },
      }
    );
  };

  deleteOASService = async (
    context: Keystone,
    org: string,
    name: string
  ): Promise<BatchResult> => {
    const serviceSpec = await this.findOpenAPISpecByName(context, name);

    assertEqual(
      serviceSpec && serviceSpec.subsystem.organization.name === org,
      true,
      'organization',
      'Not authorized to access this service'
    );

    const activeConnections = await this.listActiveConnectionsByServiceId(
      context,
      serviceSpec.name
    );

    assert.strictEqual(
      activeConnections.length === 0,
      true,
      'OAS service cannot be deleted because it has active connection requests'
    );

    return await deleteRecordByInternalId(context, 'OpenAPISpec', serviceSpec.id);
  };
}

export { OpenAPISpecService };
