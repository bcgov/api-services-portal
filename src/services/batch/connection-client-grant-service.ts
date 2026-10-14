import { Keystone } from '@keystonejs/keystone';
import { BatchResult, BatchSyncException } from '../../batch/types';
import {
  getRecordById,
  getRecords,
  parseJsonString,
  removeKeys,
  syncRecordsThrowErrors,
} from '../../batch/feed-worker';
import { assertEqual, assertIsDefined } from '../../controllers/ioc/assert';
import { ConnectionClientGrant } from './types';
import {
  ConnectionClientGrantInput,
  ConnectionClientGrantStatus,
} from './connection-client-grant-types';
import { ConnectionService } from './connection-service';
import { OpenAPISpecService } from './oas-service';

interface StoredGrant
  extends Omit<ConnectionClientGrant, 'scopes' | 'connection'> {
  scopes: string[] | string;
  requesterDetails?: any;
  connection?: { id: string };
}

class ConnectionClientGrantService {
  listGrants = async (
    context: Keystone,
    org: string,
    connectionId: string
  ): Promise<ConnectionClientGrant[]> => {
    const connection = await new ConnectionService().getConnectionById(
      context,
      connectionId
    );
    this.assertRelatedOrganization(connection, org);

    const grants: StoredGrant[] = await getRecords(
      context,
      'ConnectionClientGrant',
      'allConnectionClientGrants',
      [],
      {
        query: '$connectionId: ID!',
        clause: '{ connection: { id: $connectionId } }',
        variables: { connectionId },
      }
    );

    return grants.map((grant) => this.normalizeStoredGrant(grant));
  };

  getGrant = async (
    context: Keystone,
    org: string,
    connectionId: string,
    grantId: string
  ): Promise<ConnectionClientGrant> => {
    const connection = await new ConnectionService().getConnectionById(
      context,
      connectionId
    );
    this.assertRelatedOrganization(connection, org);

    const grant = (await getRecordById(
      context,
      'ConnectionClientGrant',
      grantId,
      ['connection']
    )) as StoredGrant | undefined;
    assertIsDefined(grant, 'grantId', 'Client grant not found');
    assertEqual(
      grant.connection?.id,
      connectionId,
      'grantId',
      'Client grant does not belong to this connection'
    );

    return this.normalizeStoredGrant(grant);
  };

  findGrant = async (
    context: Keystone,
    connectionId: string,
    integrationId: string,
    oauthClientId: string
  ): Promise<ConnectionClientGrant | undefined> => {
    const grants: StoredGrant[] = await getRecords(
      context,
      'ConnectionClientGrant',
      'allConnectionClientGrants',
      [],
      {
        query:
          '$connectionId: ID!, $integrationId: String!, $oauthClientId: String!',
        clause:
          '{ connection: { id: $connectionId }, integrationId: $integrationId, oauthClientId: $oauthClientId }',
        variables: { connectionId, integrationId, oauthClientId },
      }
    );

    assertEqual(
      grants.length <= 1,
      true,
      'oauthClientId',
      'More than one client grant exists for this connection and client'
    );
    return grants.length === 0
      ? undefined
      : this.normalizeStoredGrant(grants[0]);
  };

