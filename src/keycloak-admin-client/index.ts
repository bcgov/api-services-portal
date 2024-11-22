import KeycloakAdminClient from '@keycloak/keycloak-admin-client';

export default KeycloakAdminClient;

import lib from '@keycloak/keycloak-admin-client/lib';

export { lib };

// const kcAdminClient = new Keycloak();
// console.log(kcAdminClient);

/*
    "@packages/keycloak-admin-client": "file://./keycloak-admin-client",
*/

import { RequiredActionAlias } from '@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation';
export declare const requiredAction: typeof RequiredActionAlias;
