export const componentSchemaDescriptions: Record<
  string,
  { description: string }
> = {
  SubsystemEnvironment: {
    description:
      'A subsystem deployed to a specific environment, together with the services it exposes.',
  },
  ResourceServerAccess: {
    description:
      'Approved scopes on services of a single resource server within an integration.',
  },
  IntegrationAccessRequest: {
    description:
      'The current approved set of allowed-services for an integration, as known to SDX.',
  },
  NewIntegrationAccessRequest: {
    description:
      'Partner-submitted request describing the desired allowed-services for an integration.',
  },
  NewIntegrationAccessRequestResponse: {
    description:
      'Acknowledgement of a submitted integration access request, with per-resource queue results.',
  },
};
