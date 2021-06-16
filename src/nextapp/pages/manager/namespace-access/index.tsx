import * as React from 'react';
import graphql from '@/shared/services/graphql';
import { gql } from 'graphql-request';
const { useEffect, useState } = React;

import ResourceAccess from './resource-access';

const GET_CURRENT_NS = gql`
  query GET {
    currentNamespace {
      id
      name
      scopes {
        name
      }
      prodEnvId
    }
  }
`;

const AccessRedirectPage = () => {
  const [data, setData] = useState(null);
  const fetch = () => {
    graphql(GET_CURRENT_NS).then(({ data }) => {
      setData(data.currentNamespace);
    });
  };

  useEffect(fetch, []);

  if (data != null) {
    return (
      <ResourceAccess
        queryKey=""
        variables={{ resourceId: data.id, prodEnvId: data.prodEnvId }}
      />
    );
  }
  return false;
};

export default AccessRedirectPage;
