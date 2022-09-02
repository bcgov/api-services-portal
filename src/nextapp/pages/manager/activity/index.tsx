import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Skeleton,
  SkeletonCircle,
  Text,
  VStack,
} from '@chakra-ui/react';
import format from 'date-fns/format';
import groupBy from 'lodash/groupBy';
import Head from 'next/head';
import last from 'lodash/last';
import PageHeader from '@/components/page-header';
import { useNamespaceBreadcrumbs } from '@/shared/hooks';
import { gql } from 'graphql-request';
import { useApi } from '@/shared/services/api';
import { uid } from 'react-uid';
import template from 'lodash/template';
import Filters, { useFilters } from '@/components/filters';
import { ActivitySummary } from '@/shared/types/query.types';
import ActivityFilters from '@/components/activity-filters';

interface PageState {
  first: number;
  skip: number;
}
interface ActivitySortDate extends ActivitySummary {
  sortDate: string;
}

interface FilterState {
  users: Record<string, string>[];
  serviceAccounts: Record<string, string>[];
  activityDate: Record<string, string>[];
}

const PER_PAGE = 50;

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
  const [{ first, skip }, setPage] = React.useState<PageState>({
    first: 0,
    skip: PER_PAGE,
  });
  const { data, isLoading, isSuccess } = useApi(
    ['activityFeed', filterKey, first, skip],
    { query, variables: { filter, first, skip } },
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

  const handlePreviousPageClick = () => {
    setPage((state) => ({
      ...state,
      first: Math.max(0, state.first - PER_PAGE),
      skip: Math.max(0, state.skip - PER_PAGE),
    }));
  };
  const handleNextPageClick = () => {
    setPage((state) => ({
      ...state,
      first: state.first + PER_PAGE,
      skip: state.skip + PER_PAGE,
    }));
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
        <Flex mt={4} justify="space-between" data-testid="activity-pagination">
          <Button
            isDisabled={first === 0 || isLoading}
            variant="secondary"
            onClick={handlePreviousPageClick}
          >
            Previous Page
          </Button>
          <Button
            disabled={
              data?.getFilteredNamespaceActivity.length < PER_PAGE || isLoading
            }
            variant="secondary"
            onClick={handleNextPageClick}
          >
            Next Page
          </Button>
        </Flex>
      </Container>
    </>
  );
};

export default ActivityPage;

const filterTypeOptions = [
  { name: 'User', value: 'users' },
  { name: 'Service Account', value: 'serviceAccounts' },
  { name: 'Date', value: 'activityDate' },
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
