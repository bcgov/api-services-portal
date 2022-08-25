import * as React from 'react';
import { Avatar, Box, Container, Flex, Select, Text } from '@chakra-ui/react';
import format from 'date-fns/format';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';
import { uid } from 'react-uid';
import template from 'lodash/template';
import Filters, { useFilters } from '@/components/filters';

const ActivityPage: React.FC = () => {
  const breadcrumbs = useNamespaceBreadcrumbs([
    {
      text: 'Activity',
    },
  ]);
  const { state, addFilter, clearFilters, removeFilter } = useFilters<any>(
    {
      users: [],
      serviceAccounts: [],
      date: [],
      first: 50,
      skip: 0,
    },
    'activity'
  );
  const { data } = useApi(
    'activityFeed',
    { query, variables: { first: 50, skip: 0 } },
    {
      suspense: false,
    }
  );

  return (
    <>
      <Head>
        <title>API Program Services | Activity</title>
      </Head>
      <Container maxW="6xl">
        <PageHeader title="Activity" actions={false} breadcrumb={breadcrumbs}>
          <Filters
            data={state}
            filterTypeOptions={filterTypeOptions}
            onAddFilter={addFilter}
            onClearFilters={clearFilters}
            onRemoveFilter={removeFilter}
          >
            <Box>
              <Select isDisabled placeholder="TBD"></Select>
            </Box>
          </Filters>
        </PageHeader>
        <Box bgColor="white" mb={4} p={7} pb={2}>
          {data?.getFilteredNamespaceActivity.map((a) => {
            const compiled = template(a.message, {
              interpolate: /{([\s\S]+?)}/g,
            });
            return (
              <Flex key={uid(a.id)} pb={5} align="center">
                <Avatar name={a.params?.actor} size="sm" mr={5} />
                <Box>
                  <Text>
                    <span
                      dangerouslySetInnerHTML={{ __html: compiled(a.params) }}
                    />
                  </Text>
                  <Text
                    as="time"
                    color="bc-component"
                    fontSize="sm"
                    dateTime={a.activityAt}
                  >
                    {format(new Date(a.activityAt), 'h:mmaaa')}
                  </Text>
                </Box>
              </Flex>
            );
          })}
        </Box>
      </Container>
    </>
  );
};

export default ActivityPage;

const filterTypeOptions = [
  { name: 'User', value: 'products' },
  { name: 'Service Account', value: 'environments' },
  { name: 'Date', value: 'labels' },
];

const query = gql`
  query GetActivity($first: Int, $skip: Int) {
    getFilteredNamespaceActivity(first: $first, skip: $skip) {
      id
      message
      params
      activityAt
      blob {
        id
      }
    }
  }
`;
