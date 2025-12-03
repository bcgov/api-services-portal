/*

- this service supports the controller for gateway pattern based configuration
- it uses the "catalog" to prepare the templated parameters before sending to 
- the gwa-api service for generating the config
*/

import { GWAService } from '../gwaapi';
import { logger } from '../../logger';
import { CatalogEntry, GetCatalog } from './sdx-catalog';
import { newEnvironmentID, newJWKID } from '../identifiers';

export interface GatewayPatternConfig {
  pattern: string;
  locator: string;
  parameters: Record<string, string>;
}

export async function GetConfigUsingPattern(
  ctx: any,
  inputs: GatewayPatternConfig
): Promise<any> {
  const catalog = await GetCatalog(ctx);
  const entry = catalog.find((e) => e.locator === inputs.locator);
  if (!entry) {
    throw new Error(
      `GetConfigUsingPattern: unable to find catalog entry for locator ${inputs.locator}`
    );
  }
  if (inputs.pattern.startsWith('sdx-keys-')) {
    expectRequiredParams(inputs.parameters, ['public_key_pem']);
    return await evalKeysPattern(
      inputs.pattern,
      entry,
      inputs.parameters['public_key_pem']
    );
  } else if (inputs.pattern.startsWith('sdx-p2p-consumer-')) {
    expectRequiredParams(inputs.parameters, ['provider', 'req_id']);
    const provider = catalog.find(
      (e) => e.locator === inputs.parameters['provider']
    );
    const reqId = inputs.parameters['req_id'];
    return await evalConsumerPattern(inputs.pattern, reqId, entry, provider);
  } else if (inputs.pattern.startsWith('sdx-p2p-provider-')) {
    expectRequiredParams(inputs.parameters, [
      'consumer',
      'req_id',
      'upstream_uri',
    ]);
    const consumer = catalog.find(
      (e) => e.locator === inputs.parameters['consumer']
    );
    const reqId = inputs.parameters['req_id'];
    const upstreamUri = inputs.parameters['upstream_uri'];
    return await evalProviderPattern(
      inputs.pattern,
      reqId,
      upstreamUri,
      entry,
      consumer
    );
  } else {
    throw new Error(
      `GetConfigUsingPattern: unsupported pattern ${inputs.pattern}`
    );
  }
}

async function evalKeysPattern(
  pattern: string,
  entry: CatalogEntry,
  publicKeyPem: string
) {
  const gwa = new GWAService(process.env.GWA_API_URL);

  const kid = `urn:ca:bc:sdx:service:${entry.locator.toLowerCase()}:${newJWKID()}`;
  const keyName = `SDX.${entry.locator}:0`;
  const result = await gwa.getGatewayConfigUsingPattern(entry.gateway.name, {
    pattern: pattern,
    kid,
    key_name: keyName,
    ns_qualifier: `KEYS-${entry.product.name}`,
    public_key_pem: publicKeyPem,
  });
  return result;
}

async function evalConsumerPattern(
  pattern: string,
  reqId: string,
  entry: CatalogEntry,
  provider: CatalogEntry
) {
  const gwa = new GWAService(process.env.GWA_API_URL);

  const kid = `urn:ca:bc:sdx:service:${entry.locator.toLowerCase()}:${newJWKID()}`;
  const keyName = `SDX.${entry.locator}:0`;
  const result = await gwa.getGatewayConfigUsingPattern(entry.gateway.name, {
    pattern,
    consumer_uri: entry.locator,
    gateway: entry.gateway.name,
    ns_qualifier: `AP-C-REQ-${reqId}`,
    route_host: entry.edgeServer.host,
    route_path: `/${provider.locator}`,
    service_name: `AP-C-REQ-${reqId}-${provider.product.name}`,
    upstream_uri: `https://${provider.edgeServer.host}`,
  });
  return result;
}

async function evalProviderPattern(
  pattern: string,
  reqId: string,
  upstreamUri: string,
  entry: CatalogEntry,
  consumer: CatalogEntry
) {
  const gwa = new GWAService(process.env.GWA_API_URL);

  const result = await gwa.getGatewayConfigUsingPattern(entry.gateway.name, {
    pattern,
    consumer_uri: consumer.locator,
    gateway: entry.gateway.name,
    mtls_allow_list: `"${entry.edgeServer.dn}"`,
    ns_qualifier: `AP-P-REQ-${reqId}`,
    route_host: entry.edgeServer.host,
    route_path: `/${entry.locator}`,
    service_name: `AP-P-REQ-${reqId}-${entry.product.name}`,
    upstream_uri: upstreamUri,
  });
  return result;
}

function expectRequiredParams(
  provided: Record<string, string>,
  required: string[]
) {
  for (const param of required) {
    if (!provided[param]) {
      throw new Error(`missing required parameter: ${param}`);
    }
  }
}

/*
CONSUMER:

consumer_client_id: ap-gw-31a33-default-dev
consumer_uri: DEV.MIN.CITZ.SINGLE-DIGITAL-GW
gateway: gw-31a33
mtls_allow_list: '"CN=sdxgov.edge.sdx"'
ns_qualifier: AP-P-REQ-229
openid_audience: ap-gw-31a33-default-dev
openid_issuer: https://sdx-authz-apps-gov-bc-ca-lab.apps.gov.bc.ca/auth/realms/sdx
openid_scope: ''
pattern: sdx-p2p-provider-r1
route_host: ministryofpuppiesandkittens.xyz
route_path: /DEV/MIN/PUKI/TOYS
service_name: AP-P-REQ-229-TOYS
upstream_uri: https://httpbun.com
*/

/*
PROVIDER:

consumer_client_id: ap-gw-31a33-default-dev
consumer_uri: DEV.MIN.CITZ.SINGLE-DIGITAL-GW
edge_kid: urn:ca:bc:sdx:edge:sdxgov:0
gateway: gw-8aa16
mtls_allow_list: ''
ns_qualifier: AP-C-REQ-229
openid_audience: ap-gw-31a33-default-dev
openid_issuer: https://sdx-authz-apps-gov-bc-ca-lab.apps.gov.bc.ca/auth/realms/sdx
openid_scope: ''
pattern: sdx-p2p-consumer-r1
route_host: sdx.gov.bc.ca
route_path: /DEV/MIN/PUKI/TOYS
service_name: AP-C-REQ-229-TOYS
upstream_uri: https://ministryofpuppiesandkittens.xyz
*/
