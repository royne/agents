import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Head from 'next/head';
import Link from 'next/link';
import TeamAssignments from '../../components/planning/team/TeamAssignments';

export default function TeamPage() {
  return (
    <DashboardLayout>
      <Head>
        <title>Unlocked Ecom - Asignaciones de Equipo</title>
      </Head>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl mb-2 border-l-4 border-primary-color pl-3">Asignaciones de Equipo</h1>
            <p className="text-theme-secondary">
              Asigna tareas a miembros del equipo y realiza seguimiento de su progreso.
            </p>
          </div>
          <Link href="/planning">
            <button className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors">
              Volver
            </button>
          </Link>
        </div>

        <TeamAssignments />
      </div>
    </DashboardLayout>
  );
}
