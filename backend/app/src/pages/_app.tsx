import Head from 'next/head';
import Typography from 'typography';
//import '@bcgov/bc-sans/css/BCSans.css';
//import '../shared/styles/global.css';

//import Header from '../components/header';
//import NavBar from '../components/nav-bar';

// const typography = new Typography({
//   baseFontSize: '16px',
//   baseLineHeight: 1.25,
//   headerFontFamily: ['BCSans', 'Noto Sans', 'Verdana', 'Arial', 'sans-serif'],
//   bodyFontFamily: ['BCSans', 'Noto Sans', 'Verdana', 'Arial', 'sans-serif'],
//   scaleRatio: 2.074,
// });

export default function MyApp({ Component, pageProps }) {
  const links = [
    { name: 'APIs', url: '/apis' },
    { name: 'Documentation', url: '/docs' },
  ];

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
        {/* <style type="text/css">{typography.toString()}</style> */}
      </Head>
      {/* <Header /> */}
      {/* <NavBar links={links} /> */}
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
}
