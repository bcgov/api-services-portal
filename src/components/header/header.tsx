import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import styles from './header.module.css';

const Header: React.FC<{}> = () => {
  return (
    <header className={styles.header}>
      <hgroup className={styles.banner}>
        <Link href="/">
          <a>
            <Image
              src="/images/bc_logo_header.svg"
              width={170}
              height={43}
            />
          </a>
        </Link>
        <h1>API Program Services</h1>
      </hgroup>
      <hgroup className={styles.other}>Sign In</hgroup>
    </header>
  );
};

export default Header;
