import * as React from 'react';
import api, { useApi } from '@/shared/services/api';
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Link,
  Text,
} from '@chakra-ui/react';
// import EmptyPane from '@/components/empty-pane';
import Head from 'next/head';
import kebabCase from 'lodash/kebabCase';
import NextLink from 'next/link';
import PageHeader from '@/components/page-header';
import { gql } from 'graphql-request';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient } from 'react-query';
import { Query } from '@/shared/types/query.types';
import { dehydrate } from 'react-query/hydration';
import {
  FaCheckCircle,
  FaExternalLinkAlt,
  FaTimesCircle,
} from 'react-icons/fa';
import TagsList from '@/components/tags-list';

type DetailItem = {
  title: string;
  key: string;
  isBool?: boolean;
};

const detailItems: DetailItem[] = [
  {
    title: 'Published',
    key: 'record_publish_date',
  },
  {
    title: 'Sector',
    key: 'sector',
  },
  {
    title: 'Security',
    key: 'security_class',
  },
  {
    title: 'Private',
    key: 'security_class',
    isBool: true,
  },
  {
    title: 'In BC Data Catalogue',
    key: 'isInCatalog',
    isBool: true,
  },
];

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const queryClient = new QueryClient();
  const queryKey = ['DiscoverableProduct', id];

  await queryClient.prefetchQuery(
    queryKey,
    async () =>
      await api<Query>(
        query,
        { id },
        {
          headers: context.req.headers as HeadersInit,
        }
      )
  );

  return {
    props: {
      id,
      dehydratedState: dehydrate(queryClient),
      queryKey,
    },
  };
};

const ApiPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, queryKey }) => {
  const { data } = useApi(queryKey, { query }, { suspense: false });

  return (
    <>
      <Head>
        <title>API Program Services | API Discovery</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={
            <NextLink href={`/devportal/requests/new/${id}`}>
              <Button colorScheme="green">Request Access</Button>
            </NextLink>
          }
          title={
            <Link
              isExternal
              href={`https://catalogue.data.gov.bc.ca/dataset/${kebabCase(
                data?.DiscoverableProduct?.dataset.title
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              {data?.DiscoverableProduct?.name}
              <Icon
                as={FaExternalLinkAlt}
                boxSize="5"
                mx={2}
                color="gray.400"
              />
            </Link>
          }
        >
          <Box fontSize="sm" color="gray.600">
            <Text>
              Published by{' '}
              <Text as="strong">
                {data.DiscoverableProduct.dataset?.organization?.title}
              </Text>
            </Text>
            <Text>
              Licensed under{' '}
              <Text as="strong">
                {data.DiscoverableProduct.dataset?.license_title}
              </Text>
            </Text>
          </Box>
        </PageHeader>
        <Grid my={5} gap={4} templateColumns="repeat(12, 1fr)">
          <GridItem colSpan={9}>
            <Box bgColor="white">
              <Box as="header" p={4}>
                <Heading size="md">Description</Heading>
              </Box>
              <Divider />
              <Box p={4}>
                <Text>{data.DiscoverableProduct.dataset?.notes}</Text>
              </Box>
              <Divider />
              <Flex bgColor="gray.50" p={4} align="center">
                <Heading as="h6" size="xs" mr={4}>
                  Tags
                </Heading>
                {data.DiscoverableProduct.dataset && (
                  <TagsList
                    colorScheme="blue"
                    data={data.DiscoverableProduct.dataset.tags}
                    size="0.75rem"
                  />
                )}
              </Flex>
            </Box>
          </GridItem>
          <GridItem as="aside" colSpan={3}>
            {detailItems.map((d) => (
              <Box key={d.title} mb={4}>
                <Heading size="xs">{d.title}</Heading>
                <Text fontSize="sm" color="gray.600">
                  {!d.isBool && data.DiscoverableProduct.dataset[d.key]}
                  {d.isBool &&
                    (data.DiscoverableProduct.dataset[d.key] ? (
                      <>
                        <Icon as={FaCheckCircle} color="green.300" /> Yes
                      </>
                    ) : (
                      <>
                        <Icon as={FaTimesCircle} color="red.300" /> No
                      </>
                    ))}
                </Text>
              </Box>
            ))}
          </GridItem>
        </Grid>
      </Container>
    </>
  );
};

export default ApiPage;

const query = gql`
  query GetProduct($id: ID!) {
    DiscoverableProduct(where: { id: $id }) {
      id
      name
      environments {
        name
        active
        flow
        services {
          name
          host
        }
      }
      dataset {
        name
        title
        notes
        sector
        license_title
        security_class
        view_audience
        tags
        record_publish_date
        isInCatalog
        organization {
          title
        }
        organizationUnit {
          title
        }
      }
      organization {
        title
      }
      organizationUnit {
        title
      }
    }
  }
`;
