import DashboardLayout from '../components/layout/DashboardLayout';

export default function Agents() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Personaliza tus agentes</h1>
        <h2 className="text-2xl font-bold mb-6">Configura tu API KEY en configuración</h2>
        {/* Aquí irá el contenido del módulo de agentes */}
      </div>
    </DashboardLayout>
  );
}
