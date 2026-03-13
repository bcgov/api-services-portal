import fetch from 'node-fetch';
import { checkStatus } from '../checkStatus';
import { logger } from '../../logger';
export interface OpenidWellKnown {
  issuer: string; // Frontend URL
  token_endpoint: string; // Requested URL
  registration_endpoint: string; // Requested URL
}

export interface Uma2WellKnown {
  issuer: string; // Frontend URL
  token_endpoint: string; // Requested URL
  resource_registration_endpoint: string; // Frontend URL
  permission_endpoint: string; // Frontend URL
  policy_endpoint: string; // Frontend URL
}

const DISCOVERY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const openidCache = new Map<string, CacheEntry<OpenidWellKnown>>();
const uma2Cache = new Map<string, CacheEntry<Uma2WellKnown>>();

export function headers(accessToken: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  accessToken && (headers['Authorization'] = 'bearer ' + accessToken);
  return headers;
}

export async function getOpenidFromIssuer(
  url: string
): Promise<OpenidWellKnown> {
  const cached = openidCache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const result = await fetch(`${url}/.well-known/openid-configuration`, {
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

  if (result) {
    openidCache.set(url, {
      value: result,
      expiresAt: Date.now() + DISCOVERY_CACHE_TTL_MS,
    });
  }
  return result;
}

export async function getUma2FromIssuer(url: string): Promise<Uma2WellKnown> {
  const cached = uma2Cache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const result = await fetch(`${url}/.well-known/uma2-configuration`, {
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

  if (result) {
    uma2Cache.set(url, {
      value: result,
      expiresAt: Date.now() + DISCOVERY_CACHE_TTL_MS,
    });
  }
  return result;
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
