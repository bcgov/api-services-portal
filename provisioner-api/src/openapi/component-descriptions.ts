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
  Resource: {
    description:
      'A single resource in a submitted set; the `kind` selects the provider that applies it.',
  },
  ApplyResourcesRequest: {
    description:
      'A set of resources to dispatch to their owning providers.',
  },
  ApplyResourcesResponse: {
    description:
      'Per-resource outcome of dispatching a submitted resource set to its providers.',
  },
  ConnectionChangeRequest: {
    description:
      'Connection change to apply to SDX; mirrors the SDX Member create-connection input.',
  },
  ConnectionChangeResponse: {
    description: 'Outcome of applying a connection change to SDX.',
  },
  ApplyPatternRequest: {
    description:
      'Parameters for evaluating a gateway pattern whose resources are then dispatched.',
  },
};
