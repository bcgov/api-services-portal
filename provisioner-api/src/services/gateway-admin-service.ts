import type { OAuthClient } from '../clients/oauth.js';

export class GatewayAdminService {
  constructor(private readonly client: OAuthClient) {}

  async getHello(): Promise<string> {
    return 'hi';
  }
}
