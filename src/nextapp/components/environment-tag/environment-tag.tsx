import { Tag } from '@chakra-ui/tag';
import * as React from 'react';

interface EnvironmentTagProps {
  name: string;
}

const EnvironmentTag: React.FC<EnvironmentTagProps> = ({ name }) => {
  const bgColor = () => {
    switch (name) {
      case 'dev':
        return '#FED77680';
      case 'prod':
        return '#C2ED9880';
      case 'test':
        return '#8ED2CD66';
      case 'sandbox':
        return '#333ED433';
      case 'conformance':
        return '#F59B7C66';
      case 'other':
        return '#F1F4874D';
    }
  };
  return (
    <Tag bgColor={bgColor()} variant="outline">
      {name}
    </Tag>
  );
};

export default EnvironmentTag;
