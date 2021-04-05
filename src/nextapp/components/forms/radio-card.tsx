import * as React from 'react';
import { Box, Icon, useRadio, UseRadioProps } from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';
import { IconType } from 'react-icons/lib';

interface RadioCardProps extends UseRadioProps {
  icon?: IconType;
}

const RadioCard: React.FC<RadioCardProps> = ({
  icon = FaCheckCircle,
  ...props
}) => {
  const { getInputProps, getCheckboxProps } = useRadio(props);
  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        color="gray.600"
        borderWidth="2px"
        borderRadius="md"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        _checked={{
          borderColor: 'bc-blue-alt',
          color: 'bc-blue-alt',
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
        <Icon
          as={icon}
          mr={4}
          className="radio-card-icon"
          color="currentColor"
          boxSize="5"
        />
        <Box>{props.children}</Box>
      </Box>
    </Box>
  );
};

export default RadioCard;
