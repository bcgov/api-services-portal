import * as React from 'react';
import {
  Container,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from '@chakra-ui/react';
import Head from 'next/head';
import NextLink from 'next/link';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Icon } from '@chakra-ui/react';
import { FaArrowCircleRight } from 'react-icons/fa';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const { url } = context.query;
  return {
    props: {
      id,
      url: url ?? '',
    },
  };
};

const RedirectPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, url }) => {
  const sources = {
    kq: {
      title: 'API Key Request (KQ) has moved',
      description:
        "The KQ application has been replaced with the API Services Portal.  To get a key to an API now, go to the <a href='/devportal/api-directory'>Directory</a> page and request access.",
      moreDetails: '/docs/platform-api-services-portal-released',
    },
    argg: {
      title: 'API Registration Generator (ARGG) has moved',
      description:
        "The ARGG application has been replaced with the API Services Portal.  To get started, go to the <a href='/docs/platform-api-owner-user-journey'>API Owner User Journey</a> guide.",
      moreDetails: '/docs/platform-api-services-portal-released',
    },
    'gwa-ui': {
      title: 'API Services Portal has been upgraded',
      description: "Go to the <a href='/'>API Services Portal</a>",
      moreDetails: '/docs/platform-api-services-portal-released',
    },
    oaseditor: {
      title: 'API Spec Editor has moved',
      description: `The API Spec Editor application has been replaced with an API Swagger Console.  <a href='https://openapi.apps.gov.bc.ca/?url=${url}' target='_blank'>Open the API Swagger Console</a>.`,
      moreDetails: '/docs/platform-api-services-portal-released',
    },
  };
  return (
    <>
      <Head>
        <title>API Services Portal | Redirect</title>
      </Head>
      {sources[id] && (
        <Container maxW="12xl" fontSize="lg" p={0}>
          <Alert
            variant="subtle"
            status="info"
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
              <NextLink passHref href={sources[id].moreDetails}>
                <Button
                  as="a"
                  fontWeight="bold"
                  rightIcon={<Icon as={FaArrowCircleRight} />}
                  textDecoration="underline"
                  variant="link"
                  color="bc-link"
                  sx={{
                    _hover: {
                      textDecoration: 'none',
                    },
                  }}
                >{`View the release notes`}</Button>
              </NextLink>
            )}
          </Alert>
        </Container>
      )}
    </>
  );
};

export default RedirectPage;
