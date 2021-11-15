import * as React from 'react';
import { ListItem, UnorderedList } from '@chakra-ui/layout';
import { useApi } from '@/shared/services/api';
import { gql } from 'graphql-request';
import { uid } from 'react-uid';

interface ApplicationServicesProps {
  appId: string;
}

const ApplicationServices: React.FC<ApplicationServicesProps> = ({ appId }) => {
  const { data } = useApi(['applicationServices', appId], {
    query,
    variables: { appId },
  });

  return (
    <UnorderedList spacing={1}>
      {data.myServiceAccesses.length === 0 && (
        <ListItem fontSize="sm">No Service Accesses</ListItem>
      )}
      {data.myServiceAccesses.map((s) => (
        <ListItem key={uid(s.id)} fontSize="sm">
          {s.name}
        </ListItem>
      ))}
    </UnorderedList>
  );
};

export default ApplicationServices;

const query = gql`
  query GET_APPLICATION_SERVICES($appId: String!) {
    myServiceAccesses(where: { application: { appId: $appId } }) {
      id
      name
      active
      application {
        name
      }
      productEnvironment {
        id
        name
        product {
          name
        }
      }
    }
  }
`;
