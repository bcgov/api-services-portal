import { gql } from 'graphql-request';

export const SEARCH_DATASETS = gql`
  query GET($search: String!) {
    allDatasets(search: $search) {
      id
      name
      title
    }
  }
`;
