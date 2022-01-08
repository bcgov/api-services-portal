import * as React from 'react';
import { HStack } from '@chakra-ui/layout';
import { useRadioGroup } from '@chakra-ui/radio';

import RadioCard from './radio-card';

interface RadioCardGroupProps {
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
}) => {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    defaultValue,
    onChange,
  });
  const group = getRootProps();

  return (
    <HStack {...group} spacing={4}>
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
