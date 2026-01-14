import React from 'react';
import Head from 'next/head';
import PrivacyLanding from '../components/public/PrivacyLanding';

const PrivacyPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Política de Privacidad - DROPAPP</title>
        <meta name="description" content="Política de privacidad y manejo de datos de la plataforma DROPAPP." />
      </Head>
      <PrivacyLanding />
    </>
  );
};

export default PrivacyPage;
