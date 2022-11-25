import * as React from 'react';
import { Box, Button, Heading, Icon, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { uid } from 'react-uid';
import { FaGithub } from 'react-icons/fa';

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
  identities: string[];
  variant?: string;
}

const LoginButtons: React.FC<LoginButtonsProps> = ({
  identities,
  variant = 'block',
}) => {
  const router = useRouter();
  const forwardPath: string =
    'f' in router?.query ? router.query.f.toString() : router?.asPath;
  const isInline = variant === 'inline';

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
  } as const;

  const elements = identities.map((b) => {
    const button = buttonComponents[b];
    const isGitHub = b === 'github';
    const variant = isGitHub ? 'outline' : 'primary';
    const bgColor = isGitHub ? 'bc-background' : undefined;
    const icon = isGitHub ? <Icon as={FaGithub} /> : undefined;

    if (isInline) {
      return (
        <Button
          key={uid(b)}
          as="a"
          variant={variant}
          href={buildUrl(b, button.forwardPath)}
          leftIcon={icon}
          bgColor={bgColor}
        >
          Login with {button.text}
        </Button>
      );
    }

    return (
      <Box key={uid(b)} bgColor="white" p={10}>
        <Heading size="md" mb={5} display="flex" alignItems="center">
          Login with your {button.text}
        </Heading>
        <Text>{button.description}</Text>
        <Box mt={7}>
          <Button
            as="a"
            key={uid(b)}
            variant={variant}
            href={buildUrl(b, button.forwardPath)}
            w="100%"
            leftIcon={icon}
            bgColor={bgColor}
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
