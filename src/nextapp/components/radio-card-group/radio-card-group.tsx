import * as React from 'react';
import { Grid, GridItem, HStack } from '@chakra-ui/layout';
import { useRadioGroup } from '@chakra-ui/radio';

import RadioCard from './radio-card';
import { ChakraProps } from '@chakra-ui/system';

interface RadioCardGroupProps extends ChakraProps {
  defaultValue?: string;
  isRequired?: boolean;
  name: string;
  align?: string;
  options: {
    title: string;
    description: React.ReactNode;
    value: string;
  }[];
  onChange?: (value: string) => void;
  value?: string;
}

const RadioCardGroup: React.FC<RadioCardGroupProps> = ({
  defaultValue,
  isRequired,
  name,
  options,
  onChange,
  value,
  ...props
}) => {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    defaultValue,
    onChange,
  });
  const group = getRootProps();

  return (
    <Grid
      {...group}
      {...props}
      templateColumns={`repeat(${options.length}, 1fr)`}
      gap={4}
      sx={{ '& > *': { flex: 1 } }}
    >
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
    </Grid>
  );
};

export default RadioCardGroup;
