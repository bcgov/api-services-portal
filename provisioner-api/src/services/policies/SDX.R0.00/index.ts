import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { ClientResources, ServiceResources } from './types.js';
import type { PolicyDefaultsFn } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readRelativeFile = (relativePath: string) => {
  return readFileSync(join(__dirname, relativePath), 'utf8');
};

const schema = readRelativeFile('./schema.cedarschema');

const rawPolicies = ['connection.cedar'].map((file) => {
  const content = readRelativeFile(`./${file}`);
  // split on permit | forbid
  const parts = content.match(/(permit|forbid)\s*\([^)]*\)\s*[\s\S]*?;/g) ?? [];
  return { name: file, parts };
});

// flatten using pre es2019
const policies: Record<string, string> = {};
rawPolicies.forEach((p) => {
  p.parts.forEach((part, index) => {
    // get the label from the first line as a comment after the permit|forbid keyword
    const labelMatch = part.split('\n')[0].split('//')[1];
    const label = labelMatch ? labelMatch.trim() : `${index}`;
    policies[`${p.name}:${label}`] = part;
  });
});

/**
 * Baseline `clientResources`/`serviceResources` for a new connection request
 * under this policy. Callers extend this as a base rather than building the
 * gateway-pattern shape from scratch. The client subsystem, the requested
 * service, and the requester details are available for policies that need
 * to derive their defaults from them.
 */
const defaults: PolicyDefaultsFn = (
  _subsystem,
  _service,
  _requesterDetails
): {
  clientResources: ClientResources;
  serviceResources: ServiceResources;
} => ({
  clientResources: {
    gatewayPatterns: {
      'sdx-p2p-consumer.r1': {
        upgrades: {
          sign: {},
          verify: {},
          counterSign: {},
        },
      },
    },
  },
  serviceResources: {
    gatewayPatterns: {
      'sdx-p2p-provider.r1': {
        upgrades: {
          mtlsAuth: {},
          mtlsAcl: {},
          sign: {},
          verify: {},
          counterSign: {},
        },
      },
    },
  },
});

export const SDXPolicy = {
  id: 'SDX.R0.00',
  schema,
  policies,
  defaults,
};
