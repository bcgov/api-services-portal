import * as React from 'react';
import { Box, Container, Alert, AlertIcon, AlertTitle, AlertDescription, Text } from '@chakra-ui/react';
import Head from 'next/head';
import { useAuth } from '@/shared/services/auth';

const RedirectPage: React.FC = () => {
  const sources = {
      "kq": {
          title: "KQ Key Requester",
          description: "To get a key to an API, go to the Directory and request access."
      },
      "argg": {
          title: "API Registration Generator",
          description: "To register an API so that it is discoverable, find the 'Gateway Administration API' in the Directory and Request access to get started."
      }
  }
  return (
    <>
      <Head>
        <title>API Services Portal | Redirect</title>
      </Head>
      <Container maxW="6xl" fontSize="lg" m={5}>
        
        <Alert
            status="warning" 
            p={4}
            >
            <AlertIcon boxSize="50px"/>
            <Box flex="1">
                    <AlertTitle>
                        This page has moved!
                    </AlertTitle>
                    <AlertDescription>
                        KQ has been replaced with the API Services Portal.  To do...
                    </AlertDescription>
            </Box>
        </Alert>
      </Container>
    </>
  );
};

export default RedirectPage;
