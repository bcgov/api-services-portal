import { setupServer } from 'msw/node';

// import { handlers } from './handlers';
import KongHandlers from './handlers/kong';
import KeycloakHandlers from './handlers/keycloak';

export const server = setupServer(...KongHandlers, ...KeycloakHandlers);
