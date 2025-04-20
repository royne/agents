import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="icon" href="/unlocked.png" />
        <meta name="application-name" content="Unlocked Ecom" />
        <meta name="description" content="Plataforma de gestión para Unlocked Ecom" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Unlocked Ecom" />
        <link rel="apple-touch-icon" href="/unlocked.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
