import * as React from 'react';
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
import { Product, Dataset } from '@/shared/types/query.types';
import { restApi } from '@/shared/services/api';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient, useQuery } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import {
  FaCheckCircle,
  FaExternalLinkAlt,
  FaTimesCircle,
} from 'react-icons/fa';
import TagsList from '@/components/tags-list';
import ReactMarkdownWithHtml from 'react-markdown/with-html';
import gfm from 'remark-gfm';
import { DocHeader, InternalLink } from '@/components/docs';

const renderers = {
  link: InternalLink,
  heading: DocHeader,
};

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
  const queryKey = ['DiscoverableDataset', id];

  await queryClient.prefetchQuery(
    queryKey,
    async () => await restApi<Dataset>(`/ds/api/directory/${id}`)
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
  const { data } = useQuery<Dataset>(queryKey, () =>
    restApi<Dataset>(`/ds/api/directory/${id}`)
  );

  const hasProtectedEnvironments = (prod) =>
    prod.environments?.filter((env) => env.flow !== 'public').length > 0;

  return (
    <>
      <Head>
        <title>API Services Portal | API Directory</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          title={
            data.isInCatalog ? (
              <Link
                isExternal
                href={`https://catalogue.data.gov.bc.ca/dataset/${data.name}`}
                target="_blank"
                rel="noreferrer"
              >
                {data.title}
                <Icon
                  as={FaExternalLinkAlt}
                  boxSize="5"
                  mx={2}
                  color="gray.400"
                />
              </Link>
            ) : (
              <Text>{data.title}</Text>
            )
          }
        >
          {data.organization && (
            <Box fontSize="sm" color="gray.600">
              <Text>
                Published by the{' '}
                <Text as="strong">
                  {data.organization.title}
                  {' - '}
                </Text>
                {data.organizationUnit && (
                  <Text as="strong">{data.organizationUnit.title}</Text>
                )}
              </Text>
            </Box>
          )}
          <Box fontSize="sm" color="gray.600">
            <Text>
              Licensed under <Text as="strong">{data.license_title}</Text>
            </Text>
          </Box>
        </PageHeader>
        <Grid my={5} gap={4} templateColumns="repeat(12, 1fr)">
          <GridItem colSpan={9}>
            <Box bgColor="white">
              <Box as="header" p={4}>
                <Heading size="md">Details</Heading>
              </Box>
              <Divider />
              <Box p={4}>
                <ReactMarkdownWithHtml renderers={renderers} plugins={[gfm]}>
                  {data.notes}
                </ReactMarkdownWithHtml>
              </Box>
              <Divider />
              <Flex bgColor="gray.50" p={4} align="center">
                <Heading as="h6" size="xs" mr={4}>
                  Tags
                </Heading>
                {data && (
                  <TagsList
                    colorScheme="blue"
                    data={data.tags}
                    size="0.75rem"
                  />
                )}
              </Flex>
            </Box>
          </GridItem>
          <GridItem as="aside" colSpan={3}>
            {data &&
              detailItems.map((d) => (
                <Box key={d.title} mb={4}>
                  <Heading size="xs">{d.title}</Heading>
                  <Text fontSize="sm" color="gray.600">
                    {!d.isBool && data[d.key]}
                    {d.isBool &&
                      (data[d.key] ? (
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
        {(data as any).products
          .filter((prod) => prod.environments.length > 0)
          .map((prod) => (
            <Box p={2}>
              <Text>{prod.name}</Text>
              <NextLink href={`/devportal/requests/new/${prod.id}`}>
                <Button
                  colorScheme="green"
                  disabled={hasProtectedEnvironments(prod) == false}
                >
                  Request Access
                </Button>
              </NextLink>
            </Box>
          ))}
      </Container>
    </>
  );
};

export default ApiPage;
