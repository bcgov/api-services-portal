import * as React from 'react';
import { Box } from '@chakra-ui/react';

interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <Box
      d="flex"
      bg="white"
      border="1px"
      borderColor="gray.200"
      boxShadow="base"
      borderRadius="4px"
    >
      <Box m="4">{children}</Box>
    </Box>
  );
};

export default Card;
