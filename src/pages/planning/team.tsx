import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Head from 'next/head';
import TeamAssignments from '../../components/planning/team/TeamAssignments';
import PageHeader from '../../components/common/PageHeader';

export default function TeamPage() {
  return (
    <DashboardLayout>
      <Head>
        <title>DROPAPP - Asignaciones de Equipo</title>
      </Head>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Asignaciones de Equipo"
          description="Asigna tareas a miembros del equipo y realiza seguimiento de su progreso."
          backLink="/planning"
        />

        <TeamAssignments />
      </div>
    </DashboardLayout>
  );
}
