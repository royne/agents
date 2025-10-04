import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaUsers, FaEdit, FaTrash, FaUserPlus, FaUserShield, FaUser, FaSync, FaSlidersH } from 'react-icons/fa';
import Head from 'next/head';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAppContext } from '../../contexts/AppContext';
import UserFormModal from '../../components/admin/UserFormModal';
import { adminService, UserWithProfile } from '../../services/database/adminService';
import PageHeader from '../../components/common/PageHeader';
import { DEFAULT_PLAN_MODULES, ModuleKey } from '../../constants/plans';



export default function UsersManagement() {
  const { isSuperAdmin, authData } = useAppContext();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [moduleSelections, setModuleSelections] = useState<Record<ModuleKey, 'default' | 'on' | 'off'>>({} as any);

  const ALL_MODULES: { key: ModuleKey; label: string }[] = [
    { key: 'agents', label: 'Agentes' },
    { key: 'profitability', label: 'Rentabilidad' },
    { key: 'campaign-control', label: 'Control de Campañas' },
    { key: 'calculator', label: 'Calculadora' },
    { key: 'logistic', label: 'Logística' },
    { key: 'planning', label: 'Planeación' },
    { key: 'data-analysis', label: 'Análisis de Datos' },
    { key: 'dbmanager', label: 'DB Manager' },
    { key: 'chat', label: 'Master Chat (requiere admin)' },
    { key: 'settings', label: 'Configuración' },
    // 'admin' no es configurable por módulos (solo por rol)
  ];

  const openModulesModal = (user: UserWithProfile) => {
    setSelectedUser(user);
    const plan = user.plan || 'basic';
    const baseModules = new Set(DEFAULT_PLAN_MODULES[plan]);
    const selections: Record<ModuleKey, 'default' | 'on' | 'off'> = {} as any;
    ALL_MODULES.forEach(({ key }) => {
      selections[key] = 'default';
    });
    // Aplicar overrides existentes
    const overrides = (user.modules_override || {}) as Partial<Record<ModuleKey, boolean>>;
    Object.entries(overrides).forEach(([k, v]) => {
      const key = k as ModuleKey;
      selections[key] = v ? 'on' : 'off';
    });
    setModuleSelections(selections);
    setIsModulesModalOpen(true);
  };

  const handleSaveOverrides = async () => {
    if (!selectedUser) return;
    const plan = selectedUser.plan || 'basic';
    const baseModules = new Set(DEFAULT_PLAN_MODULES[plan]);

    // Construir overrides: solo incluir claves donde selection !== 'default'
    const overrides: Partial<Record<ModuleKey, boolean>> = {};
    (Object.keys(moduleSelections) as ModuleKey[]).forEach((key) => {
      const sel = moduleSelections[key];
      if (sel === 'on') overrides[key] = true;
      if (sel === 'off') overrides[key] = false;
    });

    // Si no hay overrides, enviar null para limpiar
    const payload = Object.keys(overrides).length === 0 ? null : overrides;
    const ok = await adminService.updateUserModulesOverride(selectedUser.id, payload);
    if (!ok) {
      alert('No se pudo actualizar los módulos');
      return;
    }
    setIsModulesModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Si es superadmin, obtener todos los usuarios
      // Si es admin normal, obtener solo los usuarios de su compañía
      const usersList = isSuperAdmin()
        ? await adminService.getAllUsers()
        : await adminService.getAllUsers(authData?.company_id);
        
      setUsers(usersList);
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para obtener el icono según el rol
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <FaUserShield className="text-red-500" />;
      case 'admin':
        return <FaUserShield className="text-yellow-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  // Función para obtener la clase de color según el rol
  const getRoleClass = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <ProtectedRoute adminOnly={true}>
      <DashboardLayout>
        <Head>
          <title>Unlocked Ecom - Gestión de Usuarios</title>
        </Head>
        <div>
          <PageHeader
            title={
              <>
                <FaUsers className="inline-block mr-2 mb-1" />
                Gestión de Usuarios
              </>
            }
            description="Administra los usuarios y sus permisos en la plataforma."
            backLink="/admin"
          />

          <div className="bg-theme-component p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-theme-primary">Usuarios Registrados</h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-primary-color text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FaUserPlus className="mr-2" />
                Nuevo Usuario
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color mx-auto"></div>
                <p className="mt-4 text-theme-secondary">Cargando usuarios...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                <p>{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-theme-border">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Empresa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Fecha de Creación</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-theme-secondary uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-theme-component-hover transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-theme-primary">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-theme-primary">{user.name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">{getRoleIcon(user.role)}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getRoleClass(user.role)}`}>
                              {user.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-theme-secondary">{user.company_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className="px-2 py-1 border rounded bg-theme-component text-theme-primary"
                            value={user.plan || 'basic'}
                            onChange={async (e) => {
                              const newPlan = e.target.value as 'basic' | 'tester' | 'premium';
                              // Si no es superadmin, evitar premium
                              if (!isSuperAdmin() && newPlan === 'premium') {
                                alert('Solo el Superadmin puede asignar Premium');
                                return;
                              }
                              const ok = await adminService.updateUserPlan(user.id, newPlan);
                              if (!ok) {
                                alert('No se pudo actualizar el plan');
                              } else {
                                fetchUsers();
                              }
                            }}
                          >
                            <option value="basic">Basic</option>
                            <option value="tester">Tester</option>
                            <option value="premium" disabled={!isSuperAdmin()}>Premium {(!isSuperAdmin()) ? '(Solo Superadmin)' : ''}</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {/* Botón de edición, disponible para todos */}
                          <button 
                            className="text-primary-color hover:text-blue-700 mr-3"
                            onClick={() => alert('Funcionalidad de edición en desarrollo')}
                          >
                            <FaEdit className="inline" /> Editar
                          </button>
                          {/* Botón para overrides de módulos, solo Superadmin */}
                          {isSuperAdmin() && (
                            <button
                              className="text-green-500 hover:text-green-400 mr-3"
                              title="Editar módulos del usuario"
                              onClick={() => openModulesModal(user)}
                            >
                              <FaSlidersH className="inline" /> Módulos
                            </button>
                          )}
                          {/* Botón de eliminación, con restricciones */}
                          {(isSuperAdmin() || (user.role !== 'admin' && user.role !== 'superadmin')) && (
                            <button 
                              className="text-red-500 hover:text-red-700"
                              onClick={async () => {
                                if (window.confirm(`¿Estás seguro de eliminar al usuario ${user.email}?`)) {
                                  const success = await adminService.deleteUser(user.id);
                                  if (success) {
                                    fetchUsers();
                                  } else {
                                    alert('Error al eliminar usuario');
                                  }
                                }
                              }}
                            >
                              <FaTrash className="inline" /> Eliminar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Botón para recargar usuarios */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-theme-component text-theme-secondary rounded-lg hover:bg-theme-component-hover transition-colors flex items-center"
            >
              <FaSync className="mr-2" />
              Recargar Usuarios
            </button>
          </div>
        </div>

        {/* Modal para crear usuarios */}
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchUsers}
          isSuperAdmin={isSuperAdmin()}
          adminCompanyId={authData?.company_id}
        />

        {/* Modal para overrides de módulos */}
        {isModulesModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-theme-component p-6 rounded-lg w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-theme-primary">Módulos del usuario</h2>
                <button
                  onClick={() => {
                    setIsModulesModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="text-theme-secondary hover:text-theme-primary"
                >
                  ×
                </button>
              </div>
              <p className="text-theme-secondary mb-4">
                Selecciona para cada módulo si quieres usar el valor del plan (Por defecto), o forzar habilitar (ON) o forzar deshabilitar (OFF).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-auto pr-1">
                {ALL_MODULES.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between bg-theme-component-hover rounded p-3">
                    <div className="text-theme-primary text-sm mr-3">{label}</div>
                    <select
                      className="px-2 py-1 border rounded bg-theme-component text-theme-primary"
                      value={moduleSelections[key] || 'default'}
                      onChange={(e) => setModuleSelections((prev) => ({ ...prev, [key]: e.target.value as 'default' | 'on' | 'off' }))}
                    >
                      <option value="default">Por defecto</option>
                      <option value="on">Forzar ON</option>
                      <option value="off">Forzar OFF</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 rounded bg-theme-component hover:bg-theme-component-hover text-theme-secondary"
                  onClick={() => {
                    setIsModulesModalOpen(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 rounded bg-primary-color text-white hover:opacity-90"
                  onClick={handleSaveOverrides}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
