import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { Logger } from '../../logger';

const logger = Logger('kc.token');

export interface Token {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  scope: string;
}

export class KeycloakTokenService {
  private tokenUrl: string;

  constructor(tokenUrl: string) {
    this.tokenUrl = tokenUrl;
  }

  public async getKeycloakSession(
    clientId: string,
    clientSecret: string
  ): Promise<string> {
    return this.getKeycloakSessionByGrant(
      clientId,
      clientSecret,
      'client_credentials'
    );
  }

  public async getKeycloakSessionByGrant(
    clientId: string,
    clientSecret: string,
    grantType: string,
    username?: string,
    password?: string
  ): Promise<string> {
    const params = new URLSearchParams();
    params.append('grant_type', grantType);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    if (username) {
      params.append('username', username);
      params.append('password', password);
    }

    logger.debug(
      '[getKeycloakSession] Using %s %s for endpoint %s',
      grantType,
      clientId,
      this.tokenUrl
    );

    const response = await fetch(this.tokenUrl, {
      method: 'post',
      body: params,
      headers: {
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
    logger.debug('[getKeycloakSession] RESULT = %j', masked);
    return response['access_token'];
  }

  public async tokenExchange(
    clientId: string,
    clientSecret: string,
    subjectToken: string
  ): Promise<string> {
    const params = new URLSearchParams();
    params.append(
      'grant_type',
      'urn:ietf:params:oauth:grant-type:token-exchange'
    );
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('subject_token', subjectToken);

    const response = await fetch(this.tokenUrl, {
      method: 'post',
      body: params,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then(checkStatus)
      .then((res) => res.json())
      .catch((err: any) => {
        logger.error('[tokenExchange] failed %s', err);
        throw err;
      });
    const masked = {
      ...response,
      ...{ access_token: '****', refresh_token: '****' },
    };
    logger.debug('[tokenExchange] RESULT = %j', masked);
    return response['access_token'];
  }
}