  upsertGrant = async (
    context: Keystone,
    org: string,
    connectionId: string,
    input: ConnectionClientGrantInput
  ): Promise<BatchResult> => {
    const connection = await new ConnectionService().getConnectionById(
      context,
      connectionId
    );
    assertEqual(
      connection.clientOrganization?.name,
      org,
      'organization',
      'Only the consuming organization can create or update a client grant'
    );
    assertEqual(
      connection.policyVersion,
      'SDX.R1.00',
      'connectionId',
      'Client grants are only supported for SDX.R1.00 connections'
    );

    const integrationId = this.requireNonBlank(
      input.integrationId,
      'integrationId'
    );
    const oauthClientId = this.requireNonBlank(
      input.oauthClientId,
      'oauthClientId'
    );
    const scopes = await this.validateScopes(
      context,
      connection.serviceId,
      input.scopes
    );
    const existing = await this.findGrant(
      context,
      connectionId,
      integrationId,
      oauthClientId
    );

    const data: any = {
      connection: connectionId,
      integrationId,
      oauthClientId,
      submissionId: input.submissionId,
      requesterDetails: input.requesterDetails || {},
      scopes,
    };

    try {
      return await syncRecordsThrowErrors(
        context,
        'ConnectionClientGrant',
        undefined,
        data
      );
    } catch (err) {
      // The database uniqueness constraint is authoritative. If two requests
      // both observe no grant, the loser of the insert race repeats the
      // operation as an update after the winner commits.
      if (
        existing ||
        !(err instanceof BatchSyncException) ||
        err.result.result !== 'create-failed'
      ) {
        throw err;
      }
      const concurrent = await this.findGrant(
        context,
        connectionId,
        integrationId,
        oauthClientId
      );
      if (!concurrent) {
        throw err;
      }
      return await syncRecordsThrowErrors(
        context,
        'ConnectionClientGrant',
        undefined,
        data
      );
    }
  };

  updateGrantApproval = async (
    context: Keystone,
    org: string,
    connectionId: string,
    grantId: string,
    status: Exclude<ConnectionClientGrantStatus, 'pending'>
  ): Promise<BatchResult> => {
    assertEqual(
      status === 'approved' || status === 'rejected',
      true,
      'status',
      'Grant approval status must be approved or rejected'
    );

    const connection = await new ConnectionService().getConnectionById(
      context,
      connectionId
    );
    assertEqual(
      connection.serviceOrganization?.name,
      org,
      'organization',
      'Only the providing organization can approve or reject a client grant'
    );

    const grant = await this.getGrant(context, org, connectionId, grantId);
    return await syncRecordsThrowErrors(
      context,
      'ConnectionClientGrant',
      undefined,
      {
        connection: connectionId,
        integrationId: grant.integrationId,
        oauthClientId: grant.oauthClientId,
        status,
      }
    );
  };

  private validateScopes = async (
    context: Keystone,
    serviceId: string,
    input: string[]
  ): Promise<string[]> => {
    assertEqual(
      Array.isArray(input),
      true,
      'scopes',
      'scopes must be an array'
    );
    const scopes = Array.from(
      new Set(input.map((scope) => this.requireNonBlank(scope, 'scopes')))
    ).sort();

    const service = await new OpenAPISpecService().findOpenAPISpecByName(
      context,
      serviceId
    );
    let operations: any[] = [];
    try {
      operations = JSON.parse(service.operations || '[]');
    } catch {
      assertEqual(false, true, 'scopes', 'Service scope metadata is invalid');
    }
    const declaredScopes = new Set<string>();
    operations.forEach((operation: any) => {
      (operation.scopes || []).forEach((scope: any) => {
        const name = typeof scope === 'string' ? scope : scope.name;
        if (typeof name === 'string') {
          declaredScopes.add(name);
        }
      });
    });
    const unknown = scopes.filter((scope) => !declaredScopes.has(scope));
    assertEqual(
      unknown.length,
      0,
      'scopes',
      `Scopes are not declared by service '${serviceId}': ${unknown.join(', ')}`
    );
    return scopes;
  };

  private normalizeStoredGrant = (
    stored: StoredGrant
  ): ConnectionClientGrant => {
    const grant = parseJsonString({ ...stored }, [
      'requesterDetails',
      'scopes',
    ]);
    removeKeys(grant, ['slug']);
    return grant as ConnectionClientGrant;
  };

  private assertRelatedOrganization = (connection: any, org: string) => {
    assertEqual(
      connection.clientOrganization?.name === org ||
        connection.serviceOrganization?.name === org,
      true,
      'organization',
      'Organization is not related to this connection'
    );
  };

  private requireNonBlank = (value: unknown, field: string): string => {
    assertEqual(
      typeof value === 'string' && value.trim().length > 0,
      true,
      field,
      `${field} must not be blank`
    );
    return (value as string).trim();
  };
}

export { ConnectionClientGrantService };
