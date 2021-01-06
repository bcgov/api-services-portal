import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { gql } from 'graphql-request';

import api from '../../shared/services/api';
import gh from '../../shared/services/github';

import styles from './docs.module.css';

const pagesQuery = gql`
  {
    allContents(where: { isComplete: true }) {
      id
      title
      slug
      content
      readme
    }
  }
`;

const DocsContentPage = ({ pages, content }) => {
  return (
    <>
      <Head>
        <title>API Program Services | Documentation</title>
      </Head>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {pages.map((page: any) => (
              <li key={page.id}>
                <Link href={page.slug}>{page.title}</Link>
              </li>
            ))}
          </nav>
        </aside>
        <div className={styles.content}>
          <div className={styles.markdownBody}>
            <ReactMarkdown plugins={[gfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticPaths() {
  const pagesQuery = gql`
    {
      allContents(where: { isComplete: true }) {
        id
        title
        slug
      }
    }
  `;
  const pages = await api(pagesQuery);

  return {
    paths: pages.allContents.map((page) => ({
      params: {
        slug: page.slug,
      },
    })),
    fallback: false,
  };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const pages = await api(pagesQuery);
  const page = pages.allContents.find((page) => page.slug === params.slug);
  let content = page.content;

  if (page.readme) {
    const repoQuery = gql`
      query README($readme: String!) {
        repository(name: "gwa-api", owner: "bcgov") {
          object(expression: $readme) {
            ... on Blob {
              text
            }
          }
        }
      }
    `;
    const repo = await gh(repoQuery, {
      readme: `master:${page.readme}`,
    });
    content = repo.repository.object.text;
  }

  return {
    props: {
      content,
      pages: pages.allContents,
    },
    revalidate: 1,
  };
};

export default DocsContentPage;
