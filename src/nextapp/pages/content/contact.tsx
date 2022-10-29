import {
  Icon,
  UnorderedList,
  ListItem,
  Link,
  Container,
} from '@chakra-ui/react';
import { BiLinkExternal } from 'react-icons/bi';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { useGlobal } from '@/shared/services/global';

const ContactPage: React.FC = () => {
  const data = useGlobal();

  return (
    <>
      <Head>
        <title>Contact Us</title>
      </Head>

      <Container maxW="6xl">
        <PageHeader title="Contact Us" />
        <UnorderedList
          spacing={8}
          sx={{
            '& a': {
              textDecor: 'underline',
              color: 'bc-link',
              _hover: {
                textDecor: 'none',
              },
            },
          }}
        >
          <ListItem>
            <Link
              href={data?.helpLinks.helpDeskUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Submit product and service requests using the Data Systems and
              Services request system
              <Icon as={BiLinkExternal} boxSize="4" ml={2} />
            </Link>
          </ListItem>
          <ListItem>
            <Link
              href={data?.helpLinks.helpChatUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat with us in Rocket Chat
              <Icon as={BiLinkExternal} boxSize="4" ml={2} />
            </Link>
          </ListItem>
          <ListItem>
            <Link
              href={data?.helpLinks.helpIssueUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Create an issue in Github
              <Icon as={BiLinkExternal} boxSize="4" ml={2} />
            </Link>
          </ListItem>
        </UnorderedList>
      </Container>
    </>
  );
};

export default ContactPage;
