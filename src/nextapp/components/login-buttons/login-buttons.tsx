import * as React from 'react';
import { Button, ButtonGroup } from '@chakra-ui/react';

const LoginButtons: React.FC = () => {
  return (
    <ButtonGroup spacing={7}>
      <Button>IDIR</Button>
      <Button>BCeID</Button>
      <Button
        variant="secondary"
        bgColor="#f5f5f5"
        borderColor="#333"
        color="#333"
      >
        Github
      </Button>
    </ButtonGroup>
  );
};

export default LoginButtons;
