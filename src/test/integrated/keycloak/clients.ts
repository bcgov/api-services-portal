/*

Wire up directly with Keycloak and use the Services

To run:


npm run ts-build
export CID=""
export CSC=""
export ISSUER=""
npm run ts-watch
node dist/test/integrated/keycloak/clients.js

*/
import crypto, { KeyExportOptions } from 'crypto';
import { o } from '../util';

import {
  KeycloakClientService,
  KeycloakClientRegistrationService,
} from '../../../services/keycloak';

(async () => {
  // const kc = new KeycloakClientService(process.env.ISSUER);
  // await kc.login(process.env.CID, process.env.CSC);

  const kcr = new KeycloakClientRegistrationService(
    process.env.ISSUER,
    process.env.ISSUER + '/clients-registrations/openid-connect',
    undefined
  );

  await kcr.login(process.env.CID, process.env.CSC);

  // const group = await kc.getGroup('ns', 'platform');
  // console.log(JSON.stringify(group, null, 4));

  // console.log(await kc.listMembers('660cadef-9233-4532-ba45-5393beaddea4'));

  // const c = await kc.findByClientId('5D0C6941-19444960DC7');
  // o(c);

  await kcr.syncAndApply('5D0C6941-19444960DC7', ['other'], []);

  if (false) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    o(privateKey);
    const fs = require('fs');
    fs.writeFileSync('p.key', privateKey);
  }

  //const cid = '76d86d09-dc75-4c25-97ae-c75a169fe9a7';
  const cid = '998b9ad1-2ef0-461e-8de0-9b2a943d2a71';
  //const newKey = await kc.uploadCertificate(cid, publicKey);
  //o(newKey);

  // const k = crypto.createPrivateKey(Buffer.from(privateKey));
  // o(k.export({ format: 'der', type: 'pkcs8' }).toString('hex'));
  // const pkey =
  //   'MIIEowIBAAKCAQEAjsmrEKorUmnBhdswzw3yP5bQqPlyIv0+s+Z+hJ4ODdSaqyW2Q8JTNqZFQjX481bRBp0i1emDn9rvxKquMbXYSlAgUhxIQC87LWR3WrjwbiWELcSw+FwLuXplJxWdHID28lKxMfWfOXIr8Mh2dW+xNVPcXJpLoeJoIaO/BJHm/wloT4NfTYWr0UrubMWk9BNZZgW6drmxG/VxNmM+MuhaIsd+q5CWra7ojOjjNdwCSuIVIgLXKluIEtVJwlT58l03VUAi/ZoZg/zMHjjU2JZMLSXLiF8owwrhWkSj0fmvZH7nvtmntvxuo0RTir8DQ6XmoCO6xQkOTl3Ogh4Vje0KewIDAQABAoIBAEHq6fUsiglm1zdjZFoCFzax+iw31DBA9yR4ISo6CUTrRGgEZetMF7xf8BNL9VzpVGAYRM+6GNDAcvY40WgTigFski817UjsRQaEnfEc9anz2dyDNCvD2onK7k2n1bsl8lsWP8VPni0X/x8OfFlksctrpox9krLuYaI+BN4oORq9XJWhUezRxeWhLJ43k/bpVnyaeI53eUudDycmQu+EvmJ+076Te9GVyRh9276nz/PQvXAt8iPQvzGeNAl+HxXTWHnFQnHMQvqWVrVsmTr7T/MPP7J7zW+juDqq+iNmmRjigDVQBJUcGjDYxhQsHs4b9N2f/u+vT4TOmFtRhsMojIECgYEA1CZuDk7ri9sTyiyRVHt2WPx8cl0r7Uv37PJYn/eOuH4tTwO0Ga1PiaLSidMdJVa1oCejX9wZPsrAreGokO6tfv423qOjIU84c2aHjyNn2y1HucvAZKbDEMLvCYxtMAX2bSdJK8XMsJubVQ0fjJXxA69e213Ts4g/FujV9DfuWMECgYEArE0Liev20ETQFoXoZaMwROQVTuUVlL2rGJWHon1ivJlYyS9CRGte1PlgoUCqr5qR5g6Xqf3Xtva4fg/rsC8MKJANKnes26IaRzRVvVsLveKbMT2rXaOYFt5MakioCQPy2t4YyA0ryczYXJlXPuHONjIkoC6kTIPzZt6Ba/feFjsCgYBgyhe0F3WHnS/uMV8suBdKigcM9k0wOlSmmfqtIPjQW2C4h+wHOvbqyIpdrx/BBUpgAzWaaoRqDX7S1f1eAkbNhZXrBaVLcSVEISb/uxuK96GdtsPUJ/EfGJCOPq8iFdZT/nR3sAqvGI9Jwm7+aPpIwB3631fStPpzrU7P2SS5AQKBgQCULpKs5EXZKkU4CaQrvSQnK21z86sSx+gc9YS351QCVXO5Wq6IPztIuMw1AnOJIMs3avdemFRsI1XZ/QE6/ctcGz9ndZMxNQGamVTfzCyV+wxzVdFKcAa+LCLWCXSShFXZi8cOTd2J6WVuheY1y2dYztkW9eYRdC3iG5x86aiTvwKBgFQNdz/mS/+Wn1Brvws6MtipXKk9teRk6v5NupbuBRhyHqXcPI8qghhjbKHmVVIAQeLC2aAmvxT6NACzEZpQCX0SaRzNF/7/RX49pWw88XVNIPMe6clj3Xe7b9+HDkkw6tBTk06z1ezAvroSFCkB51DGFgj/U+xhGS+7inctBdu9';

  // const pub =
  //   'MIICtzCCAZ8CBgGCawiVSzANBgkqhkiG9w0BAQsFADAfMR0wGwYDVQQDDBQ2REM0RDcwNS04QzRFRUJFN0M3NDAeFw0yMjA4MDQyMjQzMjBaFw0zMjA4MDQyMjQ1MDBaMB8xHTAbBgNVBAMMFDZEQzRENzA1LThDNEVFQkU3Qzc0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv272UB+5FntV8bxh9IpgdmV5iOQgvhdkpScD07V2Y4hfN/n1W5RxJiunbIll59BKDnmLALUyEY1p+/lYJscndWIycLSzp9a9cPKMw2ygT3SKTf6FZ1Pg9ImpGmVV1exlo0AcxI/3JUWDmYmZjuFMhN51M9ZFt9BwDG6WjqKoQIZ7oblH46Dm0RsI7azwzHSdJ1ydOx1hJzrCHuTJl1PzuH5b/FjZDNxNnFcxt26xswbINelt9jt1NksAaMWGcWfwrpXYhoa6hEl+4IuNosOeJTabQMhc4pOlnapExS5FHqkzlC68nQ1EtRtdtlx7fIUMwllDwGuoXJM1686rfnh9AQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQCs5oUSbZG8vgrLpvxKYLsVskwA3pjqBJydpfFiWvZffJ6uVYy7LJwSYvsAJv2jEJOOBlmTlkGnkgxxRVF/nnlgLV7JW9iRmEJGDOVrwg+wTFvMV1tqYLF37nA+btpxSwVVhnbVgNCKYHai5VsbO+k2UNhAG0G66el0WqGb4911ZR+6g80Yku4p8i3A7RyzDxHWNIHSx5Pzdc0UjAZAz264CqpQMQB5uG8X0kXC7nUKnlLAcJrv08XqpNVUv0WMOt2U/moQGEtw6BUYC1D0ea/1HTCqQE9OkB2V84nA8pvuwEpp+goUvQ2u/K9j5TsjgedCdRSFfV4ODSEBswylw0lY';

  // const k = crypto.createPublicKey(Buffer.from(pub));
  // o(k.export({ format: 'pem', type: 'pkcs8' }).toString());
  // o(k.export({ format: 'pem', type: 'pkcs8' }).toString());

  // const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  //   modulusLength: 4096,
  //   publicKeyEncoding: {
  //     type: 'spki',
  //     format: 'pem',
  //   },
  //   privateKeyEncoding: {
  //     type: 'pkcs8',
  //     format: 'pem',
  //   },
  // });

  // const c = await kc.list();
  // o(c);

  /*
npm install --save njwt node-fetch

export ISS="https://dev.oidc.gov.bc.ca/auth/realms/xtmke7ky"
export TURL="https://dev.oidc.gov.bc.ca/auth/realms/xtmke7ky/protocol/openid-connect/token"

echo "
const njwt = require('njwt');

const fs = require('fs')

const jose = require('node-jose');

const privateKey = fs.readFileSync('p.key') // Load an RSA private key from configuration
const clientId = process.env.CID; // Or load from configuration
const now = Math.floor( new Date().getTime() / 1000 ); // seconds since epoch
const plus5Minutes = new Date( ( now + (5*60) ) * 1000); // Date object
const alg = 'RS256'; // one of RSA or ECDSA algorithms: RS256, RS384, RS512, ES256, ES384, ES512

const claims = {
  aud: process.env.ISS
};

const jwt = njwt.create(claims, privateKey, alg)
  .setIssuedAt(now)
  .setExpiration(plus5Minutes)
  .setIssuer(clientId)
  .setSubject(clientId)
  .compact();

const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

const params = new URLSearchParams();
params.append('grant_type', 'client_credentials');
params.append('client_id', process.env.CID);
params.append('scopes', 'openid');
params.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
params.append('client_assertion', jwt);

fetch(process.env.TURL, { method: 'POST', body: params })
    .then(res => res.json())
    .then(json => console.log(json));

" | CID="6DC4D705-8C4EEBE7C74" node
  */
})();
