import * as React from 'react';
import { Box, Container, Link, useMediaQuery } from '@chakra-ui/react';
import NextLink from 'next/link';

const linkProps = {
  px: 4,
  py: 3,
  d: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
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
  pathname: string;
  user: any;
}

const NavBar: React.FC<NavBarProps> = ({ links, pathname }) => {
  return (
    <Box as="nav" bg="bc-blue-alt" pos="fixed" w="100%" top="65px">
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
                aria-current={pathname === link.url ? 'page' : null}
              >
                {link.name}
              </Link>
            </NextLink>
          </Box>
        ))}
      </Container>
    </Box>
  );
};

export default NavBar;
