import * as React from 'react';
import { Button, ButtonGroup } from '@chakra-ui/react';
import { useRouter } from 'next/router';

function buildUrl(hint: string, path: string) {
  const f = new URLSearchParams({
    f: path,
  });
  const redirect = `/admin/signin?${f.toString()}`;
  const search = new URLSearchParams({
    kc_idp_hint: hint,
    rd: redirect,
  });

  return `/oauth2/start?${search.toString()}`;
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
