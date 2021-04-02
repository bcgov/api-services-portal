import * as React from 'react';
import { Box, Icon, useRadio } from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';

const RadioCard: React.FC<any> = (props) => {
  const { getInputProps, getCheckboxProps } = useRadio(props);
  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="2px"
        borderRadius="md"
        borderColor="gray.200"
        _checked={{
          bg: 'teal.600',
          color: 'white',
          borderColor: 'teal.600',
        }}
        _hover={{
          borderColor: 'gray.400',
        }}
        _focus={{
          borderColor: 'bc-blue',
        }}
        px={5}
        py={3}
      >
        <Icon as={FaCheckCircle} mr={2} />
        {props.children}
      </Box>
    </Box>
  );
};

export default RadioCard;
