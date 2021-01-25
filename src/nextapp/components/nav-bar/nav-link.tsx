import * as React from 'react';
import { Link } from '@chakra-ui/react';

interface NavLinkProps {
  active: boolean;
  children: React.ReactNode;
  href?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ active, children, href }) => {
  return (
    <Link
      px={4}
      py={3}
      d="block"
      aria-current={active ? 'page' : false}
      href={href}
      borderBottomWidth={2}
      borderBottomColor="bc-blue-alt"
      _activeLink={{
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderColor: 'bc-yellow',
      }}
      _hover={{ textDecoration: 'underline' }}
    >
      {children}
    </Link>
  );
};

export default NavLink;
