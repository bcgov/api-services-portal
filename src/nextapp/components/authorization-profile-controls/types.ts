export interface EnvironmentItem {
  new: boolean;
  environment: string;
  issuerUrl: string;
  clientRegistration?: string;
  clientId?: string;
  clientSecret?: string;
}
