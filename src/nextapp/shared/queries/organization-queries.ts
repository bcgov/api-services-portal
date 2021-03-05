import { gql } from 'graphql-request';

export const ORGANIZATIONS_LIST = gql`
  query GET {
    allOrganizations {
      id
      name
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
