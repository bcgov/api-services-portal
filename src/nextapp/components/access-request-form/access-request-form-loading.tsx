import { Skeleton, Stack } from '@chakra-ui/react';
import * as React from 'react';

const AccessRequestFormLoading: React.FC = () => {
  return (
    <Stack spacing={4}>
      <Skeleton height="170px" />
      <Skeleton height="170px" />
    </Stack>
  );
};

export default AccessRequestFormLoading;
