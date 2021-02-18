import * as React from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Container,
  VStack,
  Skeleton,
} from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import PageHeader from '@/components/page-header';
import PackagesList from '@/components/packages-list';
import NewPackage from '@/components/new-package';

const PackagingPage: React.FC = () => {
  const actionElements = <NewPackage />;

  return (
    <Container maxW="6xl">
      <VStack my={4}>
        <Alert status="info">
          <AlertIcon />
          API Owner can define environments and which Services are for which
          environment.
        </Alert>
      </VStack>

      <PageHeader title="Dataset Groups / Packages" actions={actionElements}>
        <p>
          Dataset Groups / Packages are groups of APIs that are protected in the
          same way, and are discoverable by Citizens through the BC Data
          Catalog, or by invitation from an API Manager.
        </p>
      </PageHeader>

      <Box mt={5}>
        <ClientRequest
          fallback={[1, 2, 3, 4, 5, 6, 7, 8].map((d) => (
            <Skeleton key={d} width="100%" height="160px" mb={2} />
          ))}
        >
          <PackagesList />
        </ClientRequest>
      </Box>
    </Container>
  );
};

export default PackagingPage;
