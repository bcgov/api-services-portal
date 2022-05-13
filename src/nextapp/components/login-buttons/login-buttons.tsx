import * as React from 'react';
import { Button, ButtonGroup } from '@chakra-ui/react';

const LoginButtons: React.FC = () => {
  return (
    <ButtonGroup spacing={7}>
      <Button as="a" variant="primary" href="/oauth2/start?kc_idp_hint=idir">
        IDIR
      </Button>
      <Button as="a" variant="primary" href="/oauth2/start?kc_idp_hint=bceid">
        BCeID
      </Button>
      <Button
        as="a"
        variant="secondary"
        bgColor="#f5f5f5"
        borderColor="#333"
        color="#333"
        href="/oauth2/start?kc_idp_hint=github"
      >
        Github
      </Button>
    </ButtonGroup>
  );
};

export default LoginButtons;
