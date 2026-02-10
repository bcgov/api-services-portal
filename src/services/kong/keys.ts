import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { Logger } from '../../logger';

const logger = Logger('kong.keys');

export interface KongKey {
  id: string;
  kid: string;
  custom_id: string;
}

export class KongKeys {
  private kongUrl: string;

  constructor(kongUrl: string) {
    this.kongUrl = kongUrl;
  }

  public async getKeyByName(name: string): Promise<KongKey> {
    logger.debug('[getKeyByName] Fetching key from Kong with name: ' + name);

    let response = await fetch(`${this.kongUrl}/keys/${name}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      logger.warn(
        `Failed to get key from Kong. Status: ${
          response.status
        }, Body: ${await response.text()}`
      );
      return null as any;
    } else {
      return await response.json();
    }
  }
}
