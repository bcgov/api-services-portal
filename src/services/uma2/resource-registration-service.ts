import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { Logger } from '../../logger';
import querystring from 'querystring';
import { headers } from '../keycloak/keycloak-api';
import { regExprValidation } from '../utils';

const logger = Logger('uma2-resource');

export interface ResourceSetQuery {
  name?: string;
  uri?: string;
  owner?: string;
  type?: string;
  scope?: string;
  first?: number;
  max?: number;
  deep?: boolean;
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
  displayName?: string;
  type: string;
  uris?: string[];
  icon_uri?: string;
  resource_scopes: ResourceScope[];
  owner?: ResourceOwner;
  ownerManagedAccess: boolean;
}

export interface ResourceSetInput {
  name: string;
  displayName?: string;
  type: string;
  uris?: string[];
  icon_uri?: string;
  resource_scopes: string[];
  owner?: ResourceOwner;
  ownerManagedAccess: boolean;
}

export interface ResourceSetUpdateInput {
  _id: string;
  name: string;
  displayName: string;
  type: string;
  uris: string[];
  icon_uri: string;
  scopes: string[];
  owner: ResourceOwner;
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

  async updateResourceSet(set: ResourceSetUpdateInput) {
    const url = `${this.resourceRegistrationEndpoint}/${set._id}`;
    logger.debug('[updateResourceSet] URL %s', url);
    logger.debug('[updateResourceSet] %j', set);
    const result = await fetch(url, {
      method: 'put',
      body: JSON.stringify(set),
      headers: headers(this.accessToken) as any,
    }).then(checkStatus);
    logger.debug('[updateResourceSet] (%s) [%j] OK', set._id, result.status);
  }

  public async updateDisplayName(name: string, displayName: string) {
    const displayNameValidationRule = '^[A-Za-z0-9-()_ ]{0,50}$';

    regExprValidation(
      displayNameValidationRule,
      displayName,
      'Display name can not be longer than 50 characters and can only use special characters "-()_ ".'
    );

    const before = await this.findResourceByName(name);

    await this.updateResourceSet({
      _id: before.id,
      name: before.name,
      displayName,
      type: before.type,
      uris: before.uris,
      icon_uri: before.icon_uri,
      scopes: before.resource_scopes.map((s) => s.name),
      owner: before.owner,
      ownerManagedAccess: before.ownerManagedAccess,
    });

    // need a small pause here, otherwise keycloak
    // gives a 'reason: socket hang up' on next call to it
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }

  public async deleteResourceSet(rid: string) {
    const url = `${this.resourceRegistrationEndpoint}/${rid}`;
    logger.debug('[deleteResourceSet] URL %s', url);
    const result = await fetch(url, {
      method: 'delete',
      headers: headers(this.accessToken) as any,
    }).then(checkStatus);
    logger.debug('[deleteResourceSet] (%s) [%j] OK', rid, result.status);
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
    // TODO: Really should do graceful paging, but will be awhile before
    // there are 1000+ namespaces!
    const requestQuery = querystring.stringify({
      ...{ first: 0, max: 1000 },
      ...query,
    } as any);
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

  public async findResourceByName(name: string): Promise<ResourceSet> {
    const requestQuery = querystring.stringify({
      name,
      exactName: true,
    } as any);
    const url = `${this.resourceRegistrationEndpoint}?${requestQuery}`;
    logger.debug('[findResourceByName] %s', url);
    const result = await fetch(url, {
      method: 'get',
      headers: headers(this.accessToken) as any,
    })
      .then(checkStatus)
      .then((res) => res.json())
      .then((json) => json as string[]);
    logger.debug('[findResourceByName] RESULT %j', result);

    return result.length == 0
      ? undefined
      : await this.getResourceSet(result[0]);
  }

  public async findResourceByUri(uri: string): Promise<ResourceSet> {
    const requestQuery = querystring.stringify({
      uri,
    } as any);
    const url = `${this.resourceRegistrationEndpoint}?${requestQuery}`;
    logger.debug('[findResourceByUri] %s', url);
    const result = await fetch(url, {
      method: 'get',
      headers: headers(this.accessToken) as any,
    })
      .then(checkStatus)
      .then((res) => res.json())
      .then((json) => json as string[]);
    logger.debug('[findResourceByUri] RESULT %j', result);

    return result.length == 0
      ? undefined
      : await this.getResourceSet(result[0]);
  }
}
