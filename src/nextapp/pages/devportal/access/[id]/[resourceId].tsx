import * as React from 'react';
import { Box, Container, Divider, Heading, Text } from '@chakra-ui/react';
import EmptyPane from '@/components/empty-pane';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import ShareResourceDialog from '@/components/resources-manager/add-user';
import ResourcesManager from '@/components/resources-manager';
import ResourcesList from '@/components/resources-list';
import ClientRequest from '@/components/client-request';
import { useRouter } from 'next/router';

const ApiAccessResourcePage: React.FC = () => {
  const router = useRouter();
  const { resourceId } = router?.query;

  return (
    <>
      <Head>
        <title>{`API Program Services | API Access | ${resourceId}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={<ResourcesManager id={resourceId as string} />}
          breadcrumb={[
            { href: '/devportal/access', text: 'API Access' },
            { text: 'Environment' },
            { text: 'Resources' },
          ]}
          title="Resources"
        />
        <Box bgColor="white" my={4}>
          <Box
            p={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading size="md">Users with Access</Heading>
            <ShareResourceDialog />
          </Box>
          <Divider />
          {!resourceId && (
            <EmptyPane
              message="This Service Access Request contains no resources"
              title="No Resources"
            />
          )}
          {resourceId && (
            <ClientRequest fallback={<Text>Loading...</Text>}>
              <ResourcesList resourceId={resourceId as string} />
            </ClientRequest>
          )}
        </Box>
      </Container>
    </>
  );
};

export default ApiAccessResourcePage;
