import * as React from 'react';
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  Icon,
  Skeleton,
  SkeletonCircle,
  Text,
  VStack,
} from '@chakra-ui/react';
import groupBy from 'lodash/groupBy';
import Head from 'next/head';
import last from 'lodash/last';
import PageHeader from '@/components/page-header';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import { gql } from 'graphql-request';
import { useInfiniteApi } from '@/shared/services/api';
import { uid } from 'react-uid';
import Filters, { useFilters } from '@/components/filters';
import { ActivitySummary } from '@/shared/types/query.types';
import ActivityFilters from '@/components/activity-filters';
import { FaTimesCircle } from 'react-icons/fa';
import EmptyPane from '@/components/empty-pane';
import ActivityItem from '@/components/activity-item';

const timeZone = 'America/Vancouver';

const sortFormat = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'short',
  timeZone,
});
const headerFormat = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'long',
  timeZone,
});

interface ActivitySortDate extends ActivitySummary {
  sortDate: string;
}

interface FilterState {
  users: Record<string, string>[];
  consumers: Record<string, string>[];
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
      consumers: [],
      serviceAccounts: [],
      activityDate: [],
    },
    'activity'
  );
  const filterKey = React.useMemo(() => JSON.stringify(state), [state]);
  const filter = React.useMemo(() => {
    const result = {};
    Object.keys(state).forEach((k) => {
      if (k === 'activityDate') {
        const lastActivity = last(state.activityDate);
        if (lastActivity) {
          result[k] = lastActivity.value;
        }
      } else {
        if (Array.isArray(state[k])) {
          result[k] = state[k].map((v: { value: string }) => v.value);
        } else {
          result[k] = state[k];
        }
      }
    });
    return result;
  }, [state]);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isLoading,
    isSuccess,
    isFetchingNextPage,
  } = useInfiniteApi(
    ['activityFeed', filterKey],
    { query, variables: { filter } },
    {
      suspense: false,
    }
  );

  const feed: Record<string, ActivitySortDate[]> = React.useMemo(() => {
    let result = {};
    if (isSuccess) {
      result = data.pages
        .reduce((memo, page) => {
          return memo.concat(page.getFilteredNamespaceActivity);
        }, [])
        .filter((a) => a.activityAt)
        .map((a) => {
          const sortDate = new Date(a.activityAt);
          return { ...a, sortDate: sortFormat.format(sortDate) };
        });
      return groupBy(result, 'sortDate');
    }
    return result;
  }, [data, isSuccess]);

  const handleParamSelect = (key: string, value: string) => {
    addFilter(key, { value: value, name: value, multiple: true });
  };

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
            <ActivityFilters />
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
          {isSuccess &&
            data.pages[0]?.getFilteredNamespaceActivity.length === 0 && (
              <EmptyPane
                title="No activity to show"
                message="Events will show up here as you manage your gateway"
              />
            )}
          {isError && (
            <Center>
              <Flex
                my={7}
                border="1px solid"
                borderColor="bc-error"
                borderRadius={4}
                backgroundColor="#D8292F1A"
                py={2}
                px={4}
                align="center"
                data-testid="activity-feed-error"
                role="alert"
              >
                <Icon as={FaTimesCircle} color="bc-error" mr={2} />
                <Text>
                  There was an error loading your gateway&apos;s activity
                </Text>
              </Flex>
            </Center>
          )}
          {Object.keys(feed).map((date) => {
            return (
              <Box key={uid(date)}>
                <Heading
                  size="sm"
                  mb={5}
                  data-testid={`activity-feed-heading-${date}`}
                >
                  {headerFormat.format(new Date(date.replaceAll('-', '/')))}
                </Heading>
                {feed[date].map((a) => (
                  <ActivityItem
                    key={uid(a.id)}
                    data={a}
                    onSelect={handleParamSelect}
                  />
                ))}
              </Box>
            );
          })}
          {hasNextPage && (
            <Center
              my={4}
              justify="space-between"
              data-testid="activity-pagination"
            >
              <Button
                isLoading={isFetchingNextPage}
                isDisabled={isLoading || isFetchingNextPage}
                variant="secondary"
                onClick={() => fetchNextPage()}
                data-testid="activity-feed-load-more-btn"
              >
                Load More
              </Button>
            </Center>
          )}
        </Box>
      </Container>
    </>
  );
};

export default ActivityPage;

const filterTypeOptions = [
  { name: 'User', value: 'users' },
  { name: 'Consumer', value: 'consumers' },
  { name: 'Service Account', value: 'serviceAccounts' },
  { name: 'Date', value: 'activityDate', multiple: false },
];

const query = gql`
  query GetActivity(
    $first: Int
    $skip: Int
    $filter: ActivityQueryFilterInput
  ) {
    getFilteredNamespaceActivity(first: $first, skip: $skip, filter: $filter) {
      id
      message
      result
      params
      activityAt
      blob
    }
  }
`;
