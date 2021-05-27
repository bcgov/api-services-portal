import * as React from 'react';
import {
  Avatar,
  AvatarGroup,
  Link,
  Progress,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
// import EmptyPane from '@/components/empty-pane';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';
import NextLink from 'next/link';

interface ResourcesProps {
  prodEnvId: string;
  owner: string;
  resourceType: string;
}

const ResourcesComponent: React.FC<ResourcesProps> = ({
  prodEnvId,
  owner,
  resourceType,
}) => {
  const { data } = useApi(
    ['allProductEnvironments', prodEnvId, owner, resourceType],
    {
      query,
      variables: { prodEnvId, owner, resourceType },
    }
  );

  return (
    <>
      {data?.allResourceSets == null && <Progress size="xs" isIndeterminate />}
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Resource ({resourceType})</Th>
            <Th>Type</Th>
            <Th>Shared With</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data?.allResourceSets?.map((r) => (
            <Tr key={r.id}>
              <Td width="50%">
                <NextLink
                  passHref
                  href={`/devportal/resources/${r.id}?peid=${prodEnvId}`}
                >
                  <Link color="bc-link">{r.name}</Link>
                </NextLink>
              </Td>
              <Td>{r.type}</Td>
              <Td>
                <AvatarGroup size="sm" max={6}>
                  {data.allPermissionTickets
                    ?.filter((p) => p.resource === r.id)
                    .map((p) => (
                      <Avatar
                        key={p.id}
                        name={p.requesterName}
                        size="sm"
                        title={p.requesterName}
                      />
                    ))}
                </AvatarGroup>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default ResourcesComponent;

const query = gql`
  query GetResources($prodEnvId: ID!, $resourceType: String) {
    allResourceSets(prodEnvId: $prodEnvId, type: $resourceType) {
      id
      name
      type
    }

    allPermissionTickets(prodEnvId: $prodEnvId) {
      id
      owner
      ownerName
      requester
      requesterName
      resource
      resourceName
      scope
      scopeName
      granted
    }
  }
`;
