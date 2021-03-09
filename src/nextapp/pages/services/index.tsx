import * as React from 'react';
import {
  Box,
  Container,
  Divider,
  Heading,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Skeleton,
} from '@chakra-ui/react';
import ClientRequest from '@/components/client-request';
import PageHeader from '@/components/page-header';
import ServicesList from '@/components/services-list';
import { useAuth /*, withAuth*/ } from '@/shared/services/auth';
import SearchInput from '@/components/search-input';
import { FaCaretSquareUp, FaFilter } from 'react-icons/fa';
import ServicesFilters from '@/components/services-list/services-filters';

// export const getServerSideProps = withAuth(async (context) => {
//   const { user } = context;

//   if (!user) {
//     return {
//       redirect: {
//         destination: '/unauthorized',
//         permanent: false,
//       },
//     };
//   }

//   return {
//     props: {},
//   };
// });

const ServicesPage: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = React.useState<string>('');
  const [showFilters, setShowFilters] = React.useState<boolean>(false);
  const onFilterClick = () => {
    setShowFilters((state) => !state);
  };

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
        <Box
          as="header"
          my={4}
          d="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Heading as="h3" size="md">
            5 Day Metrics
          </Heading>
          <HStack>
            <SearchInput
              onChange={setSearch}
              placeholder="Search Gateway Services"
              value={search}
            />
            <IconButton
              aria-label="Show Filters"
              icon={<Icon as={showFilters ? FaCaretSquareUp : FaFilter} />}
              variant="primary"
              onClick={onFilterClick}
            />
          </HStack>
        </Box>
        {showFilters && <ServicesFilters />}
        {user && (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={8}>
            <ClientRequest
              fallback={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((d) => (
                <Skeleton key={d} height="200px" />
              ))}
            >
              <ServicesList search={search} />
            </ClientRequest>
          </SimpleGrid>
        )}
      </Box>
    </Container>
  );
};

export default ServicesPage;
