import * as React from 'react';
import { useRadioGroup, Wrap, WrapItem } from '@chakra-ui/react';
import { IconType } from 'react-icons/lib';

import RadioCard from './radio-card';

interface RadioCardOption {
  value: string;
  id?: string;
  label: React.ReactNode;
  icon?: IconType;
}

interface RadioGroupProps {
  defaultValue?: string;
  name: string;
  options: RadioCardOption[];
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  defaultValue = '',
  name,
  options,
}) => {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    defaultValue,
  });
  const group = getRootProps();

  return (
    <Wrap {...group} spacing={2}>
      {options.map((option) => {
        const radio = getRadioProps({ value: option.value });
        return (
          <WrapItem key={option.id}>
            <RadioCard {...radio} icon={option.icon}>
              {option.label}
            </RadioCard>
          </WrapItem>
        );
      })}
    </Wrap>
  );
};

export default RadioGroup;
