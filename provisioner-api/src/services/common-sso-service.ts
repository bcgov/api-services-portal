import type { OAuthClient } from '../clients/oauth.js';

export class CommonSsoService {
  constructor(private readonly client: OAuthClient) {}

  async getHello(): Promise<string> {
    return 'hi';
  }
}
