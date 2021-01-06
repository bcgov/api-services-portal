import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import styles from './nav-bar.module.css';

interface NavBarProps {
  links: any[];
}

const NavBar: React.FC<NavBarProps> = ({ links }) => {
  const { pathname } = useRouter();
  const getClassName = (url: string) =>
    pathname.includes(url) ? styles.active : null;
  const homeClassName = pathname === '/' ? styles.active : null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <ul>
          <li className={homeClassName}>
            <Link href="/">
              <a>Home</a>
            </Link>
          </li>
          {links.map((link) => (
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
