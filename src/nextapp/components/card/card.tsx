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
  const hasTable = React.Children.toArray(children).some(
    (c: JSX.Element) => c.type?.displayName === 'Table'
  );
  const borderBottom = hasTable ? 'none' : '2px solid';
  const paddingBottom = hasTable ? 4 : 9;

  return (
    <Box bgColor="white" sx={styles} {...props}>
      {heading && (
        <Flex
          px={9}
          pt={9}
          pb={paddingBottom}
          alignItems="center"
          justifyContent="space-between"
          borderBottom={borderBottom}
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
