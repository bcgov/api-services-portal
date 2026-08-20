/**
 * Types for the CA token endpoint (step-ca). Hand-maintained to mirror the
 * mock/production `/tokens` endpoint contract.
 */

/**
 * Body for a one-time-use certificate-signing token request.
 */
export interface CaTokenRequest {
  /** Certificate subject (the runtime group's host). */
  subject: string;
  /** Subject alternative names for the certificate. */
  san: string[];
}

/**
 * The CA's response to a token request.
 */
export interface CaTokenResponse {
  /** One-time-use token to present when submitting the CSR to step-ca. */
  token: string;
}
