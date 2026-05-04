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
    const response = (await fetch(
      `${this.kongUrl}/tags/${encodeURIComponent(tag)}`,
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then(checkStatus)
      .then((res) => res.json())) as KongTaggedConfigResponse;

    return response.data ?? [];
  }
}