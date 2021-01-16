import * as React from 'react';
import { Box, Container, Link as UiLink } from '@chakra-ui/react';
import cx from 'classnames';
import Link from 'next/link';

import styles from './nav-bar.module.css';

interface NavBarProps {
  links: any[];
  open: boolean;
  pathname: string;
  user: any;
}

const NavBar: React.FC<NavBarProps> = ({ links, open, pathname, user }) => {
  const getClassName = (url: string) =>
    pathname.includes(url) ? styles.active : null;
  const homeClassName = pathname === '/' ? styles.active : null;
  const roles =
    user != null && 'roles' in user && user['roles'] != null
      ? JSON.parse(user.roles)
      : [];

  return (
    <Box as="nav" bg="bc-blue-alt">
      <Container
        as="ul"
        mx={{ base: 6, sm: 8 }}
        d="flex"
        alignItems="center"
        color="white"
      >
        <li>
          <UiLink href="/home" px={4} py={4} d="block">
            <a>Home</a>
          </UiLink>
        </li>
        {links
          .filter(
            (link) =>
              link.access == null ||
              link.access.filter((value) => roles.includes(value)).length > 0
          )
          .map((link) => (
            <li key={link.url} className={getClassName(link.url)}>
              <Link href={link.url}>
                <a>{link.name}</a>
              </Link>
            </li>
          ))}
      </Container>
    </Box>
  );
};

export default NavBar;
