jest.mock('../../../services/keycloak', () => ({
  KeycloakGroupService: jest.fn(),
}));

const { KeycloakGroupService } = require('../../../services/keycloak');
const { NamespaceService } = require('../../../services/org-groups');

describe('NamespaceService.markNamespaceAsDecommissioned', () => {
  let getGroup, updateGroup;

  beforeEach(() => {
    jest.clearAllMocks();
    getGroup = jest.fn();
    updateGroup = jest.fn();
    KeycloakGroupService.mockImplementation(() => ({ getGroup, updateGroup }));
  });

  it('marks the namespace group decommissioned', async () => {
    getGroup.mockResolvedValue({
      name: 'sdx-gw-abc12',
      attributes: { 'perm-data-plane': ['sdx-edge'] },
    });

    await expect(
      new NamespaceService('http://keycloak').markNamespaceAsDecommissioned(
        'sdx-gw-abc12'
      )
    ).resolves.toBe(true);

    expect(updateGroup).toHaveBeenCalledWith({
      name: 'sdx-gw-abc12',
      attributes: {
        'perm-data-plane': ['sdx-edge'],
        decommissioned: ['true'],
      },
    });
  });

  it('leaves an already decommissioned group unchanged', async () => {
    getGroup.mockResolvedValue({
      name: 'sdx-gw-abc12',
      attributes: { decommissioned: ['true'] },
    });

    await expect(
      new NamespaceService('http://keycloak').markNamespaceAsDecommissioned(
        'sdx-gw-abc12'
      )
    ).resolves.toBe(true);

    expect(updateGroup).not.toHaveBeenCalled();
  });

  it('fails when the namespace group is missing', async () => {
    getGroup.mockResolvedValue(null);

    await expect(
      new NamespaceService('http://keycloak').markNamespaceAsDecommissioned(
        'sdx-gw-abc12'
      )
    ).rejects.toThrow('Namespace not found');
    expect(updateGroup).not.toHaveBeenCalled();
  });
});
