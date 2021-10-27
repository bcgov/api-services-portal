import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { Logger } from '../../logger';

import { v4 as uuidv4 } from 'uuid';
import { strict as assert } from 'assert';
import { GatewayConsumer } from '../keystone/types';

const logger = Logger('kong.consumer');

export interface KongConsumer {
  id: string;
  username: string;
  custom_id: string;
}

export class KongConsumers {
  private kongUrl: string;

  constructor(kongUrl: string) {
    this.kongUrl = kongUrl;
  }

  public async getAllConsumers(): Promise<KongConsumer[]> {
    const allConsumers = await this.recurse('/consumers');

    logger.debug('[getAllConsumers] result row count %d', allConsumers.length);
    return allConsumers.map((cons: any) => ({
      id: cons.id,
      username: cons.username,
      custom_id: cons.custom_id,
    }));
  }

  async recurse(path: string): Promise<any[]> {
    let response = await fetch(`${this.kongUrl}${path}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(checkStatus)
      .then((res) => res.json());

    if (response.next != null) {
      return response.data.concat(await this.recurse(response.next));
    } else {
      return response.data;
    }
  }
}
