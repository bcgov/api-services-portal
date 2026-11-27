export const callbackSummaries: Record<
  string,
  { summary: string; description?: string; tags?: string[] }
> = {
  provisionAllowedServices: {
    summary: 'Provision approved allowed-services to the partner',
    description:
      'Delivered after an approval or revocation. The PUT replaces the partner-side approved state for the integration across every environment.',
    tags: ['Webhooks'],
  },
};
