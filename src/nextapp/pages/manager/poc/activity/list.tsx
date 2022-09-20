import * as React from 'react';

import ActivityList from '@/components/activity-list';
import { Box, Code, VStack } from '@chakra-ui/react';
import { ActivitySummary } from '@/shared/types/query.types';

const { useEffect, useState } = React;

function format(
  stringWithPlaceholders: string,
  replacements: { [key: string]: string }
) {
  return stringWithPlaceholders.replace(
    /{(\w+)}/g,
    (placeholderWithDelimiters, placeholderWithoutDelimiters) =>
      replacements.hasOwnProperty(placeholderWithoutDelimiters)
        ? replacements[placeholderWithoutDelimiters]
        : placeholderWithDelimiters
  );
}

function List({ data, state, refetch }) {
  const [{ cred, reqId }, setCred] = useState({ cred: '', reqId: null });

  switch (state) {
    case 'loading': {
      return <p>Loading...</p>;
    }
    case 'error': {
      return <p>Error!</p>;
    }
    case 'loaded': {
      if (!data) {
        return <p>Ooops, something went wrong!</p>;
      }
      return (
        <VStack align="stretch" p={5}>
          {data.getFilteredNamespaceActivity.map((a: ActivitySummary) => (
            <Box border="1px" borderColor="gray.200" p={10}>
              {a.activityAt} : <strong>{format(a.message, a.params)}</strong>
              <hr />
              <Code p={2}>{a.message}</Code>
              <br />
              <Code p={2}>{JSON.stringify(a.params, null, 2)}</Code>
            </Box>
          ))}
        </VStack>
      );
      // return <ActivityList data={data.getFilteredNamespaceActivity} />;
    }
  }
  return <></>;
}

export default List;
