import * as React from 'react';
import { Box, SkeletonText } from '@chakra-ui/react';

const ResourcesListLoading: React.FC = () => {
  return (
    <Box p={4}>
      <SkeletonText noOfLines={8} spacing={4} skeletonHeight="5" />
    </Box>
  );
};

export default ResourcesListLoading;
