export const pathSummaries: Record<
  string,
  { summary: string; description?: string }
> = {
  '/resource-servers': {
    summary: 'Resource server environment catalogue',
    description:
      'Lists resource server environments visible to the calling partner service.',
  },
  '/subsystems/{id}/allowed-services': {
    summary: 'Allowed-service grants for a subsystem',
    description:
      'Returns integration access requests currently granting access to the subsystem.',
  },
  '/subsystems/{id}/access-requests': {
    summary: 'Integration access request submissions',
    description:
      'Accepts new integration access requests against the subsystem.',
  },
  '/resources': {
    summary: 'Resource dispatch',
    description:
      'Accepts a set of resources and dispatches each one to its owning provider.',
  },
  '/resources/connection-change': {
    summary: 'Connection change',
    description:
      'Applies a connection change to SDX using the SDX Member create-connection input.',
  },
  '/patterns/{pattern}': {
    summary: 'Evaluate and apply a gateway pattern',
    description:
      'Evaluates a gateway pattern and dispatches the resources it produces to their owning providers.',
  },
  '/gateways/{gateway}/resources': {
    summary: 'Gateway resource catalogue',
    description:
      'Lists the tagged gateway entities belonging to the gateway (namespace).',
  },
  '/gateways/{gateway}/keys': {
    summary: 'Gateway keys and key sets',
    description:
      'Returns Kong keys and key sets for the gateway. Private key material is never returned.',
  },
  '/runtime-groups/{name}/environments/{env}/csr': {
    summary: 'Runtime group CSR generation',
    description:
      "Requests a new key pair and CSR from the runtime group's edge server for the target environment.",
  },
  '/runtime-groups/{name}/environments/{env}/cert-token': {
    summary: 'Runtime group certificate-signing token generation',
    description:
      "Requests a one-time-use certificate-signing token from the target environment's CA (step-ca).",
  },
};
