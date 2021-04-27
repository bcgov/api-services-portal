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
  credIssuerId: string;
  owner: string;
  resourceType: string;
}

const ResourcesComponent: React.FC<ResourcesProps> = ({
  credIssuerId,
  owner,
  resourceType,
}) => {
  const { data } = useApi(
    ['allProductEnvironments', credIssuerId, owner, resourceType],
    {
      query,
      variables: { credIssuerId, owner, resourceType },
    }
  );

  return (
    <>
      {data?.getResourceSet == null && <Progress size="xs" isIndeterminate />}
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Resource ({resourceType})</Th>
            <Th>Type</Th>
            <Th>Shared With</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data?.getResourceSet?.map((r) => (
            <Tr key={r.id}>
              <Td width="50%">
                <NextLink
                  passHref
                  href={`/devportal/resources/${r.id}?issuer=${credIssuerId}`}
                >
                  <Link color="bc-link">{r.name}</Link>
                </NextLink>
              </Td>
              <Td>{r.type}</Td>
              <Td>
                <AvatarGroup size="sm" max={6}>
                  {data.getPermissionTickets
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
  query GetResources(
    $credIssuerId: ID!
    $owner: String
    $resourceType: String
  ) {
    getResourceSet(
      credIssuerId: $credIssuerId
      owner: $owner
      type: $resourceType
    ) {
      id
      name
      type
    }

    getPermissionTickets(credIssuerId: $credIssuerId) {
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
