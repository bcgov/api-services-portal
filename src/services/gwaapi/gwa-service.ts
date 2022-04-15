import { checkStatus } from '../checkStatus';
import fetch from 'node-fetch';
import { logger } from '../../logger';

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
    })
      .then(checkStatus)
      .then((res) => res.json());
  }
}
