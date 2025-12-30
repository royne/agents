import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="icon" href="/droplab.png" />
        <meta name="application-name" content="DROPAPP" />
        <meta name="description" content="Potencia tu Ecommerce con Dropapp: IA generativa para landings, ads y videos, unida al control total de tu logística y rentabilidad. ¡Lleva tu negocio al futuro!" />

        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="DROPAPP - El Futuro de tu E-commerce con IA" />
        <meta property="og:description" content="Potencia tu Ecommerce con Dropapp: IA generativa para landings, ads y videos, unida al control total de tu logística y rentabilidad. ¡Lleva tu negocio al futuro!" />
        <meta property="og:image" content="/droplab.png" />
        <meta property="og:site_name" content="DROPAPP" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DROPAPP - El Futuro de tu E-commerce con IA" />
        <meta name="twitter:description" content="Potencia tu Ecommerce con Dropapp: IA generativa para landings, ads y videos, unida al control total de tu logística y rentabilidad. ¡Lleva tu negocio al futuro!" />
        <meta name="twitter:image" content="/droplab.png" />

        <meta name="theme-color" content="#12D8FA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DROPAPP" />
        <link rel="apple-touch-icon" href="/droplab.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body className="bg-[#050608]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
