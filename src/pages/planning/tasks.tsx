import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Head from 'next/head';
import Link from 'next/link';
import TaskList from '../../components/planning/tasks/TaskList';



export default function TasksPage() {
  return (
    <DashboardLayout>
      <Head>
        <title>Unlocked Ecom - Lista de Tareas</title>
      </Head>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl mb-2 border-l-4 border-primary-color pl-3">Lista de Tareas</h1>
            <p className="text-theme-secondary">
              Gestiona tus tareas pendientes y completa tu lista de pendientes.
            </p>
          </div>
          <Link href="/planning">
            <button className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors">
              Volver
            </button>
          </Link>
        </div>

        <TaskList />
      </div>
    </DashboardLayout>
  );
}
