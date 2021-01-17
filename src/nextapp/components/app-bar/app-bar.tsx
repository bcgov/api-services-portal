import * as React from 'react';
import Router from 'next/router';

import Header from '../header';
import NavBar from '../nav-bar';

interface AppBarProps {
  links: { name: string; url: string }[];
  pathname: string;
  user: any;
}

const AppBar: React.FC<AppBarProps> = ({ links, pathname, user }) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const onToggleNav = React.useCallback(() => {
    setOpen((state) => !state);
  }, [setOpen]);
  Router.events.on('routeChangeStart', () => {
    setOpen(false);
  });

  return (
    <>
      <Header user={user} onNavClick={onToggleNav} />
      <NavBar links={links} open={open} pathname={pathname} user={user} />
    </>
  );
};

export default AppBar;
