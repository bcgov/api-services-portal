import { Keystone } from '@keystonejs/keystone';
import { getRecords } from '../../batch/feed-worker';
import { strict as assert } from 'assert';
import { OpenApiSpec } from '../keystone/types';

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
      .toLocaleLowerCase();
  };

  findOpenAPISpecByName = async (
    context: Keystone,
    name: string
  ): Promise<OpenApiSpec> => {
    const records = await getRecords(
      context,
      'OpenAPISpec',
      undefined,
      ['subsystem'],
      {
        query: '$name: String!',
        clause: '{ name: $name }',
        variables: { name },
      }
    );

    assert.strictEqual(records.length == 0, false, 'OpenAPI Spec not found');
    return records.pop();
  };
}

export { OpenAPISpecService };
