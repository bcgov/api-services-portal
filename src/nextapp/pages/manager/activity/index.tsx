import * as React from 'react';
import {
  Avatar,
  Box,
  Container,
  Flex,
  Heading,
  Select,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Text,
  VStack,
} from '@chakra-ui/react';
import format from 'date-fns/format';
import groupBy from 'lodash/groupBy';
import Head from 'next/head';
import PageHeader from '@/components/page-header';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';
import { uid } from 'react-uid';
import template from 'lodash/template';
import Filters, { useFilters } from '@/components/filters';
import { ActivitySummary } from '@/shared/types/query.types';

interface ActivitySortDate extends ActivitySummary {
  sortDate: string;
}

interface FilterState {
  users: Record<string, string>[];
  serviceAccounts: Record<string, string>[];
  activityDate: Record<string, string>[];
}

const ActivityPage: React.FC = () => {
  const breadcrumbs = useNamespaceBreadcrumbs([
    {
      text: 'Activity',
    },
  ]);
  const {
    state,
    addFilter,
    clearFilters,
    removeFilter,
  } = useFilters<FilterState>(
    {
      users: [],
      serviceAccounts: [],
      activityDate: [],
    },
    'activity'
  );
  const { data, isLoading, isSuccess } = useApi(
    'activityFeed',
    { query, variables: { first: 50, skip: 0 } },
    {
      suspense: false,
    }
  );

  const feed: Record<string, ActivitySortDate[]> = React.useMemo(() => {
    let result = {};
    if (isSuccess) {
      result = data.getFilteredNamespaceActivity.map((a) => ({
        ...a,
        sortDate: format(new Date(a.activityAt), 'LL-d-yy'),
      }));
      return groupBy(result, 'sortDate');
    }
    return result;
  }, [data, isSuccess]);

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
          {isLoading &&
            [1, 2, 3, 4, 5].map((n) => (
              <Flex key={uid(n)} align="center" mb={5} width="100%">
                <SkeletonCircle mr={5} />
                <VStack align="stretch" flex={1}>
                  <Skeleton height="20px" width="75%" />
                  <Skeleton height="20px" width="150px" />
                </VStack>
              </Flex>
            ))}
          {Object.keys(feed).map((date) => {
            return (
              <Box key={uid(date)}>
                <Heading size="sm" mb={5}>
                  {format(new Date(date), 'MMMM do, yyyy')}
                </Heading>
                {feed[date].map((a) => {
                  const compiled = template(a.message, {
                    interpolate: /{([\s\S]+?)}/g,
                  });
                  return (
                    <Flex key={uid(a.id)} pb={5} align="center">
                      <Avatar name={a.params?.actor} size="sm" mr={5} />
                      <Box>
                        <Text>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: compiled(a.params),
                            }}
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
