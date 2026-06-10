/**
 * Manage OPAL policies
 */
import { checkStatus } from '../checkStatus';
import { Logger } from '../../logger';

const logger = Logger('ape.OpalPoliciesService');

export interface PolicyRequest {
  package: string;
  policy: string;
}

export interface PolicyResponse {
  package: string;
  policy: string;
}

export class OpalPoliciesService {
  private opalPoliciesUrl: string;

  constructor(opalPoliciesUrl: string) {
    this.opalPoliciesUrl = opalPoliciesUrl;
  }

  public async upsertPolicy(policy: PolicyRequest): Promise<PolicyResponse> {
    const url = `${this.opalPoliciesUrl}/policies/${policy.package}`;
    logger.debug(`Upserting policy at ${url}`);

    return await fetch(url, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(policy),
    })
      .then(checkStatus)
      .then((res) => res.json());
  }
}
