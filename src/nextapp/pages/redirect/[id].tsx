import * as React from 'react';
import { Box, Container, Alert, AlertIcon, AlertTitle, AlertDescription, Text } from '@chakra-ui/react';
import Head from 'next/head';
import { useAuth } from '@/shared/services/auth';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params;
    return {
      props: {
        id
      },
    }
  }

const RedirectPage: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({id}) => {
  const sources = {
      "kq": {
          title: "Key Requester (KQ) End-of-Life",
          description: "The KQ application has been demised and replaced with the API Services Portal.  To get a key to an API, go to the <a href='/devportal/api-discovery'>Directory</a> page and request access."
      },
      "argg": {
          title: "API Registration Generator (ARGG) End-of-Life",
          description: "The ARGG application has been demised and replaced with the API Services Portal.  To register an API so that it is discoverable, find the 'Gateway Administration API' in the Directory and Request access to get started."
      }
  }
  if (!(id in sources)) {
      return <></>
  }
  return (
    <>
      <Head>
        <title>API Services Portal | Redirect</title>
      </Head>
      <Container maxW="3xl" fontSize="lg" m={5}>
        
        <Alert
            status="warning" 
            p={4}
            >
            <AlertIcon boxSize="50px"/>
            <Box flex="1">
                    <AlertTitle>
                        {sources[id].title}
                    </AlertTitle>
                    <AlertDescription dangerouslySetInnerHTML={{__html:sources[id].description}}>
                    </AlertDescription>
            </Box>
        </Alert>
      </Container>
    </>
  );
};

export default RedirectPage;
