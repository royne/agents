import React from 'react';
import Head from 'next/head';
import MentorLanding from '../components/public/MentorLanding';

const MentoresPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Mentor Portal - DROPAPP</title>
        <meta name="description" content="Presentación del plan de referidos para mentores de DROPAPP. Escala tu impacto con IA." />
      </Head>
      <MentorLanding />
    </>
  );
};

export default MentoresPage;
