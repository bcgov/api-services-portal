import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Avatar,
  AvatarGroup,
  Box,
  Container,
  Divider,
  Heading,
  Link,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
} from '@chakra-ui/react';
// import EmptyPane from '@/components/empty-pane';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { gql } from 'graphql-request';
import api, { useApi } from '@/shared/services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import NextLink from 'next/link';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import { dehydrate } from 'react-query/hydration';
import { getSession, useSession, useAuth } from '@/shared/services/auth';
import { useRouter } from 'next/router';

interface ResourcesProps {
    credIssuerId: string;
    owner: string;
    resourceType: string;
    environment: string;
}

const ResourcesComponent: React.FC<ResourcesProps> = ({credIssuerId, owner, resourceType, environment}) => {
    const { data } = useApi(
        'allProductResources',
        { query, variables: { credIssuerId, owner, resourceType } },
        { suspense: false }
    );
    
    if (!data) { return <></> }
    return (

    <Box bgColor="white" my={4}>
        <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Resource ({resourceType})</Th>
            <Th>Type</Th>
            <Th>Shared With</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.getResourceSet?.map((r) => (
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
      </Box>
    )
}


export default ResourcesComponent;

const query = gql`
  query GetResources($credIssuerId: ID!, $owner: String, $resourceType: String) {
    getResourceSet(credIssuerId: $credIssuerId, owner: $owner, type: $resourceType) {
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
