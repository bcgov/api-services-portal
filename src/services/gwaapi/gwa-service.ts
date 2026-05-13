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
    }).then(checkStatus);
  }

  public async publishGatewayConfiguration(
    method: 'DELETE' | 'PUT',
    subjectToken: string,
    ns: string,
    dryRun: boolean,
    config: string
  ) {
    const url = `${this.gwaUrl}/v2/namespaces/${ns}/gateway`;
    logger.debug('[publishGatewayConfiguration] ns=%s', ns);

    // perpare the request body using form data
    const body = {
      namespace: ns,
      dryRun,
      configFile: config,
    };

    const result = await fetch(url, {
      method,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${subjectToken}`,
      },
    }).then(checkStatus);
    return method === 'DELETE' ? {} : await result.json();
  }
}
