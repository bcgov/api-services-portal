import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { gql } from 'graphql-request';
import { useRouter } from 'next/router';

import api from '../shared/services/api';
import Card from '../components/card';
import gh from '../shared/services/github';

import styles from './docs/docs.module.css';

const DocsPage = ({ pages }) => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>API Program Services | Documentation</title>
      </Head>
      <div className="container mx-auto pt-4 px-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pages.map((d) => (
            <Card key={d.id}>
              <h3 className="text-base">
                <Link href={`/docs/${d.slug}`}>{d.title}</Link>
              </h3>
              <p>{d.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
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
}

export default DocsPage;
