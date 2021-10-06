import fetch from 'node-fetch';
import { checkStatus } from '../checkStatus';
import { logger } from '../../logger';
export interface OpenidWellKnown {
  issuer: string;
  token_endpoint: string;
  registration_endpoint: string;
}

export interface Uma2WellKnown {
  issuer: string;
  token_endpoint: string;
  resource_registration_endpoint: string;
  permission_endpoint: string;
  policy_endpoint: string;
}

export function headers(accessToken: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  accessToken != null && (headers['Authorization'] = 'bearer ' + accessToken);
  return headers;
}

export async function getOpenidFromIssuer(
  url: string
): Promise<OpenidWellKnown> {
  return fetch(`${url}/.well-known/openid-configuration`, {
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then(checkStatus)
    .then((res) => res.json())
    .catch((err) => {
      logger.error('[getOpenidFromIssuer] %s failed %s', url, err);
      return null;
    });
}

export async function getUma2FromIssuer(url: string): Promise<Uma2WellKnown> {
  return fetch(`${url}/.well-known/uma2-configuration`, {
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then(checkStatus)
    .then((res) => res.json())
    .catch((err) => {
      logger.error('[getUma2FromIssuer] %s failed %s', url, err);
      return null;
    });
}

export async function getOpenidFromDiscovery(url: string) {
  return fetch(url, {
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then(checkStatus)
    .then((res) => res.json())
    .catch((err) => {
      logger.error('[getOpenidFromDiscovery] %s failed %s', url, err);
      return null;
    });
}
