import * as React from 'react';
import { Box, Heading, Icon, useRadio, UseRadioProps } from '@chakra-ui/react';
import { FaRegCircle, FaRegDotCircle } from 'react-icons/fa';

interface RadioCardProps extends UseRadioProps {
  children: React.ReactNode;
  title: string;
}

const RadioCard: React.FC<RadioCardProps> = (props) => {
  const { getInputProps, getCheckboxProps } = useRadio(props);
  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        _hover={{
          borderColor: 'bc-blue',
          boxShadow: 'md',
        }}
        _focus={{
          borderColor: 'bc-blue',
        }}
        px={5}
        py={3}
      >
        <Heading
          size="sm"
          fontWeight="normal"
          mb="3"
          d="flex"
          alignItems="center"
        >
          <Icon
            as={props.isChecked ? FaRegDotCircle : FaRegCircle}
            color="bc-blue"
            mr={3}
          />
          <Box as="hgroup">{props.title}</Box>
        </Heading>
        <Box fontSize="sm">{props.children}</Box>
      </Box>
    </Box>
  );
};

export default RadioCard;
