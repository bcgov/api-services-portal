import { Skeleton, Stack } from '@chakra-ui/react';
import * as React from 'react';

const AccessRequestFormLoading: React.FC = () => {
  return (
    <Stack spacing={4}>
      <Skeleton height="200px" />
      <Skeleton height="200px" />
      <Skeleton height="200px" />
    </Stack>
  );
};

export default AccessRequestFormLoading;
