import * as React from 'react';
import { Circle, Tooltip } from '@chakra-ui/react';

interface CircleIconProps {
  color: string;
  children: React.ReactNode;
  label: string;
}

const CircleIcon: React.FC<CircleIconProps> = ({ children, color, label }) => {
  return (
    <Tooltip label={label} aria-label={`${label} icon`}>
      <Circle bgColor={color} size="30px" color="white">
        {children}
      </Circle>
    </Tooltip>
  );
};

export default CircleIcon;
