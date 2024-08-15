import { newNamespaceID } from '../../../services/identifiers';
import {
  KeycloakPermissionTicketService,
  KeycloakTokenService,
  getUma2FromIssuer,
} from '../../../services/keycloak';
import {
  UMA2TokenService,
  UMAPermissionService,
  UMAResourceRegistrationService,
} from '../../../services/uma2';

import jwtDecoder from 'jwt-decode';

describe('UMA2 Namespace Permission Tickets', function () {
  let svc: UMAResourceRegistrationService;

  let gwaToken: string;
  let subjectToken: string;

  const ns = newNamespaceID();

  beforeAll(async () => {
    const tok = new KeycloakTokenService(
      process.env.OIDC_ISSUER + '/protocol/openid-connect/token'
    );
    gwaToken = await tok.getKeycloakSession(
      process.env.GWA_RES_SVR_CLIENT_ID,
      process.env.GWA_RES_SVR_CLIENT_SECRET
    );

    subjectToken = await tok.getKeycloakSessionByGrant(
      process.env.TEST_PORTAL_CLIENT_ID,
      process.env.TEST_PORTAL_CLIENT_SECRET,
      'password',
      process.env.TEST_PORTAL_USERNAME,
      process.env.TEST_PORTAL_PASSWORD
    );

    svc = new UMAResourceRegistrationService(
      process.env.OIDC_ISSUER + '/authz/protection/resource_set',
      gwaToken
    );

    const rset = await svc.createResourceSet({
      name: ns,
      displayName: 'Gateway ' + ns,
      type: 'namespace',
      resource_scopes: [
        'Namespace.Manage',
        'Namespace.View',
        'GatewayConfig.Publish',
      ],
      ownerManagedAccess: true,
    });

    const permissionApi = new KeycloakPermissionTicketService(
      process.env.OIDC_ISSUER,
      gwaToken
    );

    const subjectUuid = 'bf498a7b-b6e0-49bb-9ea8-0241d7792fe2';
    for (const scope of ['Namespace.Manage']) {
      await permissionApi.createPermission(rset.id, subjectUuid, true, scope);
    }
  });

  it('it should perform the switch-to correctly', async function () {
    const uma2 = await getUma2FromIssuer(process.env.OIDC_ISSUER);

    const uma2token = new UMA2TokenService(uma2.token_endpoint);

    const accessToken = await uma2token.getRequestingPartyToken(
      process.env.GWA_RES_SVR_CLIENT_ID,
      process.env.GWA_RES_SVR_CLIENT_SECRET,
      subjectToken,
      ns
    );

    const rpt: any = jwtDecoder(accessToken);
    expect(rpt.iss).toBe(
      'http://keycloak.localtest.me:9081/auth/realms/master'
    );

    const match = {
      permissions: [
        {
          scopes: [
            'Namespace.View',
            'GatewayConfig.Publish',
            'Namespace.Manage',
          ],
          rsid: '8ddc22f0-3f9d-4c0e-97b6-e2677a785728',
          rsname: 'gw-0880e',
        },
      ],
    };
    expect(JSON.stringify(rpt.authorization.permissions[0].scopes)).toBe(
      JSON.stringify(match.permissions[0].scopes)
    );

    const permApi = new UMAPermissionService(
      uma2.permission_endpoint,
      gwaToken
    );
    const permTicket = await permApi.requestTicket([
      { resource_scopes: ['Namespace.Manage'] },
    ]);
    const permittedResources = await uma2token.getPermittedResourcesUsingTicket(
      subjectToken,
      permTicket
    );

    expect(permittedResources.filter((p) => p.rsname == ns).length).toBe(1);
  });
});
