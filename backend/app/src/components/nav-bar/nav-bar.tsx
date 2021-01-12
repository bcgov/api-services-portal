import * as React from 'react';
import cx from 'classnames';
import Link from 'next/link';

import styles from './nav-bar.module.css';

interface NavBarProps {
  links: any[];
  open: boolean;
  pathname: string;
  user: { roles };
}

const NavBar: React.FC<NavBarProps> = ({ links, open, pathname, user }) => {
  const getClassName = (url: string) =>
    pathname.includes(url) ? styles.active : null;
  const homeClassName = pathname === '/' ? styles.active : null;
  const roles = user != null && 'roles' in user ? JSON.parse(user.roles) : [];

  return (
    <nav
      className={cx('bg-bc-blue-alt sm:block', styles.navbar, {
        ['block']: open,
        ['hidden']: !open,
      })}
    >
      <div className={styles.container}>
        <ul>
          <li className={homeClassName}>
            <Link href="/">
              <a>Home</a>
            </Link>
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
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
