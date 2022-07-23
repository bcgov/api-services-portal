import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { Logger } from '../../logger';
import { KongObjectID, KongPlugin } from './types';

const logger = Logger('gwaapi.plugins');

export class ConsumerPluginsService {
  private gwaUrl: string;

  constructor(gwaUrl: string) {
    this.gwaUrl = gwaUrl;
  }

  public async addPluginToConsumer(
    subjectToken: string,
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
          Authorization: `Bearer ${subjectToken}`,
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
    subjectToken: string,
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
          Authorization: `Bearer ${subjectToken}`,
        },
      }
    )
      .then(checkStatus)
      .then((res) => res.json());

    logger.debug('[updateConsumerPlugin] RESULT %j', response);
  }

  public async deleteConsumerPlugin(
    subjectToken: string,
    consumerPK: string,
    pluginPK: string,
    namespace: string
  ): Promise<void> {
    logger.debug('[deleteConsumerPlugin] %s %s', consumerPK, pluginPK);
    logger.debug(
      `${this.gwaUrl}/v2/namespaces/${namespace}/consumers/${consumerPK}/plugins/${pluginPK}`
    );
    await fetch(
      `${this.gwaUrl}/v2/namespaces/${namespace}/consumers/${consumerPK}/plugins/${pluginPK}`,
      {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${subjectToken}`,
        },
      }
    ).then(checkStatus);
  }
}
