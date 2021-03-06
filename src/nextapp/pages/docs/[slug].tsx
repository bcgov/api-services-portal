import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import ReactMarkdownWithHtml from 'react-markdown/with-html';
import gfm from 'remark-gfm';
import { gql } from 'graphql-request';
import api from '@/shared/services/api';
import gh from '@/shared/services/github';

import styles from './docs.module.css';

const pagesQuery = gql`
  {
    allContents(where: { isComplete: true }) {
      id
      title
      slug
      content
      readme
      githubRepository
    }
  }
`;

interface DocsContentPageProps {
  pages: any[];
  content: any;
  title: string;
}

const DocsContentPage: React.FC<DocsContentPageProps> = ({
  pages,
  content,
  title,
}) => {
  return (
    <>
      <Head>
        <title>API Program Services | Documentation</title>
      </Head>
      <div className="grid grid-cols-12">
        <aside className={`${styles.sidebar} col-span-2 hidden md:block`}>
          <nav className={styles.nav}>
            {pages.map((page: any) => (
              <li key={page.id}>
                <Link href={page.slug}>{page.title}</Link>
              </li>
            ))}
          </nav>
        </aside>
        <div className="col-span-12 sm:col-span-10 bg-white">
          <div className="container sm:mr-auto sm:max-w-3xl py-6 px-6">
            <article className={styles.markdownBody}>
              <nav className="mb-3 flex list-none text-gray-500 text-sm">
                <li>
                  <Link href="/docs">
                    <a>Docs</a>
                  </Link>
                </li>
                <li className="mx-2 text-gray-400">/</li>
                <li>{title}</li>
              </nav>
              <ReactMarkdownWithHtml allowDangerousHtml plugins={[gfm]}>{content}</ReactMarkdownWithHtml>
            </article>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticPaths() {
  try {
    const pagesQuery = gql`
      {
        allContents(where: { isComplete: true }) {
          id
          title
          slug
        }
      }
    `;
    const pages: { allContents: any[] } = await api(pagesQuery);

    return {
      paths: pages.allContents.map((page) => ({
        params: {
          slug: page.slug,
        },
      })),
      fallback: false,
    };
  } catch {
    return {
      paths: [],
      fallback: false,
    };
  }
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const pages: { allContents: any[] } = await api(pagesQuery);
  const page = pages.allContents.find((page) => page.slug === params.slug);
  let content = page.content;

  if (page.readme) {
    const repoQuery = gql`
      query README($readme: String!, $repo: String!, $owner: String!) {
        repository(name: $repo, owner: $owner) {
          object(expression: $readme) {
            ... on Blob {
              text
            }
          }
        }
      }
    `;
    console.log("QUERY = "+JSON.stringify({
        readme: `master:${page.readme}`,
        repo: page.githubRepository ? page.githubRepository.split('/')[1] : "gwa-api",
        owner: page.githubRepository ? page.githubRepository.split('/')[0] : "bcgov",
      }));

    const repo = await gh(repoQuery, {
      readme: `master:${page.readme}`,
      repo: page.githubRepository ? page.githubRepository.split('/')[1] : "gwa-api",
      owner: page.githubRepository ? page.githubRepository.split('/')[0] : "bcgov",
    });
    
    if ('text' in repo.repository.object) {
        content = repo.repository.object.text;
    } else {
        content = "Unable to retrieve content at this time.  Try again later."
    }
  }

  return {
    props: {
      content,
      pages: pages.allContents,
      title: page.title,
    },
    revalidate: 1,
  };
};

export default DocsContentPage;
