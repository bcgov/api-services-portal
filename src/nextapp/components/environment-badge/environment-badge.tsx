import * as React from 'react';
import { Badge, BadgeProps, Icon } from '@chakra-ui/react';
import { Environment } from '@/shared/types/query.types';
import { FaCircle } from 'react-icons/fa';

interface EnvironmentBadgeProps extends BadgeProps {
  data: Environment;
}

const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({
  data,
  ...rest
}) => {
  return (
    <Badge colorScheme={data.active ? 'green' : 'gray'} {...rest}>
      <Icon
        as={FaCircle}
        mr={1}
        mt={-0.5}
        boxSize="0.5rem"
        color={data.active ? 'green.500' : 'gray.400'}
      />
      {data.name || 'Unassigned'}
    </Badge>
  );
};

export default EnvironmentBadge;
