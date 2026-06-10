/**
 * Manage OPAL data sources
 */
import { checkStatus } from '../checkStatus';
import { Logger } from '../../logger';

const logger = Logger('ape.OpalPIPCatalogService');

export interface DataSourceRequest {
  name: string;
  url: string;
  topics: string[];
  dst_path: string;
}

export interface CatalogEntry {
  id: string;
  name: string;
  url: string;
  topics: string[];
  dst_path: string;
}

export class OpalPIPCatalogService {
  private OpalPIPCatalogUrl: string;

  constructor(OpalPIPCatalogUrl: string) {
    this.OpalPIPCatalogUrl = OpalPIPCatalogUrl;
  }

  public async upsertDataSource(
    dataSource: DataSourceRequest
  ): Promise<CatalogEntry> {
    const url = `${this.OpalPIPCatalogUrl}/entries`;
    logger.debug(`Upserting data source at ${url}`);

    return await fetch(url, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataSource),
    })
      .then(checkStatus)
      .then((res) => res.json());
  }
}
