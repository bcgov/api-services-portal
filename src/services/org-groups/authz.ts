import { strict as assert } from 'assert';
import { Logger } from '../../logger';
import { KeycloakTokenService, Uma2WellKnown } from '../keycloak';
import { UMAResourceRegistrationService } from '../uma2';

const logger = Logger('org-group.authz');

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

  async createIfMissingResource(org: string): Promise<string> {
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
      return res.id;
    } else {
      const created = await svc.createResourceSet({
        name: resourceName,
        type: 'organization',
        resource_scopes: AllOrgAuthzScopes,
        ownerManagedAccess: true,
      });
      logger.debug("[createIfMissingResource] '%s' CREATED", resourceName);
      return created.id;
    }
  }
}
