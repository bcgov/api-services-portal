import * as React from 'react';
import { Box, Button, Heading, Icon, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { uid } from 'react-uid';

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
    idir: {
      href: buildUrl('idir', forwardPath),
      text: 'IDIR',
      description: 'Only available to B.C. government workers.',
    },
    bceid: {
      href: buildUrl('bceid-business', forwardPath),
      text: 'BCeID',
      description: 'BCeID description coming soon',
    },
    bcsc: {
      href: buildUrl('bcsc', forwardPath),
      text: 'BC Services Card',
      description: 'BC Services Card description coming soon',
    },
    github: {
      props: {
        variant: 'secondary',
        bgColor: '#f5f5f5',
        borderColor: '#333',
        color: '#333',
      },
      href: buildUrl('github', forwardPath),
      text: 'Github',
      description: 'Github description coming soon',
    },
  };

  const elements = buttons.map((b) => {
    const button = buttonComponents[b];

    return (
      <Box key={uid(b)} bgColor="white" p={10}>
        <Heading size="md" mb={5} display="flex" alignItems="center">
          Login with your {button.text}
        </Heading>
        <Text>{button.description}</Text>
        <Box mt={7}>
          <Button
            as="a"
            key="idir"
            variant="primary"
            href={buildUrl('idir', button.forwardPath)}
            w="100%"
          >
            Login with {button.text}
          </Button>
        </Box>
      </Box>
    );
  });

  return <>{elements}</>;
};

export default LoginButtons;
