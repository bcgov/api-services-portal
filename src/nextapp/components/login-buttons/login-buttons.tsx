import * as React from 'react';
import {
  Box,
  Button,
  Heading,
  Icon,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { uid } from 'react-uid';
import { FaGithub } from 'react-icons/fa';
import { makeRedirectUrl } from '@/shared/services/auth';

function buildUrl(hint: string, path: string) {
  const redirectPath = makeRedirectUrl(path);
  const f = new URLSearchParams({
    f: redirectPath,
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
  identityContent: Record<string, any>;
  variant?: string;
}

const LoginButtons: React.FC<LoginButtonsProps> = ({
  identities,
  identityContent,
  variant = 'block',
}) => {
  const router = useRouter();
  const forwardPath: string = router.query.f?.toString() ?? router?.asPath;
  const isInline = variant === 'inline';
  const helpTexts = {
    bceid: (helpUrl: string) => (
      <>
        Don't have an account?{' '}
        <Link href={helpUrl} color="bc-link" textDecor="underline">
          Register for a Business BCeID
        </Link>
      </>
    ),
    bcsc: (helpUrl: string) => (
      <Link href={helpUrl} color="bc-link" textDecor="underline">
        Learn how to use your BC Services Card to log in
      </Link>
    ),
  };
  const githubButtonProps = {
    variant: 'secondary',
    bgColor: '#f5f5f5',
    borderColor: '#333',
    color: '#333',
  };

  const elements = identities.map((b, index) => {
    const button = identityContent[b];
    const isGitHub = b === 'github';
    const variant = isGitHub ? 'outline' : 'primary';
    const bgColor = isGitHub ? 'bc-background' : undefined;
    const icon = isGitHub ? <Icon as={FaGithub} /> : undefined;
    // There are edge cases where a different identifier is needed
    const hrefLookup = button.url ?? b;
    const href = buildUrl(hrefLookup, forwardPath);

    if (isInline) {
      return (
        <Button
          key={uid(b)}
          as="a"
          variant={variant}
          href={href}
          leftIcon={icon}
          bgColor={bgColor}
        >
          Login with {button.text}
        </Button>
      );
    }

    return (
      <Box key={uid(b)} bgColor="white" p={5}>
        <Heading size="md" mb={5} display="flex" alignItems="center">
          {`Option ${index + 1} - Login with your ${button.text}`}
        </Heading>
        {button.description && <Text>{button.description}</Text>}
        <Box mt={7}>
          <Button
            as="a"
            key={uid(b)}
            variant={variant}
            href={href}
            w="100%"
            leftIcon={icon}
            bgColor={bgColor}
          >
            Login with {button.text}
          </Button>
        </Box>
        {button.helpLink && helpTexts[b] && (
          <Box mt={4} textAlign="center">
            {helpTexts[b](button.helpLink)}
          </Box>
        )}
      </Box>
    );
  });

  return <>{elements}</>;
};

export default LoginButtons;
