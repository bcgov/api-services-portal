import * as React from 'react';
import { Box, Container, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import type { NavLink } from '@/shared/data/links';
import { useAuth } from '@/shared/services/auth';

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
  site: string;
  links: NavLink[];
  pathname: string | undefined;
}

const NavBar: React.FC<NavBarProps> = ({ site, links, pathname }) => {
  const { user } = useAuth();
  const authenticatedLinks = links
    .filter((link) => link.sites.includes(site))
    .filter(
      (link) =>
        link.access.length === 0 ||
        user?.roles.some((role) => link.access.includes(role))
    );
  // Router isn't active SSR, so wait till the client loads before setting
  // current so there's no diff between SSR and Client
  const active = React.useMemo(() => {
    if (pathname) {
      return pathname;
    }

    return '';
  }, [pathname]);

  return (
    <Box
      as="nav"
      role="banner"
      bg="bc-blue-alt"
      pos="fixed"
      w="100%"
      zIndex={{ base: 1000, sm: 5 }}
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
        {authenticatedLinks.map(({ BadgeElement, ...link }) => (
          <Box
            as="li"
            key={link.url}
            width={{ base: '100%', sm: 'auto' }}
            pos="relative"
          >
            <NextLink href={link.url}>
              <Link
                {...linkProps}
                aria-current={
                  link.url === active || link.altUrls?.includes(active)
                    ? 'page'
                    : false
                }
              >
                <Box as="span" whiteSpace="nowrap" pr={BadgeElement ? 4 : 0}>
                  {link.name}
                </Box>
                {BadgeElement && (
                  <Box as="span" display="flex" alignItems="center">
                    <BadgeElement />
                  </Box>
                )}
              </Link>
            </NextLink>
          </Box>
        ))}
      </Container>
    </Box>
  );
};

export default NavBar;
