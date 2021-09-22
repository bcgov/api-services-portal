import * as React from 'react';
import {
  FormControl,
  FormControlProps,
  FormLabel,
  Icon,
} from '@chakra-ui/react';
import { IconType } from 'react-icons/lib';

interface AccessRequestFieldsetProps extends FormControlProps {
  children: React.ReactNode;
  label: string;
  icon: IconType;
}

const AccessRequestFieldset: React.FC<AccessRequestFieldsetProps> = ({
  children,
  label,
  icon,
  ...props
}) => {
  return (
    <FormControl
      as="fieldset"
      border="1px solid"
      borderColor="bc-outline"
      p={4}
      borderRadius={4}
      w="100%"
      mb={4}
      {...props}
    >
      <FormLabel mb={4}>
        <Icon as={icon} boxSize={5} color="bc-blue" mr={2} />
        {label}
      </FormLabel>
      {children}
    </FormControl>
  );
};

export default AccessRequestFieldset;
