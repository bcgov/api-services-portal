export const callbackSummaries: Record<
  string,
  { summary: string; description?: string; tags?: string[] }
> = {
  provisionAllowedServices: {
    summary: 'Provision approved allowed-services to the partner',
    description:
      'Delivered to the partner integration once a subsystem access request has been approved. The PUT replaces the partner-side view of the integration access request.',
    tags: ['Webhooks'],
  },
};
