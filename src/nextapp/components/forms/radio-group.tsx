import * as React from 'react';
import { useRadioGroup, Wrap, WrapItem } from '@chakra-ui/react';

import RadioCard from './radio-card';

interface RadioGroupProps {
  options: any[];
}

const RadioGroup: React.FC<RadioGroupProps> = ({ options }) => {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'framework',
    defaultValue: 'react',
    onChange: console.log,
  });

  const group = getRootProps();

  return (
    <Wrap {...group} spacing={2}>
      {options.map((value) => {
        const radio = getRadioProps({ value });
        return (
          <WrapItem key={value.id}>
            <RadioCard key={value.id} {...radio}>
              {value.label}
            </RadioCard>
          </WrapItem>
        );
      })}
    </Wrap>
  );
};

export default RadioGroup;
