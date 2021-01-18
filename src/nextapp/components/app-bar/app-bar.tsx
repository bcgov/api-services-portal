import * as React from 'react';

import Header from '../header';
import NavBar from '../nav-bar';

interface AppBarProps {
  links: { name: string; url: string }[];
  pathname: string | undefined;
  user: any;
}

const AppBar: React.FC<AppBarProps> = ({ links, pathname, user }) => {
  return (
    <>
      <Header user={user} />
      <NavBar links={links} pathname={pathname} />
    </>
  );
};

export default AppBar;
