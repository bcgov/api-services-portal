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
import { Subsystem as KeystoneSubsystem } from '../keystone/types';
import { Keystone } from '@keystonejs/keystone';
import {
  CreateNamespace,
  CreateNamespaceArgs,
} from '../workflow/create-namespace';

class SubsystemService {
  validateSubsystem = (name: string): void => {
    regExprValidation(
      '^[A-Z0-9-]{3,20}$',
      name,
      "Subsystem name must be between 3 and 20 alpha-numeric characters (including special character '-')"
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
  ): Promise<Subsystem[]> => {
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

    return records
      .map((o) => removeEmpty(o))
      .map((o) => transformAllRefID(o, ['organization']))
      .map((o) => replaceKey(o, 'namespace', 'gatewayId'))
      .map((o) => removeKeys(o, ['id']));
  };

  deleteSubsystem = async (
    context: any,
    org: string,
    name: string,
    force: boolean = false
  ): Promise<BatchResult> => {
    const subsystem = await this.findSubsystemByName(context, org, name);

    //await this.deleteSubsystemGateway(context, subsystem, force);

    return await deleteRecordByInternalId(context, 'Subsystem', subsystem.id);
  };

  // private deleteSubsystemGateway = async (
  //   context: any,
  //   subsystem: KeystoneSubsystem,
  //   force: boolean
  // ): Promise<void> => {
  //   await DeleteNamespaceValidate(context, subsystem.namespace, force);

  //   await DeleteNamespace(
  //     context.sudo(),
  //     getSubjectToken(context.req),
  //     subsystem.namespace
  //   );
  // };

  // createSubsystemGateway = async (
  //   context: Keystone,
  //   org: string,
  //   subsystemName: string,
  //   runtimeGroupName: string
  // ): Promise<{ gatewayId: string; displayName: string }> => {
  //   const subsystem = await this.findSubsystemByName(
  //     context,
  //     org,
  //     subsystemName
  //   );
  //   const runtimeGroup = await new RuntimeGroupService().findRuntimeGroupByName(
  //     context,
  //     runtimeGroupName
  //   );

  //   assert.strictEqual(
  //     runtimeGroup.organization.name === org ||
  //       runtimeGroup.hostedOrganizations?.find((o) => o.name === org) !==
  //         undefined,
  //     true,
  //     `Runtime Group ${runtimeGroupName} is not hosting organization ${org}`
  //   );

  //   const createArgs: CreateNamespaceArgs = {
  //     name: subsystem.namespace,
  //     displayName: `SDX Subsystem ${subsystem.name}`,
  //     org,
  //     orgEnabled: false,
  //     dataPlane: 'sdx-edge',
  //     domains: [runtimeGroup.host],
  //   };

  //   const rset = await CreateNamespace(context, createArgs);
  //   return {
  //     gatewayId: rset.name,
  //     displayName: rset.displayName,
  //   };
  // };

  findSubsystemByName = async (
    context: Keystone,
    org: string,
    name: string
  ): Promise<KeystoneSubsystem> => {
    const records = await getRecords(context, 'Subsystem', undefined, [], {
      query: '$org: String!, $name: String!',
      clause: '{ organization: { name: $org }, name: $name }',
      variables: { org, name },
    });

    assert.strictEqual(records.length == 0, false, 'Subsystem not found');
    return records.pop();
  };
}

export { SubsystemService };
