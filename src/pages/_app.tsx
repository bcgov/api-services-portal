import Typography from 'typography';
import Link from 'next/link';
import '@bcgov/bc-sans/css/BCSans.css';

import Header from '../components/header';
import NavBar from '../components/nav-bar';
import '../shared/styles/global.css';

const typography = new Typography({
  baseFontSize: '16px',
  baseLineHeight: 1.25,
  headerFontFamily: ['BCSans', 'Noto Sans', 'Verdana', 'Arial', 'sans-serif'],
  bodyFontFamily: ['BCSans', 'Noto Sans', 'Verdana', 'Arial', 'sans-serif'],
  scaleRatio: 2.074,
});

export default function MyApp({ Component, pageProps }) {
  typography.injectStyles();
  return (
    <>
      <Header />
      <NavBar>
        <li>
          <Link href="/">
            <a>Home</a>
          </Link>
        </li>
        <li>
          <Link href="/apis">
            <a>APIs</a>
          </Link>
        </li>
        <li>
          <Link href="/docs">
            <a>Documentation</a>
          </Link>
        </li>
      </NavBar>
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
}
