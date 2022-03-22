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
  children: JSX.Element | JSX.Element[];
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
          as="header"
          p={9}
          alignItems="center"
          justifyContent="space-between"
          sx={{
            '& + :not(table)': {
              borderTop: '2px solid',
              borderColor: 'bc-yellow',
            },
            '& + table': {
              position: 'relative',
              mt: -5,
            },
          }}
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
