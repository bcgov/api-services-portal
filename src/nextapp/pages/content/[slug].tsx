import { Box, Container } from '@chakra-ui/react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import fs from 'fs/promises';
import { join } from 'path';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import styles from './content.module.css';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.query;
  const contentDirectory = join(process.cwd(), 'nextapp', '_content');
  
  try {
    const content = await fs.readFile(join(contentDirectory, `${slug}.md`), 'utf8');
    
    return {
      props: {
        content,
      }
    };
  } catch (err) {
    context.res.writeHead(404, { location: '/404' }).end();
  }
};

const ContentPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ content }) => {

  return (
    <>
      <Head>
        <title>API Program Services | Content</title>
      </Head>
      <Container maxW="6xl">
        <Box my={8} className={styles.content}>
          <ReactMarkdown children={content} />
        </Box>
      </Container>
    </>
  );
};

export default ContentPage;
