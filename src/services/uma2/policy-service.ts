import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { Logger } from '../../logger';
import querystring from 'querystring';
import { headers } from '../keycloak/keycloak-api';
import { strict as assert } from 'assert';

export interface PolicyQuery {
  resource?: string;
  name?: string;
  scope?: string;
  first?: number;
  max?: number;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  scopes: string[];
  users: string[];
  clients: string[];
}

const logger = Logger('uma2-policy');
export class UMAPolicyService {
  private policyEndpoint: string;
  private accessToken: string;

  constructor(policyEndpoint: string, accessToken: string) {
    this.policyEndpoint = policyEndpoint;
    this.accessToken = accessToken;
    logger.debug('Endpoint %s', policyEndpoint);
  }

  public async findPolicyByResource(
    resourceId: string,
    policyId: string
  ): Promise<Policy> {
    const policies = await this.listPolicies({ resource: resourceId });

    const matched = policies.filter((p) => p.id === policyId);

    assert.strictEqual(
      matched.length,
      1,
      'Policy not found or not associated with resource'
    );
    return matched[0];
  }

  public async listPolicies(query: PolicyQuery): Promise<Policy[]> {
    const requestQuery = querystring.stringify(query as any);
    const url = `${this.policyEndpoint}?${requestQuery}`;
    logger.debug('[listPolicies] %s', url);
    const result = await fetch(url, {
      method: 'get',
      headers: { Authorization: `Bearer ${this.accessToken}` },
    })
      .then(checkStatus)
      .then((res) => res.json());
    logger.debug('[listPolicies] RESULT %j', result);
    return result;
  }

  public async createUmaPolicy(rid: string, body: Policy) {
    const url = `${this.policyEndpoint}/${rid}`;
    logger.debug('[createUmaPolicy] %s', url);
    const result = await fetch(url, {
      method: 'post',
      body: JSON.stringify(body),
      headers: headers(this.accessToken) as any,
    })
      .then(checkStatus)
      .then((res) => res.json());
    logger.debug('[createUmaPolicy] RESULT %j', result);
    return result;
  }

  public async deleteUmaPolicy(policyId: string) {
    const url = `${this.policyEndpoint}/${policyId}`;
    logger.debug('[deleteUmaPolicy] %s', url);
    await fetch(url, {
      method: 'delete',
      headers: headers(this.accessToken) as any,
    }).then(checkStatus);
  }
}
