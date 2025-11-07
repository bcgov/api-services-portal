const fs = require('fs');
const njwt = require('njwt');
const axios = require('axios');

// Load private key
const privateKey = `
-----BEGIN PRIVATE KEY-----
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
k1UvfOn9MMHfbOrl+GjadxaBiCR5Lg==
-----END PRIVATE KEY-----
`;

// Replace these with your actual values
const clientId = '4A8A8790-3497F9DFDBE';
const tokenEndpoint = 'https://authz-apps-gov-bc-ca-lab.dev.api.gov.bc.ca/auth/realms/aps/protocol/openid-connect/token';
const oidcIssuer = 'https://authz-1d4461-prod.apps.silver.devops.gov.bc.ca/auth/realms/aps';
const kongUrl = 'https://cc-service-for-platform-api-gov-bc-ca-lab.dev.api.gov.bc.ca/';

// JWT claims
const now = Math.floor(Date.now() / 1000);
const plus5Minutes = new Date((now + 5 * 60) * 1000);
const alg = 'RS256';

const claims = {
  aud: 'https://authz-apps-gov-bc-ca-lab.dev.api.gov.bc.ca/auth/realms/aps/protocol/openid-connect/token',
};

const jwt = njwt
  .create(claims, privateKey, alg)
  .setIssuedAt(now)
  .setExpiration(plus5Minutes)
  .setIssuer(clientId)
  .setSubject(clientId)
  .compact();

// Request access token
axios.post(tokenEndpoint, new URLSearchParams({
  grant_type: 'client_credentials',
  client_id: clientId,
  scopes: 'openid',
  client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
  client_assertion: jwt,
}), {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})
.then(res => {
  const token = res.data.access_token;
  // Call protected API
  return axios.get(kongUrl, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
})
.then(res => {
  console.log('API response status:', res.status);
  console.log('API response data:', res.data);
})
.catch(err => {
  console.error('Error:', err.response ? err.response.data : err.message);
});