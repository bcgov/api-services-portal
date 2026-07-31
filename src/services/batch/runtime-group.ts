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
import { Logger } from '../../logger';
import { ProvisionerService } from '../provisioner';
import { assertIsDefined } from '../../controllers/ioc/assert';

const logger = Logger('batch.runtime-group');

class RuntimeGroupService {
  validateRuntimeGroup = (name: string): void => {
    regExprValidation(
      '^[a-z0-9]{3,8}$',
      name,
      'Runtime Group name must be between 3 and 8 lowercase alpha-numeric characters'
    );
  };

  upsertRuntimeGroup = async (
    context: Keystone,
    body: RuntimeGroup
  ): Promise<BatchResult> => {
    // host should be based on a standard format for edge servers
    body['host'] = `${body['name']}.${body['environment']}.servers.sdx`;
    if (!body.sdxEndpoint) {
      body[
        'sdxEndpoint'
      ] = `https://${body['name']}.${body['environment']}.servers.sdx`;
    }
    if (!body.consumerEndpoint) {
      body[
        'consumerEndpoint'
      ] = `http://internal.${body['name']}.${body['environment']}.servers.sdx`;
    }

    return await syncRecordsThrowErrors(
      context,
      'RuntimeGroup',
      undefined,
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

  listHostedRuntimeGroupsForOrganization = async (
    context: Keystone,
    org: string
  ): Promise<RuntimeGroup[]> => {
    const batchClause = {
      query: '$org: String',
      clause: '{ hostedOrganizations_some: { name: $org } }',
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
      .map((o) =>
        removeKeys(o, [
          'id',
          'hostedOrganizations',
          'sdxEndpoint',
          'consumerEndpoint',
          'gatewayId',
        ])
      );
  };

  deleteRuntimeGroup = async (
    context: Keystone,
    org: string,
    name: string,
    environment: string,
    force: boolean = false
  ): Promise<BatchResult> => {
    const rgList = await new RuntimeGroupService().findOrgRuntimeGroupsByName(
      context,
      org,
      name
    );
    const entry = rgList.find((rg) => rg.environment === environment);
    assertIsDefined(
      entry,
      'environment',
      'Runtime Group not found for the specified environment'
    );

    const result = await deleteRecordByInternalId(
      context,
      'RuntimeGroup',
      entry.id
    );
    return result;
  };

  checkRuntimeGroup = async (
    context: Keystone,
    org: string,
    name: string
  ): Promise<KeystoneRuntimeGroup> => {
    const rg = await this.findRuntimeGroupByUniqueName(context, name, true);

    if (rg == null) {
      return null;
    }

    assert.strictEqual(
      rg.organization?.name === org,
      true,
      'Runtime Group not owned by organization'
    );

    return rg;
  };

  findHostedRuntimeGroupsByName = async (
    context: Keystone,
    org: string,
    name: string
  ): Promise<KeystoneRuntimeGroup[]> => {
    const runtimeGroups = await getRecords(
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

    assert.strictEqual(
      runtimeGroups.length > 0,
      true,
      'Runtime group does not exist'
    );

    return runtimeGroups.filter((rg) =>
      rg.hostedOrganizations.some((o: any) => o.name === org)
    );
  };

  findOrgRuntimeGroupsByName = async (
    context: Keystone,
    org: string,
    name: string
  ): Promise<KeystoneRuntimeGroup[]> => {
    const groups = await this.findRuntimeGroupsByName(context, name);
    return groups.filter((rg) => rg.organization?.name === org);
  };

  findRuntimeGroupsByName = async (
    context: Keystone,
    name: string
  ): Promise<KeystoneRuntimeGroup[]> => {
    const runtimeGroups = await getRecords(
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

    return runtimeGroups;
  };

  findRuntimeGroupByUniqueName = async (
    context: Keystone,
    name: string,
    quiet: boolean = false
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

    assert.strictEqual(
      !quiet && records.length == 0,
      false,
      'Runtime Group not found'
    );

    return records.length == 0 ? null : records.pop();
  };

  checkRuntimeGroupByUniqueName = async (
    context: Keystone,
    name: string,
    org: string
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

    assert.strictEqual(
      records.length == 0,
      false,
      `Runtime Group with host '${host}' not found`
    );
    return records.pop();
  };

  generateCertSignRequestToken = async (
    org: string,
    runtimeGroup: KeystoneRuntimeGroup
  ): Promise<string> => {
    // The provisioner resolves the runtime group's environment to the
    // correct step-ca instance; each environment (dev/test/prod) has its
    // own certificate authority, so this cannot be handled locally.
    const provisionerService = new ProvisionerService(
      process.env.PROVISIONER_URL!
    );

    logger.debug(
      "Requesting certificate-signing token for runtime group '%s' in environment '%s'",
      runtimeGroup.name,
      runtimeGroup.environment
    );

    const { token } = await provisionerService.postCertSignToken(
      org,
      runtimeGroup.name,
      runtimeGroup.environment
    );

    return token;
  };
}

export { RuntimeGroupService };
