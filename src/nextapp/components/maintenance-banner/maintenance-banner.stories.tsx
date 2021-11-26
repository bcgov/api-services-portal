import * as React from 'react';
import { Box } from '@chakra-ui/react';

import MaintenanceBanner from './maintenance-banner';

export default {
  title: 'APS/MaintenanceBanner',
};

export const Default = () => <MaintenanceBanner />;
export const WithSiblingElements = () => (
  <Box pos="relative">
    <MaintenanceBanner />
    <Box
      as="header"
      pos="fixed"
      height="65px"
      d="flex"
      alignItems="center"
      pl={8}
      bg="bc-blue"
      color="white"
      left="0"
      width="100%"
    >
      Header is automtically positioned relative to the banner
    </Box>
    <Box
      as="nav"
      pos="fixed"
      height="50px"
      d="flex"
      alignItems="center"
      pl={8}
      bg="bc-blue-alt"
      color="white"
      left="0"
      width="100%"
    >
      Nav is automtically positioned relative to the banner
    </Box>
    <Box as="main" mt="165px" pl={8}>
      Main is automtically positioned relative to the banner
    </Box>
  </Box>
);
