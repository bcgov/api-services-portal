import Head from 'next/head';
import ReactMarkdownWithHtml from 'react-markdown/with-html';
// import { DocHeader, InternalLink } from '@/components/docs';
import styles from '../../pages/docs/docs.module.css'
import gfm from 'remark-gfm';
import { Box, Container, Text } from '@chakra-ui/react';
import PageHeader from '@/components/page-header';

interface FooterPageProps {
  title: string;
  header: string;
  updateDate: string;
  body: string;
}

const FooterPage: React.FC<FooterPageProps> = (props) => {
  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title={props.header}>
          <Text color="bc-component" d="inline">
            {`Updated ${props.updateDate}`}
          </Text>
        </PageHeader>

        <Box className={styles['markdown-body']}>
          <ReactMarkdownWithHtml plugins={[gfm]}>
            {props.body}
          </ReactMarkdownWithHtml>
        </Box>
      </Container>
    </>
  );
};

export default FooterPage;
