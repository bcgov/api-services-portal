import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { Logger } from '../../logger';

const logger = Logger('uma2-token');

export interface ClientRegResponse {
  id: string;
  clientId: string;
  clientSecret: string;
  enabled: boolean;
  registrationAccessToken: string;
}

export interface ClientRegistration {
  id?: string;
  clientId: string;
  clientSecret?: string;
  enabled?: boolean;
}

export interface ResourceItem {
  rsid: string;
  rsname: string;
}
export class UMA2TokenService {
  private tokenEndpoint: string;

  constructor(tokenEndpoint: string) {
    this.tokenEndpoint = tokenEndpoint;
    logger.debug('Endpoint %s', tokenEndpoint);
  }

  public async getRequestingPartyToken(
    clientId: string,
    clientSecret: string,
    subjectToken: string,
    resourceId: string
  ) {
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ietf:params:oauth:grant-type:uma-ticket');
    //params.append('client_id', clientId);
    params.append('subject_token', subjectToken);
    params.append('audience', clientId);
    params.append('permission', resourceId);

    const basicAuth = Buffer.from(
      clientId + ':' + clientSecret,
      'utf-8'
    ).toString('base64');

    const response = await fetch(this.tokenEndpoint, {
      method: 'post',
      body: params,
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then(checkStatus)
      .then((res) => res.json());
    const masked = {
      ...response,
      ...{ access_token: '****', refresh_token: '****' },
    };
    logger.debug('[getRequestingPartyToken] RESULT %j', masked);
    return response['access_token'];
  }

  public async getPermittedResourcesUsingTicket(
    subjectToken: string,
    ticket: string
  ): Promise<ResourceItem[]> {
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ietf:params:oauth:grant-type:uma-ticket');
    params.append('ticket', ticket);
    params.append('submit_request', 'false');
    params.append('response_mode', 'permissions');

    logger.debug(
      '[getPermittedResourcesUsingTicket] uma-ticket %s',
      this.tokenEndpoint
    );

    const response = await fetch(this.tokenEndpoint, {
      method: 'post',
      body: params,
      headers: {
        Authorization: `Bearer ${subjectToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else if (res.status == 403) {
          // users that have no resources will get a 403, so gracefully handle that as "access to no resources"
          return [];
        } else {
          return checkStatus(res);
        }
      })
      .then((res) => res as ResourceItem[]);
    logger.debug('[getPermittedResourcesUsingTicket] RESULT %j', response);
    return response;
  }
}
