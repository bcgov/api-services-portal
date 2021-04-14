import * as React from 'react';
import { Avatar, AvatarProps, Box, BoxProps } from '@chakra-ui/react';

type ModelType = 'resource' | 'route' | 'service' | 'application' | 'consumer' | 'request';

interface ModelIconProps extends BoxProps {
  model: ModelType;
  size?: AvatarProps['size'];
}

const colorSchemes: Record<ModelType, string> = {
  route: 'green',
  resource: 'pink',
  service: 'blue',
  application: 'orange',
  consumer: 'purple',
  request: 'teal',
};

const ModelIcon: React.FC<ModelIconProps> = ({ model, size, ...boxProps }) => {
  return (
    <Box {...boxProps}>
      <Avatar colorScheme={colorSchemes[model]} name={model} size={size} />
    </Box>
  );
};

export default ModelIcon;
