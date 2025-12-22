import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Head from 'next/head';
import TaskList from '../../components/planning/tasks/TaskList';
import PageHeader from '../../components/common/PageHeader';



export default function TasksPage() {
  return (
    <DashboardLayout>
      <Head>
        <title>DROPLAB - Lista de Tareas</title>
      </Head>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Lista de Tareas"
          description="Gestiona tus tareas pendientes y completa tu lista de pendientes."
          backLink="/planning"
        />

        <TaskList />
      </div>
    </DashboardLayout>
  );
}
