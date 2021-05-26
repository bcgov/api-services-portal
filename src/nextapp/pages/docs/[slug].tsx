import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import ReactMarkdownWithHtml from 'react-markdown/with-html';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import gfm from 'remark-gfm';
import { gql } from 'graphql-request';
import api from '@/shared/services/api';
import gh from '@/shared/services/github';
import { Button, Box, Text, Flex } from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';
const { useEffect, useState } = React;
import { Query } from '@/shared/types/query.types';
import { restApi } from '@/shared/services/api';
import styles from './docs.module.css';

interface DocsContentPageProps {}

export const getServerSideProps: GetServerSideProps = async ({
  params: { slug },
}) => {
  return {
    props: {
      slug,
    },
  };
};

const DocsContentPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ slug }) => {
  const [content, setContent] = useState<Query['Content']>();
  const [pages, setPages] = useState<Query['allContents']>();
  useEffect(() => {
    restApi(`/ds/api/documentation/${slug}`).then((data) => {
      setContent(data as Query['Content']);
    });
  }, [slug]);
  useEffect(() => {
    restApi('/ds/api/documentation').then((data) => {
      setPages(data as Query['allContents']);
    });
  }, []);

  const renderers = {
    link: InternalLink,
    heading: HeadingRenderer,
  };
  return (
    <>
      <Head>
        <title>API Program Services | Documentation</title>
      </Head>
      <div className="grid grid-cols-12">
        <aside className={`${styles.sidebar} col-span-2 hidden md:block`}>
          <nav className={styles.nav}>
            {pages?.map((page: any) => (
              <li key={page.id}>
                <Link href={page.slug}>{page.title}</Link>
              </li>
            ))}
          </nav>
        </aside>
        <div className="col-span-12 sm:col-span-10 bg-white">
          <div className="container sm:mr-auto sm:max-w-3xl py-6 px-6">
            <article className={styles['markdown-body']}>
              <nav className="mb-3 flex list-none text-gray-500 text-sm">
                <li>
                  <Link href="/docs">
                    <a>Docs</a>
                  </Link>
                </li>
                <li className="mx-2 text-gray-400">/</li>
                <li>{content?.title}</li>
              </nav>
              {content?.publishDate && (
                <Text className="text-sm text-gray-500">
                  published{' '}
                  {`${formatDistanceToNow(new Date(content.publishDate))} ago`}
                </Text>
              )}
              <ReactMarkdownWithHtml renderers={renderers} plugins={[gfm]}>
                {content?.content}
              </ReactMarkdownWithHtml>
            </article>
          </div>
        </div>
      </div>
    </>
  );
};

// export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
//   const nav: { allDiscoverableContents: any[] } = await api(navigationQuery, null, {
//         headers: req.headers as HeadersInit,
//   });
//   const pages: { allDiscoverableContents: any[] } = await api(documentQuery, {slug: params.slug}, {
//     headers: req.headers as HeadersInit,
//   });
//   const page = pages.allDiscoverableContents?.find((page) => page.slug === params.slug);

//   if (page == null) {
//       return {
//           props: {
//               pages: []
//           }
//       }
//   }
//   return {
//     props: {
//       content: page?.content,
//       pages: nav.allDiscoverableContents,
//       title: page?.title,
//     }
//   };
// };

const InternalLink = (props: any) => {
  return (
    <a href={props.href}>
      <Button justifyContent="flex-start" colorScheme="blue" variant="link">
        <Box mr={1}>{props.children}</Box>
        <FaExternalLinkAlt />
      </Button>
    </a>
  );
};

function flatten(text, child) {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text);
}

function HeadingRenderer(props) {
  var children = React.Children.toArray(props.children);
  var text = children.reduce(flatten, '');
  var slug = text.toLowerCase().replace(/\W/g, '-');
  return React.createElement('h' + props.level, { id: slug }, props.children);
}

export default DocsContentPage;
