import * as React from 'react';
import { HStack } from '@chakra-ui/react';
import { Template } from '@storybook/ui';

import AccessStatus from './access-status';

export default {
  title: 'APS/AccessList',
};

export const AllStatuses = () => (
  <HStack spacing={4}>
    <AccessStatus isIssued={false} isComplete={false} isApproved={false} />
    <AccessStatus isIssued={true} isComplete={false} isApproved={false} />
    <AccessStatus isIssued={true} isComplete={true} isApproved={false} />
    <AccessStatus isIssued={true} isComplete={true} isApproved={true} />
  </HStack>
);

export const ServiceAccessVariant = () => (
  <AccessStatus
    isIssued={undefined}
    isComplete={undefined}
    isApproved={undefined}
  />
);

const Playground = (props) => <AccessStatus {...props} />;

export const PropsTester = Playground.bind({});
PropsTester.args = {
  isIssued: true,
  isComplete: false,
  isApproved: false,
};
