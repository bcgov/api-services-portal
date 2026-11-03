jest.mock('../../../services/keycloak', () => ({
  KeycloakGroupService: jest.fn(),
}));

const { KeycloakGroupService } = require('../../../services/keycloak');
const { NamespaceService } = require('../../../services/org-groups');

describe('NamespaceService.getNamespaceAttributes', () => {
  let findByName;

  beforeEach(() => {
    jest.clearAllMocks();
    findByName = jest.fn();
    KeycloakGroupService.mockImplementation(() => ({ findByName }));
  });

  it('returns the namespace group attributes', async () => {
    findByName.mockResolvedValue({
      name: 'sdx-gw-abc12',
      attributes: { 'perm-data-plane': ['sdx-edge'] },
    });

    await expect(
      new NamespaceService('http://keycloak').getNamespaceAttributes(
        'sdx-gw-abc12'
      )
    ).resolves.toEqual({ 'perm-data-plane': ['sdx-edge'] });
    expect(findByName).toHaveBeenCalledWith('ns', 'sdx-gw-abc12', false);
  });

  it('returns no attributes for a group without any', async () => {
    findByName.mockResolvedValue({ name: 'sdx-gw-abc12' });

    await expect(
      new NamespaceService('http://keycloak').getNamespaceAttributes(
        'sdx-gw-abc12'
      )
    ).resolves.toEqual({});
  });

  it('returns undefined when the namespace group is missing', async () => {
    findByName.mockResolvedValue(undefined);

    await expect(
      new NamespaceService('http://keycloak').getNamespaceAttributes(
        'sdx-gw-abc12'
      )
    ).resolves.toBeUndefined();
  });
});
