import * as React from 'react';

import Header from '../header';
import NavBar from '../nav-bar';

interface AppBarProps {
  links: { name: string; url: string }[];
  user: any;
}

const AppBar: React.FC<AppBarProps> = ({ links, user }) => {
  return (
    <>
      <Header user={user} />
      <NavBar links={links} />
    </>
  );
};

export default AppBar;
