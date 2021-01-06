import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { gql } from 'graphql-request';
import { useRouter } from 'next/router';

import api from '../shared/services/api';
import gh from '../shared/services/github';

import styles from './docs/docs.module.css';

const DocsPage = ({ pages }) => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>API Program Services | Documentation</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.markdownBody}>
            {pages.map((d) => (
              <li key={d.id}>
                <Link href={`/docs/${d.slug}`}>{d.title}</Link>
              </li>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticProps(context) {
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
    props: {
      pages: pages.allContents,
    },
  };
}

export default DocsPage;
