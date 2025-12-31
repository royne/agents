import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { FaUser, FaEnvelope, FaBuilding, FaEdit, FaKey, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { adminService } from '../../services/database/adminService';

interface UserProfileProps {
  showEditButton?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ showEditButton = true }) => {
  const { authData } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    company_name: string;
    role: string;
    avatar_url?: string;
  }>({
    name: authData?.name || '',
    email: '',
    company_name: '',
    role: authData?.role || '',
    avatar_url: undefined
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    if (authData?.isAuthenticated) {
      fetchUserProfile();
    }
  }, [authData]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener datos de autenticación
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No hay usuario autenticado');
        return;
      }
      
      // 2. Obtener perfil directamente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      
      if (profileError) {
        console.error('Error al obtener perfil:', profileError);
        throw profileError;
      }
      
      // 3. Obtener empresa si existe
      let companyName = 'No asignada';
      if (profile.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', profile.company_id)
          .single();
        
        if (company) {
          companyName = company.name;
        }
      }
      
      // 4. Actualizar estado
      const userData = {
        name: profile.name || '',
        email: user.email || '',
        company_name: companyName,
        role: profile.role || '',
        avatar_url: profile.avatar_url
      };
      
      setUserProfile(userData);
      
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      
      // Obtener la sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setMessage({ text: 'No hay sesión activa', type: 'error' });
        return;
      }
      
      // Actualizar el perfil
      const { error } = await supabase
        .from('profiles')
        .update({ name: userProfile.name })
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      
      setMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
      setIsEditing(false);
      
      // Actualizar el contexto
      if (authData) {
        const updatedAuthData = {
          ...authData,
          name: userProfile.name
        };
        localStorage.setItem('auth_data', JSON.stringify(updatedAuthData));
      }
      
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setMessage({ text: 'Error al actualizar el perfil', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      
      // Validar que las contraseñas coincidan
      if (passwords.new !== passwords.confirm) {
        setMessage({ text: 'Las contraseñas nuevas no coinciden', type: 'error' });
        return;
      }
      
      // Cambiar la contraseña
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });
      
      if (error) throw error;
      
      setMessage({ text: 'Contraseña actualizada correctamente', type: 'success' });
      setIsChangingPassword(false);
      setPasswords({ current: '', new: '', confirm: '' });
      
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      setMessage({ text: 'Error al cambiar la contraseña', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Super Administrador';
      case 'admin':
        return 'Administrador';
      default:
        return 'Usuario';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="bg-theme-component rounded-lg shadow-lg p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-theme-primary">Perfil de Usuario</h2>
        {showEditButton && !isEditing && !isChangingPassword && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-primary-color hover:opacity-80 flex items-center"
          >
            <FaEdit className="mr-1" /> Editar
          </button>
        )}
      </div>

      {message.text && (
        <div className={`p-3 rounded mb-4 ${
          message.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 
          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
        }`}>
          {message.text}
        </div>
      )}
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <FaSpinner className="animate-spin text-primary-color text-2xl" />
          <span className="ml-2 text-theme-secondary">Cargando información...</span>
        </div>
      )}

      {!loading && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar y plan */}
          <div className="flex flex-col items-center">
            {userProfile.avatar_url ? (
              <img 
                src={userProfile.avatar_url} 
                alt={userProfile.name} 
                className="w-24 h-24 rounded-full object-cover border-2 border-primary-color"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-color flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(userProfile.name)}
              </div>
            )}
            <div className="mt-3 text-center">
              <span className="bg-primary-color text-white px-3 py-1 rounded-full text-sm">
                {getRoleLabel(userProfile.role)}
              </span>
            </div>
          </div>

        {/* Información del usuario */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-theme-secondary mb-1">Nombre</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="bg-primary-color hover:opacity-90 text-white px-4 py-2 rounded flex items-center"
                >
                  <FaCheck className="mr-1" /> Guardar
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchUserProfile(); // Recargar datos originales
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center"
                >
                  <FaTimes className="mr-1" /> Cancelar
                </button>
              </div>
            </div>
          ) : isChangingPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-theme-secondary mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
                />
              </div>
              <div>
                <label className="block text-theme-secondary mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
                />
              </div>
              <div>
                <label className="block text-theme-secondary mb-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={loading || !passwords.current || !passwords.new || !passwords.confirm}
                  className="bg-primary-color hover:opacity-90 text-white px-4 py-2 rounded flex items-center disabled:opacity-50"
                >
                  <FaCheck className="mr-1" /> Guardar
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswords({ current: '', new: '', confirm: '' });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center"
                >
                  <FaTimes className="mr-1" /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaUser className="text-primary-color mr-3" />
                  <div>
                    <span className="text-theme-secondary text-sm">Nombre</span>
                    <p className="text-theme-primary font-medium">{userProfile.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="text-primary-color mr-3" />
                  <div>
                    <span className="text-theme-secondary text-sm">Email</span>
                    <p className="text-theme-primary font-medium">
                      {userProfile.email ? userProfile.email : 'No disponible'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaBuilding className="text-primary-color mr-3" />
                  <div>
                    <span className="text-theme-secondary text-sm">Empresa</span>
                    <p className="text-theme-primary font-medium">
                      {userProfile.company_name ? userProfile.company_name : 'No asignada'}
                    </p>
                  </div>
                </div>
                {showEditButton && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="mt-4 text-primary-color hover:opacity-80 flex items-center"
                  >
                    <FaKey className="mr-1" /> Cambiar Contraseña
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default UserProfile;
