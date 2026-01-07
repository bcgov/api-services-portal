import { Keystone } from '@keystonejs/keystone';
import { getRecords } from '../../batch/feed-worker';
import { strict as assert } from 'assert';
import { OpenApiSpec } from '../keystone/types';

class OpenAPISpecService {
  findOpenAPISpecByName = async (
    context: Keystone,
    name: string
  ): Promise<OpenApiSpec> => {
    const records = await getRecords(context, 'OpenAPISpec', undefined, [], {
      query: '$name: String!',
      clause: '{ name: $name }',
      variables: { name },
    });

    assert.strictEqual(records.length == 0, false, 'OpenAPI Spec not found');
    return records.pop();
  };
}

export { OpenAPISpecService };
