import * as React from 'react';
import { Box, Container, Link, useMediaQuery } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

const linkProps = {
  px: 4,
  py: 3,
  d: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderBottomWidth: 2,
  borderBottomColor: 'bc-blue-alt',
  fontWeight: 400,
  _activeLink: {
    fontWeight: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'bc-yellow',
  },
  _hover: { textDecoration: 'underline' },
};

interface NavBarProps {
  links: any[];
  pathname: string | undefined;
}

const NavBar: React.FC<NavBarProps> = ({ links, pathname }) => {
  const [active, setActive] = React.useState<string>('');

  // Router isn't active SSR, so wait till the client loads before setting
  // current so there's no diff between SSR and Client
  React.useEffect(() => {
    if (pathname) {
      const [rootPage] = /\/?([a-zA-Z-_]*)/.exec(pathname);
      setActive(rootPage);
    }
  }, [pathname, setActive]);

  return (
    <Box
      as="nav"
      role="banner"
      bg="bc-blue-alt"
      pos="fixed"
      w="100%"
      top="65px"
    >
      <Container
        as="ul"
        mx={{ base: 0, sm: 8 }}
        px={{ base: 0, sm: 4 }}
        d="flex"
        alignItems="center"
        flexDir={{ base: 'column', sm: 'row' }}
        color="white"
      >
        {links.map((link) => (
          <Box as="li" key={link.url} width={{ base: '100%', sm: 'auto' }}>
            <NextLink href={link.url}>
              <Link
                {...linkProps}
                aria-current={link.url === active ? 'page' : false}
              >
                <Box as="span" whiteSpace="nowrap">
                  {link.name}
                </Box>
              </Link>
            </NextLink>
          </Box>
        ))}
      </Container>
    </Box>
  );
};

export default NavBar;
