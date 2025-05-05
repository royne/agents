import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../../types/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Crear cliente de Supabase en el servidor
  const supabase = createPagesServerClient<Database>({ req, res });
  
  // Crear cliente de administración de Supabase
  // Esto es necesario porque el cliente normal no tiene acceso a las funciones de administración
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''
  );

  // Verificar autenticación
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('Session:', session ? `Existe - User ID: ${session.user.id}` : 'No existe');
  console.log('Cookies recibidas:', req.headers.cookie ? 'Sí' : 'No');
  
  // Verificar si estamos en modo desarrollo o producción
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Inicializar variables de control
  let isAdmin = false;
  let isSuperAdmin = false;
  let adminCompanyId = null;
  
  // Permitir bypass en desarrollo o si hay un flag especial
  const allowBypass = isDevelopment;
  
  if (!session) {
    if (allowBypass) {
      // En desarrollo o con bypass habilitado, asumimos rol de superadmin
      console.log('Sin sesión pero bypass permitido: asumiendo rol de superadmin');
      isAdmin = true;
      isSuperAdmin = true;
    } else {
      // En producción sin bypass, requerimos sesión
      console.log('Sin sesión en producción y sin bypass');
      return res.status(401).json({ 
        error: 'No autorizado - Se requiere iniciar sesión',
        details: {
          hasSession: false,
          environment: process.env.NODE_ENV,
          allowBypass: allowBypass
        }
      });
    }
  }

  try {
    // Verificar que el usuario es admin o superadmin si hay sesión
    if (session) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('user_id', session.user.id)
        .single();
      
      console.log('Perfil:', profile, 'Error:', profileError);
      
      if (profileError) {
        console.error('Error al obtener perfil:', profileError);
      }
      
      isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
      isSuperAdmin = profile?.role === 'superadmin';
      adminCompanyId = profile?.company_id;
    }
    
    // Verificar permisos de administrador
    if (!isAdmin && !allowBypass) {
      return res.status(403).json({ 
        error: 'Acceso denegado - Se requieren permisos de administrador',
        details: {
          hasSession: !!session,
          isAdmin: isAdmin,
          isSuperAdmin: isSuperAdmin,
          environment: process.env.NODE_ENV,
          allowBypass: allowBypass
        }
      });
    }

    // Obtener datos del usuario a crear
    const { email, password, name, role, company_id, company_name } = req.body;

    // Validar datos
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Validar permisos según el rol del usuario que hace la solicitud
    if (!isSuperAdmin) {
      // Los administradores normales solo pueden crear usuarios normales
      if (role !== 'user') {
        return res.status(403).json({ error: 'No tienes permisos para crear usuarios con ese rol' });
      }
      
      // Los administradores normales solo pueden crear usuarios para su propia compañía
      if (company_id && company_id !== adminCompanyId) {
        return res.status(403).json({ error: 'Solo puedes crear usuarios para tu propia compañía' });
      }
      
      // Los administradores normales no pueden crear nuevas compañías
      if (company_name) {
        return res.status(403).json({ error: 'No tienes permisos para crear nuevas compañías' });
      }
      
      // Usar la compañía del administrador
      if (!adminCompanyId) {
        return res.status(400).json({ error: 'No se pudo determinar tu compañía' });
      }
      
      // Forzar el uso de la compañía del administrador
      var companyId = adminCompanyId;
    } else {
      // Para superadmins, permitir crear o seleccionar compañía
      var companyId = company_id;
      
      if (!companyId && company_name) {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({ name: company_name })
          .select()
          .single();
        
        if (companyError) {
          return res.status(500).json({ error: `Error al crear compañía: ${companyError.message}` });
        }
        
        companyId = newCompany.id;
      }
      
      if (!companyId) {
        return res.status(400).json({ error: 'Se requiere una compañía' });
      }
    }

    // Crear usuario usando la API de administración
    // Esto no afecta la sesión actual
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError || !authData.user) {
      return res.status(500).json({ 
        error: `Error al crear usuario en Auth: ${authError?.message || 'Usuario no creado'}` 
      });
    }

    // Crear perfil para el usuario
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        user_id: authData.user.id,
        company_id: companyId,
        role,
        name,
        email
      });

    if (profileError) {
      // Si falla la creación del perfil, intentar eliminar el usuario creado
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ 
        error: `Error al crear perfil: ${profileError.message}` 
      });
    }

    // Éxito
    return res.status(200).json({ 
      success: true, 
      message: 'Usuario creado correctamente', 
      userId: authData.user.id 
    });
  } catch (err: any) {
    console.error('Error en el proceso de creación de usuario:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Error desconocido al crear usuario' 
    });
  }
}
