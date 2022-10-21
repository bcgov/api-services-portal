import * as React from 'react';
import { Button, Container, Icon, Skeleton, Text } from '@chakra-ui/react';
import Card from '@/components/card';
import ClientRequest from '@/components/client-request';
import { FaExternalLinkSquareAlt } from 'react-icons/fa';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import ServicesList from '@/components/services-list';
import SearchInput from '@/components/search-input';
// import ServicesFilters from '@/components/services-list/services-filters';
import { useAuth } from '@/shared/services/auth';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      metricsUrl: process.env.NEXT_PUBLIC_GRAFANA_URL,
    },
  };
};

const ServicesPage: React.FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ metricsUrl }) => {
  const title = 'Gateway Services';
  const breadcrumb = useNamespaceBreadcrumbs([{ text: title }]);
  const { user } = useAuth();
  const [search, setSearch] = React.useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  return (
    <>
      <Head>
        <title>{`API Program Services | ${title}`}</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader
          actions={
            <Button
              as="a"
              variant="primary"
              href={metricsUrl}
              rightIcon={<Icon as={FaExternalLinkSquareAlt} mt={-1} />}
            >
              View metrics in real-time
            </Button>
          }
          title={title}
          breadcrumb={breadcrumb}
        >
          <Text maxW="65%">
            Gateway Services allow you to access summarized metrics for the
            services that you configure on the Gateway. This pulls in details
            from Prometheus and gwa-api Status.
          </Text>
        </PageHeader>
        <Card
          heading="7 Day Metrics"
          actions={
            <SearchInput
              placeholder="Search for Service"
              value={search}
              onChange={setSearch}
            />
          }
        >
          {user && (
            <ClientRequest
              fallback={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((d) => (
                <Skeleton key={d} height="72px" mb={2} />
              ))}
            >
              <ServicesList search={search} />
            </ClientRequest>
          )}
        </Card>
      </Container>
    </>
  );
};

export default ServicesPage;
