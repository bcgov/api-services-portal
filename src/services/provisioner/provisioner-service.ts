import fetch from 'node-fetch';
import { checkStatus } from '../checkStatus';
import { ConnectionRequest } from '../keystone/types';
import { ConnectionRequestInput } from '@/controllers/sdx/v1/types';

type ConnectionRequestChangeEventResponse = {
  applied: number;
  failed: number;
  results: any[];
  preview?: any[];
};

export class ProvisionerService {
  private provisionerUrl: string;

  constructor(provisionerUrl: string) {
    this.provisionerUrl = provisionerUrl;
  }

  public async postConnectionRequestChangeEvent(
    connection: ConnectionRequestInput
  ): Promise<ConnectionRequestChangeEventResponse> {
    // credentials will be using the gwa admin

    const res = await fetch(
      `${this.provisionerUrl}/connections/${connection}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connection),
      }
    )
      .then(checkStatus)
      .then((r) => r.json())
      .then((r) => r as ConnectionRequestChangeEventResponse);

    return res;
  }
}
