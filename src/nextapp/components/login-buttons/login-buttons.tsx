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

interface LoginButtonsProps {
  buttons: string[];
}

const LoginButtons: React.FC<LoginButtonsProps> = ({ buttons }) => {
  const router = useRouter();

  const buttonComponents = {
    idir: (
      <Button as="a" variant="primary" href={buildUrl('idir', router?.asPath)}>
        IDIR
      </Button>
    ),
    bceid: (
      <Button as="a" variant="primary" href={buildUrl('bceid', router?.asPath)}>
        BCeID
      </Button>
    ),
    github: (
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
    ),
  };

  return (
    <ButtonGroup spacing={7}>
      {buttons.map((button) => buttonComponents[button])}
    </ButtonGroup>
  );
};

export default LoginButtons;
