import * as React from 'react';
import {
  Box,
  Container,
  Divider,
  Heading,
  SimpleGrid,
  Skeleton,
} from '@chakra-ui/react';
import { ErrorBoundary } from 'react-error-boundary';

import AppError from '../../../components/app-error';
import PageHeader from '../../../components/page-header';
import ServicesList from '../../../components/services-list';
import { withAuth } from 'shared/services/auth';

const ServicesPage: React.FC = () => {
  const isServer = typeof window === 'undefined';

  return (
    <Container maxW="6xl">
      <PageHeader title="Services">
        <p>
          List of services from the API Owner perspective. This should pull in
          details from Prometheus and gwa-api Status.
        </p>
      </PageHeader>
      <Divider my={4} />
      <Box d="flex" flexDir="column">
        <Box as="header" my={4}>
          <Heading as="h3" size="base">
            Gateway Services
          </Heading>
        </Box>
        {!isServer && (
          <ErrorBoundary fallback={<AppError />}>
            <SimpleGrid columns={{ base: 1, sm: 3, md: 4 }} spacing={4}>
              <React.Suspense
                fallback={[1, 2, 3, 4, 5, 6, 7, 8].map((d) => (
                  <Skeleton key={d} height="200px" />
                ))}
              >
                <ServicesList />
              </React.Suspense>
            </SimpleGrid>
          </ErrorBoundary>
        )}
      </Box>
    </Container>
  );
};

export default ServicesPage;

//export const getServerSideProps = withAuth;
