import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaUsers, FaEdit, FaTrash, FaUserPlus, FaUserShield, FaUser, FaSync } from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAppContext } from '../../contexts/AppContext';
import UserFormModal from '../../components/admin/UserFormModal';
import { adminService, UserWithProfile } from '../../services/database/adminService';



export default function UsersManagement() {
  const { isSuperAdmin, authData } = useAppContext();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-theme-primary mb-2">
                <FaUsers className="inline-block mr-2 mb-1" />
                Gestión de Usuarios
              </h1>
              <p className="text-theme-secondary">
                Administra los usuarios y sus permisos en la plataforma.
              </p>
            </div>
            <Link href="/admin">
              <button className="px-4 py-2 bg-theme-component text-theme-secondary rounded-lg hover:bg-theme-component-hover transition-colors">
                Volver al Panel
              </button>
            </Link>
          </div>

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
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Empresa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Fecha de Creación</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-theme-secondary uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-theme-component-hover transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-theme-primary">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">{getRoleIcon(user.role)}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getRoleClass(user.role)}`}>
                              {user.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-theme-secondary">{user.company_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-theme-secondary">
                          {new Date(user.created_at).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {/* Botón de edición, disponible para todos */}
                          <button 
                            className="text-primary-color hover:text-blue-700 mr-3"
                            onClick={() => alert('Funcionalidad de edición en desarrollo')}
                          >
                            <FaEdit className="inline" /> Editar
                          </button>
                          
                          {/* Botón de eliminación, con restricciones */}
                          {(isSuperAdmin() || 
                           (user.role !== 'admin' && user.role !== 'superadmin')) && (
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
