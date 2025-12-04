import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { logger } from '../../logger';
import { de } from 'date-fns/locale';

export class GWAService {
  private gwaUrl: string;

  constructor(gwaUrl: string) {
    this.gwaUrl = gwaUrl;
  }

  public async getDefaultNamespaceSettings() {
    const url = `${this.gwaUrl}/v2/namespaces/defaults`;
    logger.debug('[getDefaultNamespaceSettings]');
    return await fetch(url, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(checkStatus)
      .then((res) => res.json());
  }

  public async deleteAllGatewayConfiguration(subjectToken: string, ns: string) {
    const url = `${this.gwaUrl}/v2/namespaces/${ns}`;
    logger.debug('[deleteAllGatewayConfiguration] ns=%s', ns);
    return await fetch(url, {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${subjectToken}`,
      },
    }).then(checkStatus);
  }

  public async getGatewayConfigUsingPattern(
    ns: string,
    deleteFlag: boolean,
    payload: any
  ) {
    const url = `${this.gwaUrl}/v2/namespaces/${ns}/gateway/pattern-output`;
    logger.debug('[getGatewayConfigUsingPattern] ns=%s', ns);

    const deleteQualifier = deleteFlag ? payload.ns_qualifier : '';

    return await fetch(url, {
      method: 'put',
      body: JSON.stringify({
        delete: deleteFlag,
        deleteQualifier,
        document: payload,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(checkStatus)
      .then((res) => res.json());
  }
}
