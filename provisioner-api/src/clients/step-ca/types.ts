/**
 * Types for the step-ca one-time-use token issuer. Hand-maintained to mirror
 * the issuer's `/tokens` endpoint contract.
 */

/**
 * Body for a one-time-use certificate-signing token request.
 */
export interface TokenRequest {
  /** Certificate subject (commonly the runtime group's host). */
  subject: string;
  /** Subject alternative names the issued certificate must cover. */
  san: string[];
}

/**
 * The issuer's response to a token request.
 */
export interface TokenResponse {
  token: string;
}
