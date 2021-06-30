import * as React from 'react';
import { Box, SkeletonText } from '@chakra-ui/react';

const BusinessProfileLoading: React.FC = () => {
  return (
    <Box p={0}>
      <SkeletonText noOfLines={1} spacing={2} skeletonHeight="4" />
      <SkeletonText noOfLines={8} spacing={2} skeletonHeight="2" />
    </Box>
  );
};

export default BusinessProfileLoading;
