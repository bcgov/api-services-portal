import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { logger } from '../../logger';
import querystring from 'querystring';
import { headers } from './keycloak-api';

export interface PermissionTicketQuery {
  scopeId?: string;
  resourceId?: string;
  owner?: string;
  requester?: string;
  granted?: boolean;
  returnNames?: boolean;
  first?: number;
  max?: number;
}

/*
{
    "resource": "0386b06f-485b-4c9c-bc06-1042edb14ba4",
    "requester": "f2dab0ff-f9e9-466d-a115-52010a1bb47d",
    "granted": false,
    "scopeName": "viewer"
}
*/
export interface PermissionTicket {
  id?: string;
  resource: string;
  requester: string;
  granted: boolean;
  scopeName: string;
  owner?: string;
  scope?: string;
  resourceName?: string;
  ownerName?: string;
  requesterName?: string;
}

export class KeycloakPermissionTicketService {
  private issuerUrl: string;
  private accessToken: string;

  constructor(issuerUrl: string, accessToken: string) {
    this.issuerUrl = issuerUrl;
    this.accessToken = accessToken;
  }

  public async listPermissions(
    query: PermissionTicketQuery
  ): Promise<PermissionTicket[]> {
    const requestQuery = querystring.stringify(query as any);
    const url = `${this.issuerUrl}/authz/protection/permission/ticket?${requestQuery}`;
    logger.debug('[listPermissions] QUERY %s', url);
    const result = await fetch(url, {
      method: 'get',
      headers: headers(this.accessToken) as any,
    })
      .then(checkStatus)
      .then((res) => res.json())
      .then((json) => json as PermissionTicket[])
      .catch((err) => {
        logger.error('[listPermissions] Failed to list permissions %s', err);
        throw err;
      });
    logger.debug('[listPermissions] RESULT %j', result);
    return result;
  }

  public async getPermissionTicket(
    resourceId: string,
    requesterId: string,
    scopeId: string
  ): Promise<PermissionTicket> {
    const url = `${this.issuerUrl}/authz/protection/permission/ticket?resourceId=${resourceId}&requester=${requesterId}&scopeId=${scopeId}`;
    logger.debug('QUERY %s', url);
    const result = await fetch(url, {
      method: 'get',
      headers: headers(this.accessToken) as any,
    })
      .then(checkStatus)
      .then((res) => res.json())
      .then((json) => json as PermissionTicket[]);
    logger.debug(JSON.stringify(result, null, 4));
    return result[0];
  }

  public async updatePermissionGrantedFlag(
    body: PermissionTicket
  ): Promise<void> {
    const url = `${this.issuerUrl}/authz/protection/permission/ticket`;

    logger.debug('UPDATING: %s', JSON.stringify(body));

    const result = await fetch(url, {
      method: 'put',
      body: JSON.stringify(body),
      headers: headers(this.accessToken) as any,
    }).then(checkStatus);
  }

  public async approvePermission(
    resourceId: string,
    requesterId: string,
    scopeId: string
  ): Promise<void> {
    const perm: PermissionTicket = await this.getPermissionTicket(
      resourceId,
      requesterId,
      scopeId
    );
    perm.granted = true;
    await this.updatePermissionGrantedFlag(perm);
  }

  public async createPermission(
    resourceId: string,
    requesterId: string,
    granted: boolean,
    scopeName: string
  ): Promise<PermissionTicket> {
    const url = `${this.issuerUrl}/authz/protection/permission/ticket`;
    const body: PermissionTicket = {
      resource: resourceId,
      requester: requesterId,
      granted: granted,
      scopeName: scopeName,
    };

    const result = await fetch(url, {
      method: 'post',
      body: JSON.stringify(body),
      headers: headers(this.accessToken) as any,
    })
      .then(checkStatus)
      .then((res) => res.json());
    logger.debug('[createPermission] RESULT %j', result);
    return result;
  }

  public async deletePermission(id: string): Promise<void> {
    const url = `${this.issuerUrl}/authz/protection/permission/ticket/${id}`;
    await fetch(url, {
      method: 'delete',
      headers: headers(this.accessToken) as any,
    }).then(checkStatus);
  }

  public async getPermission(id: string): Promise<PermissionTicket> {
    const url = `${this.issuerUrl}/authz/protection/permission/ticket/${id}`;
    const result = await fetch(url, {
      method: 'get',
      headers: headers(this.accessToken) as any,
    })
      .then(checkStatus)
      .then((res) => res.json());
    return result;
  }

  public async createOrUpdatePermission(
    resourceId: string,
    requesterId: string,
    granted: boolean,
    scopeName: string
  ): Promise<PermissionTicket> {
    const perms = await this.listPermissions({
      resourceId: resourceId,
      requester: requesterId,
      returnNames: true,
    });
    if (perms.length == 0) {
      return this.createPermission(resourceId, requesterId, granted, scopeName);
    } else if (perms.filter((s) => s.scopeName == scopeName).length == 0) {
      return this.createPermission(resourceId, requesterId, granted, scopeName);
    } else {
      const perm = perms.filter((s) => s.scopeName == scopeName)[0];
      logger.debug('UPDATE.. %s', JSON.stringify(perm));
      perm.granted = granted;
      await this.updatePermissionGrantedFlag({
        id: perm.id,
        resource: perm.resource,
        requester: perm.requester,
        granted: granted,
        scopeName: perm.scopeName,
      } as PermissionTicket);
      return perm;
    }
  }
}
