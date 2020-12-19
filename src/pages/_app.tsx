import Head from 'next/head';
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
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link href="/favicon.ico" rel="icon" type="image/x-icon" />
      </Head>
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
        <div style={{ margin: '0 auto', maxWidth: 960 }}>
          <Component {...pageProps} />
        </div>
      </main>
    </>
  );
}
