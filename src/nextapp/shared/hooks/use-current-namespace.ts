import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';
import { QueryKey, UseQueryOptions } from 'react-query';

export const queryKey: QueryKey = ['currentNamespace'];

const useCurrentNamespace = (options: UseQueryOptions = {}) => {
  return useApi(queryKey, { query }, options);
};

const query = gql`
  query GetCurrentNamespace {
    currentNamespace {
      name
      org
      orgUnit
      orgUpdatedAt
      orgEnabled
      orgNoticeViewed
      orgAdmins
    }
  }
`;

export default useCurrentNamespace;
