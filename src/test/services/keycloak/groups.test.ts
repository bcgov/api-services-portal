import { KeycloakGroupService } from '../../../services/keycloak';

describe('Keycloak Group Service', function () {
  it('it should search groups', async function () {
    const kc = new KeycloakGroupService('https://provider/realms/abc');
    const result = await kc.search('test-2');
    expect(result.length).toBe(1);
  });

  it('it should find by name', async function () {
    const kc = new KeycloakGroupService('https://provider/realms/abc');
    const result = await kc.findByName('ns', 'test-2');
    expect(result.path).toBe('/ns/test-2');
  });

  /*
  createGroup
  updateGroup
  createIfMissing
  createRootGroup
  createIfMissingForParentGroup
  getAllGroups
  getGroups
  getGroupById
  getGroup
  listMembers
  addMemberToGroup
  delMemberFromGroup
  lookupMemberByUsername
  deleteGroup
  */
});
