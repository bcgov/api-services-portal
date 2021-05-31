import * as React from 'react';
import { Box, Flex } from '@chakra-ui/react';

interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <Flex
      bg="white"
      borderRadius={4}
      border="2px solid"
      borderColor="gray.400"
      flexDirection="column"
      position="relative"
      overflow="hidden"
      height="100%"
    >
      {children}
    </Flex>
  );
};

export default Card;
