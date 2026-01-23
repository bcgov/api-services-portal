import { Keystone } from '@keystonejs/keystone';
import {
  deleteRecordByInternalId,
  getRecords,
  removeEmpty,
  removeKeys,
  replaceKey,
  syncRecordsThrowErrors,
  transformAllRefID,
} from '../../batch/feed-worker';
import { strict as assert } from 'assert';
import { RuntimeGroup } from './types';
import { RuntimeGroup as KeystoneRuntimeGroup } from '../keystone/types';
import { BatchResult } from '../../batch/types';
import { regExprValidation } from '../utils';

class RuntimeGroupService {
  validateRuntimeGroup = (name: string): void => {
    regExprValidation(
      '^[a-z0-9]{4,10}$',
      name,
      'Runtime Group name must be between 4 and 10 lowercase alpha-numeric characters'
    );
  };

  upsertRuntimeGroup = async (
    context: Keystone,
    body: RuntimeGroup
  ): Promise<BatchResult> => {
    // host should be based on a standard format for edge servers
    body['host'] = `${body['name']}.servers.sdx`;

    return await syncRecordsThrowErrors(
      context,
      'RuntimeGroup',
      body['name'],
      body
    );
  };

  listRuntimeGroupsByOrganization = async (
    context: Keystone,
    org: string
  ): Promise<RuntimeGroup[]> => {
    const batchClause = {
      query: '$org: String',
      clause: '{ organization: { name: $org } }',
      variables: { org },
    };
    const records: RuntimeGroup[] = await getRecords(
      context,
      'RuntimeGroup',
      'allRuntimeGroups',
      [],
      batchClause
    );

    return records
      .map((o) => removeEmpty(o))
      .map((o) => transformAllRefID(o, ['organization']))
      .map((o) => replaceKey(o, 'namespace', 'gatewayId'))
      .map((o) => removeKeys(o, ['id']));
  };

  deleteRuntimeGroup = async (
    context: Keystone,
    org: string,
    name: string,
    force: boolean = false
  ): Promise<BatchResult> => {
    const entry = await new RuntimeGroupService().findRuntimeGroupByName(
      context,
      org,
      name
    );

    return await deleteRecordByInternalId(context, 'RuntimeGroup', entry.id);
  };

  findRuntimeGroupByName = async (
    context: Keystone,
    org: string,
    name: string
  ): Promise<KeystoneRuntimeGroup> => {
    const rg = await this.findRuntimeGroupByUniqueName(context, name);

    assert.strictEqual(
      rg.organization?.name === org,
      false,
      'Runtime Group not found'
    );

    return rg;
  };

  findRuntimeGroupByUniqueName = async (
    context: Keystone,
    name: string
  ): Promise<KeystoneRuntimeGroup> => {
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

  findRuntimeGroupByUniqueHost = async (
    context: Keystone,
    host: string
  ): Promise<KeystoneRuntimeGroup> => {
    const records = await getRecords(
      context,
      'RuntimeGroup',
      undefined,
      ['organization', 'hostedOrganizations'],
      {
        query: '$host: String!',
        clause: '{ host: $host }',
        variables: { host },
      }
    );

    assert.strictEqual(records.length == 0, false, 'Runtime Group not found');
    return records.pop();
  };
}

export { RuntimeGroupService };
