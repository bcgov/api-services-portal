import { CredentialIssuer } from '../keystone/types';
import { strict as assert } from 'assert';
export interface KeystoneContext {}

export interface NewCredential {
  flow: string;
  clientId?: string;
  clientSecret?: string;
  issuer?: string;
  tokenEndpoint?: string;
  apiKey?: string;
  clientPublicKey?: string;
  clientPrivateKey?: string;
}

export interface RequestControls {
  defaultClientScopes?: string[];
  defaultOptionalScopes?: string[];
  roles?: string[];
  aclGroups?: string[];
  plugins?: ConsumerPlugin[];
  clientCertificate?: string;
  clientGenCertificate?: boolean;
  jwksUrl?: string;
}

export interface Name {
  name: string;
}
export interface ConsumerPlugin {
  name: string;
  service: Name;
  config: PluginConfig;
}
export interface PluginConfig {
  second?: number;
  minute?: number;
  hour?: number;
  day?: number;
  month?: number;
  year?: number;
  allow?: string[];
  deny?: string[];
}

export interface IssuerEnvironmentConfig {
  exists: boolean;
  environment: string;
  issuerUrl: string;
  clientRegistration?: string;
  // clientAuthenticator?: string
  clientId?: string;
  clientSecret?: string;
  initialAccessToken?: string;
}

export function checkIssuerEnvironmentConfig(
  issuer: CredentialIssuer,
  environment: string
) {
  const details: IssuerEnvironmentConfig[] = JSON.parse(
    issuer.environmentDetails
  );
  const env = details.filter((c) => c.environment === environment);
  return env.length == 1 ? env[0] : null;
}

export function getIssuerEnvironmentConfig(
  issuer: CredentialIssuer,
  environment: string
) {
  const env = checkIssuerEnvironmentConfig(issuer, environment);

  assert.strictEqual(
    env != null,
    true,
    `EnvironmentMissing ${issuer.name} ${environment}`
  );
  return env;
}
