import { gql } from 'graphql-request';

const query = gql`
  query GET($id: ID!) {
    allCredentialIssuersByNamespace(where: { id: $id }) {
      environmentDetails
    }
  }
`;

export default function JwtKeycloak(namespace, envName, issuer) {
  if (issuer == null || issuer.environmentDetails == null) {
    return '';
  }
  const envDetails = JSON.parse(issuer.environmentDetails);
  const env = envDetails.filter((e) => e.environment === envName);
  if (env.length == 0) {
    return '';
  }
  return `
  plugins:
  - name: jwt-keycloak
    tags: [ ns.${namespace} ]
    enabled: true
    config:
      algorithm: RS256
      well_known_template: ${env[0].issuerUrl}/.well-known/openid-configuration
      allowed_iss:
      - ${env[0].issuerUrl}
      run_on_preflight: true
      iss_key_grace_period: 10
      maximum_expiration: 0
      claims_to_verify:
      - exp
      uri_param_names:
      - jwt
      cookie_names: []
      scope: null
      roles: null
      realm_roles: null
      client_roles: null
      anonymous: null
      consumer_match: true
      consumer_match_claim: azp  
      consumer_match_claim_custom_id: true
      consumer_match_ignore_not_found: false
`;
}
