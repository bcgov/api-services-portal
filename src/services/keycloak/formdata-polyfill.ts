import FormData from 'form-data';

// `@keycloak/keycloak-admin-client` expects `globalThis.FormData` to exist and be usable with
// `instanceof FormData`. When running with `--no-experimental-fetch`, Node may not expose it.
const g = globalThis as any;

if (typeof g.FormData === 'undefined') {
  g.FormData = FormData;
}

