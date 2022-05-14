import * as React from 'react';
import { Button, ButtonGroup } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import querystring from 'querystring';

function buildUrl(hint: string, path: string) {
  const redirect = `/admin/signin?${querystring.encode({
    f: path,
  })}`;

  return `/oauth2/start?${querystring.encode({
    kc_idp_hint: hint,
    rd: redirect,
  })}`;
}

const LoginButtons: React.FC = () => {
  const router = useRouter();
  return (
    <ButtonGroup spacing={7}>
      <Button as="a" variant="primary" href={buildUrl('idir', router?.asPath)}>
        IDIR
      </Button>
      <Button as="a" variant="primary" href={buildUrl('bceid', router?.asPath)}>
        BCeID
      </Button>
      <Button
        as="a"
        variant="secondary"
        bgColor="#f5f5f5"
        borderColor="#333"
        color="#333"
        href={buildUrl('github', router?.asPath)}
      >
        Github
      </Button>
    </ButtonGroup>
  );
};

export default LoginButtons;
