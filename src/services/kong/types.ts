export interface CreateOrGetConsumerResult {
  created: boolean;
  consumer: KongConsumer;
}
export interface KongConsumer {
  id?: string;
  username?: string;
  custom_id?: string;
  tags?: string[];
}

export interface KeyAuthResponse {
  keyAuthPK: string;
  apiKey: string;
}

export interface DiffResult {
  D: string[];
  C: string[];
}
