import { gql } from 'graphql-request';

export const SEARCH_DATASETS = gql`
  query GET($search: String!, $first: Int) {
    allDatasets(search: $search, first: $first) {
      id
      name
      title
    }
  }
`;
