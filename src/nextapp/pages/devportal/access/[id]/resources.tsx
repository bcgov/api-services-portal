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
  Progress,
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
    prodEnvId: string;
    owner: string;
    resourceType: string;
    environment: string;
}

const ResourcesComponent: React.FC<ResourcesProps> = ({prodEnvId, owner, resourceType, environment}) => {
    const { data } = useApi(
        'allProductResources',
        { query, variables: { prodEnvId, owner, resourceType } },
        { suspense: false }
    );
    
    return (
    <>
    {data?.getResourceSet == null && <Progress size="xs" isIndeterminate />}     
    <Box bgColor="white" mb={4}>
        <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">Resources for {environment}</Heading>
        </Box>
        <Divider />
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
                  href={`/devportal/resources/${r.id}?peid=${prodEnvId}`}
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
    </>
    )
}


export default ResourcesComponent;

const query = gql`
  query GetResources($prodEnvId: ID!, $owner: String, $resourceType: String) {
    getResourceSet(prodEnvId: $prodEnvId, owner: $owner, type: $resourceType) {
      id
      name
      type
    }

    getPermissionTickets(prodEnvId: $prodEnvId) {
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
