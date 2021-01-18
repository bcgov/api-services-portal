import * as React from 'react';
import Head from 'next/head';
import { Box, Center, Heading, Icon, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { FaRegFolderOpen } from 'react-icons/fa';
import { gql } from 'graphql-request';

import api from '../shared/services/api';
import Card from '../components/card';
import GridLayout from '../layouts/grid';
import { GetStaticProps } from 'next';

interface PageData {
  id: string;
  description: string;
  slug: string;
  title: string;
}

interface DocsPageProps {
  pages: PageData[];
}

const DocsPage: React.FC<DocsPageProps> = ({ pages }) => {
  return (
    <>
      <Head>
        <title>API Program Services | Documentation</title>
      </Head>
      {pages.length === 0 && (
        <Center h="100%">
          <Box
            textAlign="center"
            p={8}
            bg="white"
            borderRadius="4px"
            maxW={{ sm: 400 }}
            mx={{ base: 4 }}
          >
            <Icon as={FaRegFolderOpen} w={20} h={20} mb={4} color="gray.300" />
            <Heading as="h3" size="md" mb={2}>
              No Documentation Found
            </Heading>
            <Text>
              We're in the process of populating this section. Check back soon
            </Text>
          </Box>
        </Center>
      )}
      {pages.length > 0 && (
        <GridLayout>
          {pages.map((d) => (
            <Card key={d.id}>
              <Heading as="h3" size="md" mb={2}>
                <Link href={`/docs/${d.slug}`}>{d.title}</Link>
              </Heading>
              <Text>{d.description}</Text>
            </Card>
          ))}
        </GridLayout>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const pagesQuery = gql`
    {
      allContents(where: { isComplete: true }) {
        id
        title
        slug
        description
      }
    }
  `;
  const pages = await api(pagesQuery);

  return {
    props: {
      pages: pages.allContents,
    },
  };
};

export default DocsPage;
