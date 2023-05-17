import * as React from 'react';
import { Text } from '@chakra-ui/react';

interface SecretTextProps {
  children: string;
}

const SecretText: React.FC<SecretTextProps> = ({ children }) => {
  const [isVisible, setVisible] = React.useState(false);

  const toggleVisible = () => {
    setVisible((state) => !state);
  };

  return (
    <Text onMouseOver={toggleVisible} onMouseOut={toggleVisible}>
      {isVisible ? children : '************'}
    </Text>
  );
};

export default SecretText;
