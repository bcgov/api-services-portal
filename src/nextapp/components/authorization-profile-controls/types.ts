export interface EnvironmentItem {
  new: boolean;
  environment: string;
  issuerUrl: string;
  clientRegistration?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface ClientMapper {
  name: string;
  defaultValue: string;
}
