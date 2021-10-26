import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { Logger } from '../../logger';

import { v4 as uuidv4 } from 'uuid';
import { strict as assert } from 'assert';

const logger = Logger('kong.acl');

export interface KongACL {
  group: string;
  tags: string[];
  consumer: { id: string };
}

export class KongACLService {
  private kongUrl: string;

  constructor(kongUrl: string) {
    this.kongUrl = kongUrl;
  }

  public async getAllAcls(): Promise<KongACL[]> {
    const allAcls = await this.recurse('/acls');

    logger.debug('[getAllAcls] result row count %d', allAcls.length);
    return allAcls.map((acl: any) => ({
      group: acl.group,
      tags: acl.tags,
      consumer: acl.consumer,
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
