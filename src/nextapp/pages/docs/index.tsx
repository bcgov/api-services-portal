import * as React from 'react';
import Head from 'next/head';
import {
  Badge,
  Box,
  Center,
  Container,
  Divider,
  Flex,
  Heading,
  Icon,
  Link,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaRegFolderOpen } from 'react-icons/fa';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { QueryClient, useQuery } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import { restApi } from '@/shared/services/api';
import Card from '@/components/card';
import GridLayout from '@/layouts/grid';
import PageHeader from '@/components/page-header';
import type { DocumentationArticle } from '@/shared/types/app.types';

export const getServerSideProps: GetServerSideProps = async () => {
  const queryKey = 'allDocuments';
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () => await restApi<DocumentationArticle[]>('/ds/api/documentation')
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      queryKey,
    },
  };
};

const DocsPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ queryKey }) => {
  const { data } = useQuery(queryKey, () =>
    restApi<DocumentationArticle[]>('/ds/api/documentation')
  );

  return (
    <>
      <Head>
        <title>API Program Services | Documentation</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title="API Guides and Documentation" />
        {data.length === 0 && (
          <Center my={12}>
            <Box
              textAlign="center"
              p={8}
              bg="white"
              borderRadius="4px"
              maxW={{ sm: 400 }}
              mx={{ base: 4 }}
            >
              <Icon
                as={FaRegFolderOpen}
                w={20}
                h={20}
                mb={4}
                color="gray.300"
              />
              <Heading as="h3" size="md" mb={2}>
                No Documentation Found
              </Heading>
              <Text>
                We are in the process of populating this section. Check back
                soon
              </Text>
            </Box>
          </Center>
        )}
        {data.length > 0 && (
          <GridLayout>
            {data.map((d) => (
              <Card key={d.id}>
                <Box
                  as="header"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                  p={4}
                  pb={2}
                >
                  <Box as="hgroup" display="flex" overflow="hidden" mr={2}>
                    <Heading size="sm" lineHeight="1.5">
                      <NextLink passHref href={`/docs/${d.slug}`}>
                        <Link _hover={{ textDecor: 'underline' }}>
                          {d.title}
                        </Link>
                      </NextLink>
                    </Heading>
                  </Box>
                </Box>
                <Divider />
                <Box p={4} flex={1}>
                  <Text fontSize="sm">{d.description}</Text>
                </Box>
                <Divider />
                <Flex p={4} bgColor="gray.50" justify="space-between">
                  <Wrap spacing={2}>
                    {d.tags?.map((tag) => (
                      <WrapItem key={tag}>
                        <Badge colorScheme="green">{tag}</Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Flex>
              </Card>
            ))}
          </GridLayout>
        )}
      </Container>
    </>
  );
};

export default DocsPage;
