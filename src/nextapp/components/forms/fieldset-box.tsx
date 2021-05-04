import * as React from 'react';
import {
  Box,
  Divider,
  FormControl,
  FormControlProps,
  FormLabel,
} from '@chakra-ui/react';

interface FieldsetBoxProps extends FormControlProps {
  children: React.ReactNode;
  title: string;
}

const FieldsetBox: React.FC<FieldsetBoxProps> = ({
  children,
  title,
  ...props
}) => {
  return (
    <Box mt={5} bgColor="white">
      <FormControl as="fieldset" boxSizing="border-box" {...props}>
        <FormLabel as="legend" fontSize="md" fontWeight="bold" p={4} m={0}>
          {title}
        </FormLabel>
        <Divider />
        <Box p={4}>{children}</Box>
      </FormControl>
    </Box>
  );
};

export default FieldsetBox;
