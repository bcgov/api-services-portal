import ReactMarkdownWithHtml from 'react-markdown/with-html';
import styles from '../../pages/docs/docs.module.css'
import gfm from 'remark-gfm';
import { Box, Container, Text } from '@chakra-ui/react';
import PageHeader from '@/components/page-header';

interface FooterPageProps {
  pageHeader: string;
  updateDate: string;
  content: string;
}

const FooterPage: React.FC<FooterPageProps> = (props) => {
  return (
    <>
      <Container maxW="6xl">
        <PageHeader title={props.pageHeader}>
          <Text color="bc-component" d="inline">
            {`Updated ${props.updateDate}`}
          </Text>
        </PageHeader>

        <Box mt={4} mb={9} className={styles['markdown-body']}>
          <ReactMarkdownWithHtml plugins={[gfm]}>
            {props.content}
          </ReactMarkdownWithHtml>
        </Box>
      </Container>
    </>
  );
};

export default FooterPage;
