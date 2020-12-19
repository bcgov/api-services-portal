import * as React from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

import gh from '../../shared/services/github';

const DocsPage = ({ text, json }) => {
  return (
    <>
      <Head>
        <title>API Program Services | Documentation</title>
      </Head>
      <div style={{ overflow: 'hidden' }}>
        <ReactMarkdown plugins={[gfm]}>{text}</ReactMarkdown>
      </div>
    </>
  );
};

export async function getStaticProps(context) {
  const json = await gh(`{
  repository(name: "gwa-api", owner: "bcgov") {
    object(expression: "master:USER-JOURNEY.md") {
      ...on Blob {
        text
      }
    }
  }
}`);

  return {
    props: {
      text: json.data.repository.object.text,
    },
  };
}

export default DocsPage;
