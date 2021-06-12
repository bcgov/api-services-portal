import * as React from 'react';
import {
  Container,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link,
  VStack,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useAuth } from '@/shared/services/auth';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Box, Center, Heading, Icon } from '@chakra-ui/react';
import { FaExclamationCircle } from 'react-icons/fa';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  return {
    props: {
      id,
    },
  };
};

const RedirectPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const sources = {
    kq: {
      title: 'API Key Request (KQ) End-of-Life',
      description:
        "The KQ application has been demised and replaced with the API Services Portal.  To get a key to an API, go to the <a href='/devportal/api-discovery'>Directory</a> page and request access.",
      moreDetails: '/docs/platform-api-services-portal-released',
    },
    argg: {
      title: 'API Registration Generator (ARGG) End-of-Life',
      description:
        "The ARGG application has been demised and replaced with the API Services Portal.  To register an API so that it is discoverable, find the 'Gateway Administration API' in the Directory and Request access to get started.",
      moreDetails: '/docs/platform-api-services-portal-released',
    },
    'gwa-ui': {
      title: 'API Services Portal V1 (GWA UI) End-of-Life',
      description:
        "The API Services Portal UI has been upgraded!",
      moreDetails: '/docs/platform-api-services-portal-released',
    },
    'api-spec-editor': {
      title: 'API Spec Editor End-of-Life',
      description:
        'The API Spec Editor application has been demised and replaced with an API Swagger Console.',
      moreDetails: '/docs/platform-api-services-portal-released',
    },
    'api-console': {
      title: 'API Console End-of-Life',
      description:
        'The API Console application has been demised and replaced with a Swagger Console.',
      moreDetails: '/docs/platform-api-services-portal-released',
    },
  };
  if (!(id in sources)) {
    return <></>;
  }
  return (
    <>
      <Head>
        <title>API Services Portal | Redirect</title>
      </Head>
      <Container maxW="12xl" fontSize="lg" p={0}>
        <Alert
          variant="subtle"
          status="warning"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          minHeight="300px"
        >
          <AlertIcon boxSize="60px" mr={0} />
          <AlertTitle pb={3} pt={3}>
            {sources[id].title}
          </AlertTitle>
          <AlertDescription
            maxWidth="lg"
            pb={5}
            dangerouslySetInnerHTML={{ __html: sources[id].description }}
          ></AlertDescription>
          {sources[id].moreDetails && (
            <Link
              fontWeight="bold"
              href={sources[id].moreDetails}
            >{`More Details...`}</Link>
          )}
        </Alert>
      </Container>
    </>
  );
};

export default RedirectPage;
