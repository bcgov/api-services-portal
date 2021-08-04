import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { Logger } from '../../logger';

import { v4 as uuidv4 } from 'uuid';
import { strict as assert } from 'assert';

export interface CreateOrGetConsumerResult {
  created: boolean;
  consumer: KongConsumer;
}
export interface KongConsumer {
  id?: string;
  username?: string;
  custom_id?: string;
  tags?: string[];
}

export interface KeyAuthResponse {
  keyAuthPK: string;
  apiKey: string;
}

export interface KongPlugin {
  name: string;
  config: any;
}

export interface KongObjectID {
  id: string;
}

export interface DiffResult {
  D: string[];
  C: string[];
}

const logger = Logger('kong');

export class KongConsumerService {
  private kongUrl: string;
  private gwaUrl: string;

  constructor(kongUrl: string, gwaUrl: string) {
    this.kongUrl = kongUrl;
    this.gwaUrl = gwaUrl;
  }

  public async getConsumerByUsername(username: string) {
    logger.debug('[getConsumerByUsername] %s', username);
    return await fetch(`${this.kongUrl}/consumers/${username}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(checkStatus)
      .then((res) => res.json())
      .then((json) => {
        return {
          id: json['id'],
          username: json['username'],
          custom_id: json['custom_id'],
        } as KongConsumer;
      });
  }

  public async createOrGetConsumer(
    username: string,
    customId: string
  ): Promise<CreateOrGetConsumerResult> {
    logger.debug('createOrGetConsumer');
    try {
      logger.debug('createOrGetConsumer - TRY %s', username);
      const result = await this.getConsumerByUsername(username);
      logger.debug('createOrGetConsumer - RESULT %j', result);
      return { created: false, consumer: result };
    } catch (err) {
      logger.debug('createOrGetConsumer - CATCH ERROR %s', err);
      const result = await this.createKongConsumer(username, customId);
      logger.debug('createOrGetConsumer - CATCH RESULT %j', result);
      return { created: false, consumer: result };
    }
  }

  public async createKongConsumer(username: string, customId: string) {
    let body: KongConsumer = {
      username: username,
      tags: ['aps-portal'],
    };
    if (customId) {
      body['custom_id'] = customId;
    }
    logger.debug('[createKongConsumer] %s', `${this.kongUrl}/consumers`);
    try {
      let response = await fetch(`${this.kongUrl}/consumers`, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(checkStatus)
        .then((res) => res.json());
      logger.debug('[createKongConsumer] RESULT %j', response);
      return {
        id: response['id'],
        username: response['username'],
        custom_id: response['custom_id'],
      } as KongConsumer;
    } catch (err) {
      logger.error('[createKongConsumer] ERROR %s', err);
      throw err;
    }
  }

  public async addKeyAuthToConsumer(
    consumerPK: string
  ): Promise<KeyAuthResponse> {
    const body = {};
    logger.debug('[addKeyAuthToConsumer] CALLING with ' + consumerPK);

    const response = await fetch(
      `${this.kongUrl}/consumers/${consumerPK}/key-auth`,
      {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(checkStatus)
      .then((res) => res.json());

    logger.debug('[addKeyAuthToConsumer] RESULT %j', response);
    return {
      keyAuthPK: response['id'],
      apiKey: response['key'],
    } as KeyAuthResponse;
  }

  public async addPluginToConsumer(
    consumerPK: string,
    plugin: KongPlugin,
    namespace: string
  ): Promise<KongObjectID> {
    const body = { ...plugin, tags: ['ns.' + namespace] };
    logger.debug('[addPluginToConsumer] CALLING with ' + consumerPK);

    const response = await fetch(
      `${this.gwaUrl}/v2/namespaces/${namespace}/consumers/${consumerPK}/plugins`,
      {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(checkStatus)
      .then((res) => res.json());

    logger.debug('[addPluginToConsumer] RESULT %j', response);
    return {
      id: response['id'],
    } as KongObjectID;
  }

  public async updateConsumerPlugin(
    consumerPK: string,
    pluginPK: string,
    plugin: KongPlugin,
    namespace: string
  ): Promise<void> {
    logger.debug('[updateConsumerPlugin] C=%s P=%s', consumerPK, pluginPK);
    const body = { ...plugin, tags: ['ns.' + namespace] };
    const response = await fetch(
      `${this.gwaUrl}/v2/namespaces/${namespace}/consumers/${consumerPK}/plugins/${pluginPK}`,
      {
        method: 'put',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(checkStatus)
      .then((res) => res.json());

    logger.debug('[updateConsumerPlugin] RESULT %j', response);
  }

  public async deleteConsumerPlugin(
    consumerPK: string,
    pluginPK: string,
    namespace: string
  ): Promise<void> {
    await fetch(
      `${this.gwaUrl}/v2/namespaces/${namespace}/consumers/${consumerPK}/plugins/${pluginPK}`,
      {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).then(checkStatus);
  }

  public async genKeyForConsumerKeyAuth(consumerPK: string, keyAuthPK: string) {
    const body = {
      key: uuidv4().replace(/-/g, ''),
    };
    console.log('CALLING with ' + consumerPK);

    const response = await fetch(
      `${this.kongUrl}/consumers/${consumerPK}/key-auth/${keyAuthPK}`,
      {
        method: 'put',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(checkStatus)
      .then((res) => res.json());

    logger.debug('[genKeyForConsumerKeyAuth] RESULT %j', response);
    return {
      keyAuthPK: keyAuthPK,
      apiKey: response['key'],
    } as KeyAuthResponse;
  }

  //TODO: Need to handle paging
  public async getConsumersByNamespace(namespace: string): Promise<string[]> {
    let response = await fetch(
      `${this.kongUrl}/consumers?tags=ns.${namespace}`,
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(checkStatus)
      .then((res) => res.json());

    logger.debug('[getConsumersByNamespace] RESULT %j', response);
    return response['data'].map((c: KongConsumer) => c.id);
  }

  public async getConsumerACLByNamespace(
    consumerPK: string,
    namespace: string
  ): Promise<any> {
    let response = await fetch(
      `${this.kongUrl}/consumers/${consumerPK}/acls?tags=ns.${namespace}`,
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(checkStatus)
      .then((res) => res.json());

    logger.debug('[getConsumerACLByNamespace] RESULT %j', response);
    return response['data'];
  }

  public async assignConsumerACL(
    consumerPK: string,
    namespace: string,
    aclGroup: string
  ): Promise<DiffResult> {
    const result: DiffResult = { D: [], C: [] };
    const acls = await this.getConsumerACLByNamespace(consumerPK, namespace);

    const acl = acls.filter((acl: any) => acl.group === aclGroup);
    assert.strictEqual(acl.length, 0, 'Consumer ACL Already Exists');

    await fetch(`${this.kongUrl}/consumers/${consumerPK}/acls`, {
      method: 'post',
      body: JSON.stringify({ group: aclGroup, tags: ['ns.' + namespace] }),
      headers: { 'Content-Type': 'application/json' },
    }).then(checkStatus);
    result.C.push(aclGroup);

    logger.debug(
      '[assignConsumerACL] (%s) ASSIGN %s : RESULT %j',
      consumerPK,
      aclGroup,
      result
    );

    return result;
  }

  public async removeConsumerACL(
    consumerPK: string,
    namespace: string,
    aclGroup: string
  ): Promise<DiffResult> {
    const acls = await this.getConsumerACLByNamespace(consumerPK, namespace);
    // delete any aclGroups that are not passed in
    const result: DiffResult = { D: [], C: [] };

    const acl = acls.filter((acl: any) => acl.group === aclGroup);
    assert.strictEqual(acl.length, 1, 'Consumer ACL Missing');

    await fetch(`${this.kongUrl}/consumers/${consumerPK}/acls/${acl[0].id}`, {
      method: 'delete',
    }).then(checkStatus);
    result.D.push(aclGroup);

    return result;
  }

  public async updateConsumerACLByNamespace(
    consumerPK: string,
    namespace: string,
    aclGroups: any,
    onlyAdd: boolean = false
  ): Promise<DiffResult> {
    const acls = await this.getConsumerACLByNamespace(consumerPK, namespace);
    // delete any aclGroups that are not passed in
    const result: DiffResult = { D: [], C: [] };

    if (onlyAdd == false) {
      for (const acl of acls.filter(
        (acl: any) => !aclGroups.includes(acl.group)
      )) {
        await fetch(`${this.kongUrl}/consumers/${consumerPK}/acls/${acl.id}`, {
          method: 'delete',
        }).then(checkStatus);
        result.D.push(acl.group);
      }
    }

    // add any aclGroups that are not already in Kong
    for (const group of aclGroups.filter(
      (group: any) => acls.filter((acl: any) => acl.group == group).length == 0
    )) {
      await fetch(`${this.kongUrl}/consumers/${consumerPK}/acls`, {
        method: 'post',
        body: JSON.stringify({ group: group, tags: ['ns.' + namespace] }),
        headers: { 'Content-Type': 'application/json' },
      }).then(checkStatus);
      result.C.push(group);
    }
    logger.debug(
      '[updateConsumerACLByNamespace] (%s) RESULT %j',
      consumerPK,
      result
    );

    return result;
  }

  public getConsumerNamespace(consumer: any) {
    if ('tags' in consumer) {
      const ns = consumer['tags'].filter(
        (tag: any) => tag.startsWith('ns.') && tag.indexOf('.', 3) == -1
      );
      if (ns.length == 1) {
        return ns[0].substring(3);
      }
    }
    return null;
  }

  public isKongConsumerNamespaced(consumer: string) {
    return this.getConsumerNamespace(consumer) != null;
  }

  public async deleteConsumer(consumerId: string): Promise<void> {
    await fetch(`${this.kongUrl}/consumers/${consumerId}`, {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(checkStatus);
  }
}
