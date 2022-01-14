import * as React from 'react';
import { HStack } from '@chakra-ui/layout';
import { useRadioGroup } from '@chakra-ui/radio';

import RadioCard from './radio-card';
import { ChakraProps } from '@chakra-ui/system';

interface RadioCardGroupProps extends ChakraProps {
  defaultValue?: string;
  isRequired?: boolean;
  name: string;
  options: {
    title: string;
    description: React.ReactNode;
    value: string;
  }[];
  onChange?: (value: string) => void;
}

const RadioCardGroup: React.FC<RadioCardGroupProps> = ({
  defaultValue,
  isRequired,
  name,
  options,
  onChange,
  ...props
}) => {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    defaultValue,
    onChange,
  });
  const group = getRootProps();

  return (
    <HStack {...group} {...props} spacing={4}>
      {options.map(({ description, title, value }) => {
        const radio = getRadioProps({ value });
        return (
          <RadioCard
            key={value}
            {...radio}
            title={title}
            isRequired={isRequired}
          >
            {description}
          </RadioCard>
        );
      })}
    </HStack>
  );
};

export default RadioCardGroup;
