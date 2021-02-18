import * as React from 'react';
import { Box, Heading } from '@chakra-ui/react';

interface PageHeaderProps {
  actions?: React.ReactNode;
  children: React.ReactNode;
  title: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  actions,
  children,
  title,
}) => {
  return (
    <Box bg="bc-gray" py={4}>
      <Box
        as="header"
        display="flex"
        flexDirection={{ base: 'column', sm: 'row' }}
        alignItems={{ base: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        mb={4}
      >
        <Heading as="h1" size="lg">
          {title}
        </Heading>
        {actions}
      </Box>
      <Box>{children}</Box>
    </Box>
  );
};

export default PageHeader;
