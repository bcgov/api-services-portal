import { gql } from 'graphql-request';

export const ORGANIZATIONS_LIST = gql`
  query GET {
    allOrganizations(sortBy: name_DESC) {
      id
      name
      title
    }
  }
`;

export const ORGANIZATIONS_OWN_UNITS_LIST = gql`
  query GET($id: ID!) {
    Organization(where: { id: $id }) {
      id
      orgUnits {
        name
        id
        title
      }
    }
  }
`;

export const ORGANIZATION_UNITS_LIST = gql`
  query GET($search: String) {
    allOrganizationUnits(search: $search) {
      id
      name
    }
  }
`;
