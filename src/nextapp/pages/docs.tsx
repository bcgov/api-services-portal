import * as React from 'react';
import Head from 'next/head';
import {
  Box,
  Center,
  Container,
  Heading,
  HStack,
  Icon,
  Link,
  Tag,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaRegFolderOpen } from 'react-icons/fa';
import { gql } from 'graphql-request';
import type { GetServerSideProps } from 'next';

import api from '@/shared/services/api';
import Card from '@/components/card';
import GridLayout from '@/layouts/grid';
import PageHeader from '@/components/page-header';

interface PageData {
  id: string;
  description: string;
  slug: string;
  title: string;
  tags: string;
}

interface DocsPageProps {
  error: string;
  pages: PageData[];
}

const DocsPage: React.FC<DocsPageProps> = ({ error, pages }) => {
  return (
    <>
      <Head>
        <title>API Program Services | Documentation</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title="API Guides and Documentation">
          <p></p>
        </PageHeader>
        {pages.length === 0 && (
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
              {error && <Text color="red.500">{error}</Text>}
            </Box>
          </Center>
        )}
        {pages.length > 0 && (
          <GridLayout>
            {pages.map((d) => (
              <Card key={d.id}>
                <Heading as="h3" size="md" mb={2}>
                  <NextLink passHref href={`/docs/${d.slug}`}>
                    <Link _hover={{ textDecor: 'underline' }}>{d.title}</Link>
                  </NextLink>
                </Heading>
                <Text>{d.description}</Text>
                <HStack spacing={1} mt={4}>
                    {JSON.parse(d.tags).map((tag:string) => (
                        <Tag size="md" key={tag} variant="solid" colorScheme="teal">{tag}</Tag>
                    ))}
                </HStack>
              </Card>
            ))}
          </GridLayout>
        )}
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    const pagesQuery = gql`
      {
        allDiscoverableContents(where: { isComplete: true }) {
          id
          title
          slug
          description
          tags
        }
      }
    `;
    const pages: { allDiscoverableContents: any[] } = await api(pagesQuery, null, {
        headers: req.headers as HeadersInit,
    });

    return {
      props: {
        pages: pages.allDiscoverableContents || [],
      },
    };
  } catch (err) {
    return {
      props: {
        pages: [],
        error: err.message,
      },
    };
  }
};

export default DocsPage;
