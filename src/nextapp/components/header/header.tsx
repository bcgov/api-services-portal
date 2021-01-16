import * as React from 'react';
//import Image from 'next/image';
import { Box, Heading, IconButton } from '@chakra-ui/react';
import Link from 'next/link';

import SignIn from './signin';
import MobileNavIcon from './mobile-nav-icon';

interface HeaderProps {
  user: any;
  onNavClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavClick, user }) => {
  return (
    <Box
      as="header"
      height="65px"
      d="flex"
      bg="bc-blue"
      alignItems="center"
      justifyContent="space-between"
      color="white"
      px={{ base: 4, sm: 16 }}
    >
      <Box
        as="hgroup"
        d="flex"
        alignItems="center"
        flexGrow={{ base: 1, sm: 0 }}
      >
        <Link href="/home">
          <a>
            <Box as="span" display={{ base: 'none', sm: 'block' }}>
              <img src="/images/bc_logo_header.svg" width={170} height={43} />
            </Box>
            <Box as="span" display={{ base: 'block', sm: 'none' }}>
              <img src="/images/bc_logo_vert.svg" width={50} height={44} />
            </Box>
          </a>
        </Link>
        <Heading isTruncated size="lg" ml={{ base: 3, sm: 6 }}>
          API Program Services
        </Heading>
      </Box>
      <Box as="hgroup">
        <Box display={{ base: 'none', sm: 'block' }}>
          <SignIn user={user} />
        </Box>
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
