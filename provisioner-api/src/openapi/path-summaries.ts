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
};
