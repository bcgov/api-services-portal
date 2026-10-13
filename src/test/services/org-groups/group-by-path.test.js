const {
  KeycloakGroupService,
} = require('../../../services/keycloak/group-service');
const {
  OrgGroupService,
} = require('../../../services/org-groups/org-group-service');

const issuer = 'http://keycloak.example.com/auth/realms/master';

const notFound = () => {
  const err = new Error('Request failed with status code 404');
  err.response = { status: 404 };
  return err;
};

describe('KeycloakGroupService.findGroupByPath', () => {
  it('looks up the group by path in the issuer realm', async () => {
    const service = new KeycloakGroupService(issuer);
    const getGroupByPath = jest
      .spyOn(service.getAdminClient().realms, 'getGroupByPath')
      .mockResolvedValue({ id: 'g1', path: '/access-manager/systems/A.B.C' });

    const group = await service.findGroupByPath('/access-manager/systems/A.B.C');

    expect(group.id).toBe('g1');
    expect(getGroupByPath).toHaveBeenCalledWith({
      realm: 'master',
      path: 'access-manager/systems/A.B.C',
    });
  });

  it('returns null when the group does not exist', async () => {
    const service = new KeycloakGroupService(issuer);
    jest
      .spyOn(service.getAdminClient().realms, 'getGroupByPath')
      .mockRejectedValue(notFound());

    expect(await service.findGroupByPath('/missing')).toBeNull();
  });

  it('rethrows other errors', async () => {
    const service = new KeycloakGroupService(issuer);
    jest
      .spyOn(service.getAdminClient().realms, 'getGroupByPath')
      .mockRejectedValue(new Error('connection refused'));

    await expect(service.findGroupByPath('/x')).rejects.toThrow(
      'connection refused'
    );
  });
});

describe('OrgGroupService.listMembersForPath', () => {
  const newService = () => {
    const service = new OrgGroupService(issuer);
    const keycloak = service.keycloakService;
    return { service, keycloak };
  };

  it('lists the members of the group at the path', async () => {
    const { service, keycloak } = newService();
    jest
      .spyOn(keycloak, 'findGroupByPath')
      .mockResolvedValue({ id: 'g1' });
    const listMembers = jest.spyOn(keycloak, 'listMembers').mockResolvedValue([
      {
        id: 'u1',
        username: 'jane@idir',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
      },
      {
        id: 'u2',
        username: 'sam@idir',
        email: 'sam@example.com',
        attributes: { display_name: ['Sam Display'] },
      },
    ]);

    const members = await service.listMembersForPath(
      '/access-manager/systems/A.B.C'
    );

    expect(listMembers).toHaveBeenCalledWith('g1');
    expect(members).toEqual([
      {
        id: 'u1',
        username: 'jane@idir',
        email: 'jane@example.com',
        name: 'Jane Doe',
      },
      {
        id: 'u2',
        username: 'sam@idir',
        email: 'sam@example.com',
        name: 'Sam Display',
      },
    ]);
  });

  it('returns no members when the group does not exist', async () => {
    const { service, keycloak } = newService();
    jest.spyOn(keycloak, 'findGroupByPath').mockResolvedValue(null);
    const listMembers = jest.spyOn(keycloak, 'listMembers');

    expect(await service.listMembersForPath('/missing')).toEqual([]);
    expect(listMembers).not.toHaveBeenCalled();
  });
});
