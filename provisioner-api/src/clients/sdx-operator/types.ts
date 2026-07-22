/**
 * Types for the SDX Operator edge server. Hand-maintained to mirror the edge
 * server's CSR endpoint contract.
 */

/**
 * Body for a certificate signing request (CSR) generation. Mirrors the payload
 * the edge server's `/edge/{runtimeGroup}/csr` endpoint expects.
 */
export interface CsrRequest {
  /** Two-letter country code for the certificate subject (e.g. `CA`). */
  country: string;
  /** Organization name for the certificate subject. */
  org_name: string;
  /** Certificate serial number (e.g. `DEV/GOV/MY-RG`). */
  serial_number: string;
  /** Certificate common name (e.g. the member id). */
  common_name: string;
  /** Subject alternative name for the certificate. */
  san: string;
  /** Display name of the person requesting the key. */
  requester_name?: string;
  /** Email of the person requesting the key. */
  requester_email?: string;
}

/**
 * The edge server's response to a CSR request. The exact shape is owned by the
 * edge server, so it is passed through untyped.
 */
export type CsrResponse = Record<string, unknown>;
