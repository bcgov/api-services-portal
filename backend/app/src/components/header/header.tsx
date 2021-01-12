import * as React from 'react';
//import Image from 'next/image';
import Link from 'next/link';

import Button from '../button';
import SignIn from './signin';
import styles from './header.module.css';

interface HeaderProps {
  onNavClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavClick }) => {
  return (
    <header className="flex items-center px-4 md:px-12 bg-bc-blue border-b-2 border-bc-yellow fixed top-0 w-full h-header">
      <hgroup className="flex items-center content-start mr-2">
        <Link href="/">
          <a>
            <span className="hidden sm:block">
              <img src="/images/bc_logo_header.svg" width={170} height={43} />
            </span>
            <span className="sm:hidden">
              <img src="/images/bc_logo_vert.svg" width={50} height={44} />
            </span>
          </a>
        </Link>
        <h1 className="text-white text-lg md:text-3xl mb-0 ml-4 mr-2">
          API Program Services
        </h1>
      </hgroup>
      <hgroup className="flex flex-1 items-center justify-end text-white">
        <div className="hidden sm:block">
          <SignIn />
        </div>
        <div className="block sm:hidden w-6 h-6">
          <button onClick={onNavClick}>
            <svg
              aria-hidden="true"
              focusable="false"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              data-testid="hamburger-icon-button"
              aria-label="Toggle mobile navigation"
            >
              <path
                fill="currentColor"
                d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"
              ></path>
            </svg>
          </button>
        </div>
      </hgroup>
    </header>
  );
};

export default Header;
