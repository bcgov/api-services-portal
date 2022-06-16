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
  const forwardPath: string =
    'f' in router?.query ? router.query.f.toString() : router?.asPath;

  const buttonComponents = {
    idir: (
      <Button
        as="a"
        key="idir"
        variant="primary"
        href={buildUrl('idir', forwardPath)}
      >
        IDIR
      </Button>
    ),
    bceid: (
      <Button
        as="a"
        key="bceid"
        variant="primary"
        href={buildUrl('bceid-business', forwardPath)}
      >
        BCeID
      </Button>
    ),
    bcsc: (
      <Button
        as="a"
        key="bscs"
        variant="primary"
        href={buildUrl('bcsc', forwardPath)}
      >
        BC Services Card
      </Button>
    ),
    github: (
      <Button
        as="a"
        key="github"
        variant="secondary"
        bgColor="#f5f5f5"
        borderColor="#333"
        color="#333"
        href={buildUrl('github', forwardPath)}
      >
        Github
      </Button>
    ),
  };

  return (
    <ButtonGroup spacing={3}>
      {buttons.map((button) => buttonComponents[button])}
    </ButtonGroup>
  );
};

export default LoginButtons;
