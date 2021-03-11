import * as React from 'react';
import { Box, Container, Divider, Text } from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import PageHeader from '@/components/page-header';
import ServicesList from '@/components/services-list';
import { useAuth /*, withAuth*/ } from '@/shared/services/auth';
import SearchInput from '@/components/search-input';
import { FaCaretSquareUp, FaFilter } from 'react-icons/fa';
import ServicesFilters from '@/components/services-list/services-filters';

const AccessRequestsPage: React.FC = () => {
  return (
    <Container maxW="6xl">
      <PageHeader title="Access Requests">
        <Text>
          List of pending access requests to services that you provide. Access
          requests can be initiated by an API Owner, or they can be requested by
          a Developer.
        </Text>
      </PageHeader>
      <Divider my={4} />
      <Box d="flex" flexDir="column">
        Access
      </Box>
    </Container>
  );
};

export default AccessRequestsPage;
