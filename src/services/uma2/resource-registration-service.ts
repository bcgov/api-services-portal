import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { Logger } from '../../logger';
import querystring from 'querystring';
import { headers } from '../keycloak/keycloak-api';

const logger = Logger('uma2-resource');

export interface ResourceSetQuery {
  name?: string;
  uri?: string;
  owner?: string;
  type?: string;
  scope?: string;
}

export interface ResourceScope {
  name: string;
}

export interface ResourceOwner {
  id: string;
}

export interface ResourceSet {
  id: string;
  name: string;
  type: string;
  uris?: string[];
  icon_uri?: string;
  resource_scopes: ResourceScope[];
  owner?: ResourceOwner;
  ownerManagedAccess: boolean;
}

export interface ResourceSetInput {
  name: string;
  type: string;
  uris?: string[];
  icon_uri?: string;
  resource_scopes: string[];
  owner?: ResourceOwner;
  ownerManagedAccess: boolean;
}

export class UMAResourceRegistrationService {
  private resourceRegistrationEndpoint: string;
  private accessToken: string;

  constructor(resourceRegistrationEndpoint: string, accessToken: string) {
    this.resourceRegistrationEndpoint = resourceRegistrationEndpoint;
    this.accessToken = accessToken;
    logger.debug('Endpoint %s', resourceRegistrationEndpoint);
  }

  public async createResourceSet(set: ResourceSetInput): Promise<ResourceSet> {
    logger.debug('[createResourceSet] %j', set);
    const result = await fetch(this.resourceRegistrationEndpoint, {
      method: 'post',
      body: JSON.stringify(set),
      headers: headers(this.accessToken) as any,
    })
      .then(checkStatus)
      .then((res) => res.json());
    result.id = result._id;
    logger.debug('[createResourceSet] RESULT %j', result);
    return result;
  }

  public async deleteResourceSet(rid: string) {
    const url = `${this.resourceRegistrationEndpoint}/${rid}`;
    logger.debug('[deleteResourceSet] URL %s', url);
    const result = await fetch(url, {
      method: 'delete',
      headers: headers(this.accessToken) as any,
    }).then(checkStatus);
    logger.debug('[deleteResourceSet] (%s) OK', rid);
  }

  public async getResourceSet(rid: string): Promise<ResourceSet> {
    const url = `${this.resourceRegistrationEndpoint}/${rid}`;
    logger.debug('[getResourceSet] URL %s', url);
    const result = await fetch(url, {
      method: 'get',
      headers: headers(this.accessToken) as any,
    })
      .then(checkStatus)
      .then((res) => res.json())
      .then((json) => json as ResourceSet);
    logger.debug('[getResourceSet] (%s) RESULT %j', rid, result);
    result.id = rid;
    return result;
  }

  public async listResourcesByIdList(
    resources: string[]
  ): Promise<ResourceSet[]> {
    logger.debug('[listResourcesByIdList] Search %j', resources);
    return Promise.all(resources.map((id) => this.getResourceSet(id)));
  }

  public async listResources(query: ResourceSetQuery): Promise<string[]> {
    const requestQuery = querystring.stringify(query as any);
    const url = `${this.resourceRegistrationEndpoint}?${requestQuery}`;
    logger.debug('[listResources] %s', url);
    const result = await fetch(url, {
      method: 'get',
      headers: headers(this.accessToken) as any,
    })
      .then(checkStatus)
      .then((res) => res.json())
      .then((json) => json as string[]);
    logger.debug('[listResources] RESULT %j', result);
    return result;
  }
}
