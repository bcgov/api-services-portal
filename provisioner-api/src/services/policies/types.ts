import type {
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../../clients/sdx-member/index.js';
import type { EnvironmentConfig } from '../../config/environments.js';

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
  service: { clientId: string; privacyZone?: string; version?: string };
}

export type PolicyDefaultResources = {
  clientResources: unknown;
  serviceResources: unknown;
};

export type PolicyDefaultsFn = (
  subsystem: SubsystemEntry,
  service: ServiceCatalogEntry,
  requesterDetails: PolicyRequesterDetails,
  managedApplicationScopes?: string[]
) => PolicyDefaultResources;

export interface PolicyPreflightContext {
  environment: string | undefined;
  environmentConfig: EnvironmentConfig | undefined;
  service: ServiceCatalogEntry;
  requesterDetails: PolicyRequesterDetails | undefined;
  managedApplicationScopes?: string[];
}

/** Validate policy-specific inputs before any gateway resource is built. */
export type PolicyPreflightFn = (context: PolicyPreflightContext) => void;

export interface PolicyEnforceResourcesInput extends PolicyPreflightContext {
  clientResources: unknown;
  serviceResources: unknown;
}

/** Return the effective resources after applying policy-managed settings. */
export type PolicyEnforceResourcesFn = (
  input: PolicyEnforceResourcesInput
) => PolicyDefaultResources;
