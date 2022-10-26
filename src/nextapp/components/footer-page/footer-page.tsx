import ReactMarkdownWithHtml from 'react-markdown/with-html';
import styles from '../../pages/docs/docs.module.css';
import gfm from 'remark-gfm';
import { Box, Container } from '@chakra-ui/react';
import PageHeader from '@/components/page-header';

interface FooterPageProps {
  pageHeader?: string;
  content: string;
}

const FooterPage: React.FC<FooterPageProps> = (props) => {
  return (
    <>
      <Container maxW="6xl">
        {props.pageHeader && <PageHeader title={props.pageHeader} />}
        <Box className={styles['markdown-body']}>
          <ReactMarkdownWithHtml plugins={[gfm]}>
            {props.content}
          </ReactMarkdownWithHtml>
        </Box>
      </Container>
    </>
  );
};

export default FooterPage;
