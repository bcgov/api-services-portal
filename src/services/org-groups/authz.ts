import ResourceRepresentation from '@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation';
import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import { KeycloakTokenService, Uma2WellKnown } from '../keycloak';
import { UMAResourceRegistrationService } from '../uma2';

const logger = Logger('org-group.authz');

/**
 * GroupAccess.Manage - allows a user to administer Organization Access for current org and any child
 * Namespace.Assign - allows a user to assign a Namespace to the current orgUnit
 * Dataset.Manage - allows a user to manage Datasets for the current orgUnit
 */
export const AllOrgAuthzScopes: string[] = [
  'GroupAccess.Manage',
  'Namespace.Assign',
  'Dataset.Manage',
];

export class OrgAuthzService {
  private uma2;
  private accessToken: string;

  constructor(uma2: Uma2WellKnown) {
    this.uma2 = uma2;
  }

  async login(clientId: string, clientSecret: string) {
    const tokenService = new KeycloakTokenService(this.uma2.token_endpoint);
    this.accessToken = await tokenService.getKeycloakSession(
      clientId,
      clientSecret
    );
  }

  async findResourceByUri(uri: string): Promise<ResourceRepresentation> {
    logger.debug('[findResourceByUri] %s', uri);

    const svc = new UMAResourceRegistrationService(
      this.uma2.resource_registration_endpoint,
      this.accessToken
    );
    return await svc.findResourceByUri(uri);
  }

  async resourceExists(org: string): Promise<boolean> {
    const svc = new UMAResourceRegistrationService(
      this.uma2.resource_registration_endpoint,
      this.accessToken
    );

    const resourceName = `org/${org}`;

    const res = await svc.findResourceByName(resourceName);
    return Boolean(res);
  }

  async createIfMissingResource(
    org: string
  ): Promise<{ id: string; created: boolean }> {
    logger.debug('[createIfMissingResource] %s', org);

    const svc = new UMAResourceRegistrationService(
      this.uma2.resource_registration_endpoint,
      this.accessToken
    );

    const resourceName = `org/${org}`;

    const res = await svc.findResourceByName(resourceName);
    if (res) {
      logger.debug(
        "[createIfMissingResource] '%s' already exists",
        resourceName
      );
      return { id: res.id, created: false };
    } else {
      const created = await svc.createResourceSet({
        name: resourceName,
        type: 'organization',
        resource_scopes: AllOrgAuthzScopes,
        ownerManagedAccess: true,
      });
      logger.debug("[createIfMissingResource] '%s' CREATED", resourceName);
      return { id: created.id, created: true };
    }
  }
}
