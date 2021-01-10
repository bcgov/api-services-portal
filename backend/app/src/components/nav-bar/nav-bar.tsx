import * as React from 'react';
import Link from 'next/link';
import { withRouter } from 'next/router';

import styles from './nav-bar.module.css';

interface NavBarProps {
  links: any[];
  user: { roles };
  pathname: string;
}

const NavBar: React.FC<NavBarProps> = ({ links, user, pathname }) => {
  const getClassName = (url: string) =>
    pathname.includes(url) ? styles.active : null;
  const homeClassName = pathname == '/' ? styles.active : styles.inactive;

  const roles = user != null && 'roles' in user ? JSON.parse(user.roles) : []

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <ul>
          <li className={homeClassName}>
            <Link href="/">
              <a>Home</a>
            </Link>
          </li>
          {links.filter(link => link.access == null || link.access.filter(value => roles.includes(value)).length > 0).map((link) => (
            <li key={link.url} className={getClassName(link.url)}>
              <Link href={link.url}>
                <a>{link.name}</a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
