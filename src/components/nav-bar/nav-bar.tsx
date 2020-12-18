import * as React from 'react';

import styles from './nav-bar.module.css';

interface NavBarProps {
  children: React.ReactElement[];
}

const NavBar: React.FC<NavBarProps> = ({ children }) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <ul>{children}</ul>
      </div>
    </nav>
  );
};

export default NavBar;
