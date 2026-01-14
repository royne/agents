import React from 'react';
import Head from 'next/head';
import TermsLanding from '../components/public/TermsLanding';

const TermsPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Términos y Condiciones - DROPAPP</title>
        <meta name="description" content="Términos y condiciones de uso de la plataforma DROPAPP." />
      </Head>
      <TermsLanding />
    </>
  );
};

export default TermsPage;
