import { Keystone } from '@keystonejs/keystone';
// import { RuntimeGroup } from './types';
import { getRecords } from '../../batch/feed-worker';
import { strict as assert } from 'assert';
import { RuntimeGroup } from '../keystone/types';

class RuntimeGroupService {
  findRuntimeGroupByName = async (
    context: Keystone,
    name: string
  ): Promise<RuntimeGroup> => {
    const records = await getRecords(
      context,
      'RuntimeGroup',
      undefined,
      ['organization', 'hostedOrganizations'],
      {
        query: '$name: String!',
        clause: '{ name: $name }',
        variables: { name },
      }
    );

    assert.strictEqual(records.length == 0, false, 'Runtime Group not found');
    return records.pop();
  };
}

export { RuntimeGroupService };
