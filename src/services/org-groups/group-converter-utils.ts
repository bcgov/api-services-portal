/**
 * In order to get role inheritance from a group hierarchy in Keycloak
 * we need to set the root group to be the "role" and then the group
 * hierarchy below it.
 * So to assign a user "Data Custodian" for Org "MoCS", Org Unit "databc"
 * we create a Keycloak Group Hierarchy: "/Data Custodian/MoCS/databc"
 * and assign users to that Group
 */
import { OrganizationGroup } from './org-group-service';

export function root(str: string) {
  const parts = str.split('/');
  return parts.length > 1 ? parts[1] : '';
}

/**
 *
 * @param str
 * @param real_leaf when there is just one node and real_leaf is false, then it returns ""
 * @returns
 */
export function leaf(str: string, real_leaf: boolean = false) {
  const matchLength = real_leaf ? 1 : 2;
  const parts = str.split('/');
  return parts.length <= matchLength ? '' : parts[parts.length - 1];
}

export function parent(str: string) {
  const parts = str.split('/');
  return parts.length > 3
    ? '/' + parts.slice(2, parts.length - 1).join('/')
    : '';
}

export function convertToOrgGroup(str: string): OrganizationGroup {
  const _leaf = leaf(str);
  return {
    name: _leaf === '' ? root(str) : _leaf,
    parent: _leaf === '' ? '' : `/${root(str)}${parent(str)}`,
  };
}

export function isParent(str: string, parent: string) {
  const parts = str.split('/');
  return parts.filter((p) => p === parent).length > 0;
}
