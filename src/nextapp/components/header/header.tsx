import * as React from 'react';
//import Image from 'next/image';
import cx from 'classnames';
import { Box, Heading, IconButton } from '@chakra-ui/react';
import Link from 'next/link';
import Router from 'next/router';

import styles from './header.module.css';
import MobileNavIcon from './mobile-nav-icon';

interface HeaderProps {
  site: string;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ site, children }) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const onNavClick = () => {
    setOpen((state) => !state);
  };

  Router.events.on('routeChangeStart', () => {
    setOpen(false);
  });

  return (
    <Box
      as="header"
      height="65px"
      d="flex"
      bg="bc-blue"
      alignItems="center"
      justifyContent="space-between"
      pos="fixed"
      top={0}
      w="100%"
      color="white"
      zIndex="1000"
      px={{ base: 4, sm: 16 }}
      className={cx(styles.container, {
        [styles.open]: open,
      })}
    >
      <Box
        as="hgroup"
        d="flex"
        alignItems="center"
        flexGrow={{ base: 1, sm: 0 }}
      >
        <Link href={site == 'manager' ? '/' : '/'}>
          <a>
            <Box as="span" display={{ base: 'none', sm: 'block' }} maxW="154px">
              <img src="/images/bc_logo_header.svg" width={154} height={43} />
            </Box>
            <Box as="span" display={{ base: 'block', sm: 'none' }}>
              <img src="/images/bc_logo_vert.svg" width={50} height={44} />
            </Box>
          </a>
        </Link>
        <Heading isTruncated size="lg" ml={{ base: 3, sm: 6 }}>
          API {site == 'manager' ? 'Provider Console' : 'Services Portal'}
        </Heading>
      </Box>
      <Box as="hgroup">
        {children && (
          <Box display={{ base: 'none', sm: 'block' }}>{children}</Box>
        )}
        <Box display={{ sm: 'none' }}>
          <IconButton
            aria-label="Toggle Navigation"
            onClick={onNavClick}
            variant="ghost"
            size="lg"
            _hover={{ bg: 'transparent' }}
          >
            <MobileNavIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
