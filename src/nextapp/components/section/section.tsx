import * as React from 'react';
import { Box, Heading, Divider } from '@chakra-ui/react';

interface SectionProps {
  actions?: React.ReactNode;
  children?: React.ReactNode;
  title: string;
}

const Section: React.FC<SectionProps> = ({ actions, children, title }) => {
  return (
    <Box bgColor="white" mb={4}>
      <Box
        p={4}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Heading size="md">{title}</Heading>
        {actions && <Box>{actions}</Box>}
      </Box>
      <Divider />
      {children}
    </Box>
  );
};

export default Section;
