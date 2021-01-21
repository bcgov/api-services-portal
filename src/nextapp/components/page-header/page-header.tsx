import * as React from 'react';
import { Box, Container, Heading } from '@chakra-ui/react';

interface PageHeaderProps {
  children: React.ReactNode;
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ children, title }) => {
  return (
    <Box bg="bc-gray" py={4}>
      <Box as="header">
        <Heading as="h1" size="lg" mb={4}>
          {title}
        </Heading>
      </Box>
      <Box>{children}</Box>
    </Box>
  );
};

export default PageHeader;
