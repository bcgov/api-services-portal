import fetch from 'node-fetch';
import { checkStatus } from '../checkStatus';

type KongTaggedConfigResponse = {
  data?: unknown[];
};

export class KongTagService {
  private kongUrl: string;

  constructor(kongUrl: string) {
    this.kongUrl = kongUrl;
  }

  public async listTaggedConfig(tag: string): Promise<unknown[]> {
    const res = await fetch(`${this.kongUrl}/tags/${encodeURIComponent(tag)}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 404) {
      return [];
    }

    const response = (await checkStatus(res).then((r) =>
      r.json()
    )) as KongTaggedConfigResponse;

    return response.data ?? [];
  }
}