import { UnprocessableEntityError } from '../../errors/api-errors.js';
import type {
  ServiceCatalogEntry,
  SubsystemEntry,
} from '../../clients/sdx-member/index.js';

/**
 * A {@link SubsystemEntry} that the SDX Member catalog has fully enriched with
 * its organization, member, gateway and runtime-group details. The catalog
 * endpoints always return these, so patterns treat them as required.
 */
export type EnrichedSubsystemEntry = SubsystemEntry & {
  organization: NonNullable<SubsystemEntry['organization']>;
  member: NonNullable<SubsystemEntry['member']>;
  gateway: NonNullable<SubsystemEntry['gateway']>;
  runtimeGroups: NonNullable<SubsystemEntry['runtimeGroups']>;
};

/** A {@link ServiceCatalogEntry} whose subsystem is fully enriched. */
export type EnrichedServiceCatalogEntry = ServiceCatalogEntry & {
  subsystem: EnrichedSubsystemEntry;
};

/**
 * Raise a validation error describing the offending field. Mirrors the
 * behaviour of the keystone `raiseValidateError` helper the patterns were
 * ported from, but throws the provisioner-api `UnprocessableEntityError`.
 */
export function raiseValidateError(
  reason: string,
  field: string,
  message: string
): never {
  throw new UnprocessableEntityError(`${reason}: ${field} — ${message}`);
}

export function assertAndRaiseValidateError(
  condition: boolean,
  reason: string,
  field: string,
  message: string
): void {
  if (!condition) {
    raiseValidateError(reason, field, message);
  }
}

/**
 * Drop-in replacement for the keystone `user-assert` helper. Throws an
 * `UnprocessableEntityError` (a client-facing 422) when the assertion fails
 * rather than a generic `AssertionError`.
 */
export const assert = {
  strictEqual(actual: unknown, expected: unknown, message: string): void {
    if (actual !== expected) {
      throw new UnprocessableEntityError(message);
    }
  },
};

/** Build the SDX route path prefix for a given service/client locator. */
export function getRoutePathPrefix(clientId: string): string {
  return `/sdx/0/${clientId}`;
}
