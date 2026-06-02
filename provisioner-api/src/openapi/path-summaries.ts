export const pathSummaries: Record<
  string,
  { summary: string; description?: string }
> = {
  '/subsystems': {
    summary: 'Subsystem environment catalogue',
    description:
      'Lists subsystem environments visible to the calling partner service.',
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
};
