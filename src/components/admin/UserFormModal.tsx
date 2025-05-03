import React, { useState, useEffect } from 'react';
import { FaUser, FaBuilding, FaLock, FaUserTag, FaPlus } from 'react-icons/fa';
import { adminService, UserCreateData, Company as CompanyType } from '../../services/database/adminService';



interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adminCompanyId?: string; // Si es un admin normal, se usa esta compañía
  isSuperAdmin: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  adminCompanyId,
  isSuperAdmin
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [createNewCompany, setCreateNewCompany] = useState(false);
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar compañías al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadCompanies();
      resetForm();
    }
  }, [isOpen, adminCompanyId]);

  const loadCompanies = async () => {
    try {
      const companiesList = await adminService.getCompanies();
      setCompanies(companiesList);
      
      // Si es un admin normal, seleccionar automáticamente su compañía
      if (adminCompanyId) {
        setSelectedCompanyId(adminCompanyId);
      } else if (companiesList.length > 0) {
        setSelectedCompanyId(companiesList[0].id || '');
      }
    } catch (err) {
      console.error('Error al cargar compañías:', err);
      setError('No se pudieron cargar las compañías');
    }
  };

  const resetForm = () => {
    setEmail('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setRole('user');
    setNewCompanyName('');
    setCreateNewCompany(false);
    setError(null);
    setSuccess(false);
    
    // Si es admin normal, mantener su compañía seleccionada
    if (!isSuperAdmin && adminCompanyId) {
      setSelectedCompanyId(adminCompanyId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validaciones
      if (!email || !password || !name) {
        throw new Error('El correo, nombre y contraseña son obligatorios');
      }
      
      if (password !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      // Preparar datos del usuario
      const userData: UserCreateData = {
        email,
        name,
        password,
        role: isSuperAdmin ? role : 'user', // Los admin normales solo pueden crear usuarios normales
      };
      
      // Para superadmins, manejar la creación o selección de compañía
      if (isSuperAdmin) {
        if (createNewCompany) {
          // Crear nueva compañía
          if (!newCompanyName) {
            throw new Error('Debe ingresar un nombre para la nueva compañía');
          }
          userData.company_name = newCompanyName;
        } else {
          // Seleccionar compañía existente
          if (!selectedCompanyId) {
            throw new Error('Debe seleccionar una compañía');
          }
          userData.company_id = selectedCompanyId;
        }
      } else {
        // Para administradores normales, siempre usar su propia compañía
        if (!adminCompanyId) {
          throw new Error('No se pudo determinar la compañía del administrador');
        }
        userData.company_id = adminCompanyId;
      }
      
      // Crear usuario
      const result = await adminService.createUser(userData);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      setSuccess(true);
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-component rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-primary-color text-white py-4 px-6">
          <h2 className="text-xl font-bold flex items-center">
            <FaUser className="mr-2" /> Crear Nuevo Usuario
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {success ? (
            <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
              Usuario creado correctamente
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-theme-secondary text-sm font-medium mb-2">
                  <FaUser className="inline mr-2" /> Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-theme-secondary text-sm font-medium mb-2">
                  <FaUser className="inline mr-2" /> Nombre Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
                  placeholder="Nombre y apellido"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-theme-secondary text-sm font-medium mb-2">
                  <FaLock className="inline mr-2" /> Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-theme-secondary text-sm font-medium mb-2">
                  <FaLock className="inline mr-2" /> Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
                  placeholder="Repite la contraseña"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-theme-secondary text-sm font-medium mb-2">
                  <FaUserTag className="inline mr-2" /> Rol
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                  className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
                  disabled={!isSuperAdmin}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                  {isSuperAdmin && <option value="superadmin">Super Administrador</option>}
                </select>
              </div>
              
              {/* Sección de Compañía */}
              <div className="mb-4">
                <label className="block text-theme-secondary text-sm font-medium mb-2">
                  <FaBuilding className="inline mr-2" /> Compañía
                </label>
                
                {isSuperAdmin ? (
                  <>
                    {/* Opción para crear nueva compañía o seleccionar existente (solo superadmin) */}
                    <div className="flex items-center mb-2">
                      <label className="inline-flex items-center mr-4">
                        <input
                          type="radio"
                          checked={!createNewCompany}
                          onChange={() => setCreateNewCompany(false)}
                          className="form-radio text-primary-color"
                        />
                        <span className="ml-2 text-theme-secondary">Seleccionar existente</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={createNewCompany}
                          onChange={() => setCreateNewCompany(true)}
                          className="form-radio text-primary-color"
                        />
                        <span className="ml-2 text-theme-secondary">Crear nueva</span>
                      </label>
                    </div>
                    
                    {/* Selector de compañía existente o campo para nueva (solo superadmin) */}
                    {createNewCompany ? (
                      <div className="flex">
                        <input
                          type="text"
                          value={newCompanyName}
                          onChange={(e) => setNewCompanyName(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
                          placeholder="Nombre de la nueva compañía"
                        />
                      </div>
                    ) : (
                      <select
                        value={selectedCompanyId}
                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-color"
                      >
                        <option value="">Seleccionar compañía</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                ) : (
                  // Para administradores normales, mostrar solo su compañía (no editable)
                  <div className="px-4 py-2 border rounded-lg bg-theme-component-hover text-theme-secondary">
                    {companies.find(c => c.id === adminCompanyId)?.name || 'Tu compañía'}
                    <input type="hidden" value={adminCompanyId} />
                  </div>
                )}
              </div>
            </>
          )}
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-theme-border rounded-lg text-theme-secondary hover:bg-theme-component-hover transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            
            {!success && (
              <button
                type="submit"
                className="px-4 py-2 bg-primary-color text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <FaPlus className="mr-2" /> Crear Usuario
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
