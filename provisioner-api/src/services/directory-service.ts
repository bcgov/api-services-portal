import type { OAuthClient } from '../clients/oauth.js';

export class DirectoryService {
  constructor(private readonly client: OAuthClient) {}

  async getHello(): Promise<string> {
    return 'hi';
  }
}
