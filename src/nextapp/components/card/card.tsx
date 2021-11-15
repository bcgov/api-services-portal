import * as React from 'react';
import {
  Box,
  BoxProps,
  Flex,
  Heading,
  HStack,
  useStyleConfig,
} from '@chakra-ui/react';

interface CardProps extends BoxProps {
  actions?: React.ReactNode;
  children: React.ReactNode;
  heading?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  actions,
  children,
  heading,
  ...props
}) => {
  const styles = useStyleConfig('Box');

  return (
    <Box bgColor="white" sx={styles} {...props}>
      {heading && (
        <Flex
          px={9}
          pt={9}
          pb={9}
          alignItems="center"
          justifyContent="space-between"
          borderBottom="2px solid"
          borderColor="bc-yellow"
        >
          <Heading size="sm">{heading}</Heading>
          {actions && <HStack spacing={4}>{actions}</HStack>}
        </Flex>
      )}
      {children}
    </Box>
  );
};

export default Card;
