import type {
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../../clients/sdx-member/index.js';

/**
 * The requester context built for a single requested service, as passed to
 * a policy's `defaults` function alongside the client subsystem and the
 * service being connected to.
 */
export interface PolicyRequesterDetails {
  submissionId: string;
  requester: { name: string; email?: string };
  scopes: string[];
  client: { integrationId?: string; clientId: string; privacyZone?: string };
  service: { clientId: string; privacyZone?: string };
}

export type PolicyDefaultResources = {
  clientResources: unknown;
  serviceResources: unknown;
};

export type PolicyDefaultsFn = (
  subsystem: SubsystemEntry,
  service: ServiceCatalogEntry,
  requesterDetails: PolicyRequesterDetails
) => PolicyDefaultResources;
