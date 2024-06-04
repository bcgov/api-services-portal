import { newNamespaceID } from '../../../services/identifiers';
import { KeycloakTokenService } from '../../../services/keycloak';
import { UMAResourceRegistrationService } from '../../../services/uma2';

describe('UMA2 Namespace Resources', function () {
  let svc: UMAResourceRegistrationService;

  beforeAll(async () => {
    const tok = new KeycloakTokenService(
      process.env.OIDC_ISSUER + '/protocol/openid-connect/token'
    );
    const token = await tok.getKeycloakSession(
      process.env.GWA_RES_SVR_CLIENT_ID,
      process.env.GWA_RES_SVR_CLIENT_SECRET
    );

    svc = new UMAResourceRegistrationService(
      process.env.OIDC_ISSUER + '/authz/protection/resource_set',
      token
    );
  });

  const ns = newNamespaceID();

  it('it should create a resource', async function () {
    const newResource = await svc.createResourceSet({
      name: ns,
      displayName: 'Gateway ' + ns,
      type: 'namespace',
      resource_scopes: [
        'Namespace.Manage',
        'Namespace.View',
        'Gateway.Publish',
      ],
      ownerManagedAccess: true,
    });

    expect(newResource.name).toBe(ns);
    expect(newResource.displayName).toBe(`Gateway ${ns}`);
  });

  it('it should find the resource', async function () {
    const res = await svc.findResourceByName(ns);
    expect(res.name).toBe(ns);
    expect(res.uris.length).toBe(0);
    expect(res.type).toBe('namespace');
    expect(
      res.resource_scopes.filter((s) => s.name == 'Gateway.Publish').length
    ).toBe(1);
    expect(res.displayName).toBe(`Gateway ${ns}`);
  });

  it('it should update the resource display name', async function () {
    await svc.updateDisplayName(ns, 'Changed gateway name');

    const res = await svc.findResourceByName(ns);
    expect(res.name).toBe(ns);
    expect(res.uris.length).toBe(0);
    expect(res.type).toBe('namespace');
    expect(
      res.resource_scopes.filter((s) => s.name == 'Gateway.Publish').length
    ).toBe(1);
    expect(res.displayName).toBe(`Changed gateway name`);
  });

  it('it should return a namespace display name', async function () {
    const resource = await svc.findResourceByName(ns);
    const res = await svc.getResourceSet(resource.id);
    expect(res.displayName).toBe(`Changed gateway name`);
  });
});
