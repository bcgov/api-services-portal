import * as React from 'react';
import {
  // Button,
  Box,
  Container,
  Text,
  // Flex,
  Grid,
  Heading,
  Wrap,
  WrapItem,
  Badge,
  List,
  ListItem,
  Link,
} from '@chakra-ui/react';
import Head from 'next/head';
import NextLink from 'next/link';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import ReactMarkdownWithHtml from 'react-markdown/with-html';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import gfm from 'remark-gfm';
import { QueryClient, useQuery } from 'react-query';
import { dehydrate } from 'react-query/hydration';
// import { FaExternalLinkAlt } from 'react-icons/fa';
import PageHeader from '@/components/page-header';
import { restApi } from '@/shared/services/api';
import styles from './docs.module.css';
import { DocumentationArticle } from '@/shared/types/app.types';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { slug } = params;
  const queryKey = ['documents', slug];
  const sideNavQueryKey = 'allDocuments';
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    queryKey,
    async () => await restApi<DocumentationArticle>(`/ds/api/directory/${slug}`)
  );
  await queryClient.prefetchQuery(
    queryKey,
    async () => await restApi<DocumentationArticle[]>('/ds/api/directory')
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      queryKey,
      sideNavQueryKey,
      slug,
    },
  };
};

const DocsContentPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ queryKey, sideNavQueryKey, slug }) => {
  const { data } = useQuery(queryKey, () =>
    restApi<DocumentationArticle>(`/ds/api/documentation/${slug}`)
  );
  const allArticles = useQuery(sideNavQueryKey, () =>
    restApi<DocumentationArticle[]>('/ds/api/documentation')
  );

  const renderers = {
    link: InternalLink,
    heading: HeadingRenderer,
  };

  return (
    <>
      <Head>
        <title>API Program Services | Documentation</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          breadcrumb={[{ text: 'Documentation Home', href: '/docs' }]}
          title={data.title}
        >
          {data?.publishDate && (
            <Text className="text-sm text-gray-500" d="inline">
              {`Published ${formatDistanceToNow(
                new Date(data.publishDate)
              )} ago`}
            </Text>
          )}
          <Wrap spacing={2} d="inline-flex" ml={4}>
            {data.tags?.map((tag: string) => (
              <WrapItem key={tag}>
                <Badge colorScheme="green">{tag}</Badge>
              </WrapItem>
            ))}
          </Wrap>
        </PageHeader>
        <Grid gridTemplateColumns="1fr 300px" bgColor="white">
          <Box
            borderRight="1px solid"
            borderColor="#f1f1f1"
            p={4}
            className={styles['markdown-body']}
          >
            <ReactMarkdownWithHtml renderers={renderers} plugins={[gfm]}>
              {data?.content}
            </ReactMarkdownWithHtml>
          </Box>

          <Box as="aside" p={4}>
            <Box as="header" mt={2} mb={4}>
              <Heading size="sm">Other Help Documents</Heading>
            </Box>
            <List as="nav">
              {allArticles.data?.map((page) => (
                <ListItem key={page.id} fontSize="sm">
                  <NextLink passHref href={page.slug}>
                    <Link>{page.title}</Link>
                  </NextLink>
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>
      </Container>
    </>
  );
};

// const InternalLink = (props: any) => {
//   return (
//     <>
//       {' '}
//       <a href={props.href} target="_blank">
//         <Button justifyContent="flex-start" colorScheme="blue" variant="link">
//           <Box mr={1}>{props.children}</Box>
//           <FaExternalLinkAlt />
//         </Button>
//       </a>
//     </>
//   );
// };

// function flatten(text, child) {
//   return typeof child === 'string'
//     ? text + child
//     : React.Children.toArray(child.props.children).reduce(flatten, text);
// }

// function HeadingRenderer(props) {
//   var children = React.Children.toArray(props.children);
//   var text = children.reduce(flatten, '');
//   var slug = text.toLowerCase().replace(/\W/g, '-');
//   return React.createElement('h' + props.level, { id: slug }, props.children);
// }

export default DocsContentPage;
