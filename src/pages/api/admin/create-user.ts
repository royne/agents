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
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  // Verificar si estamos en modo desarrollo o producción
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Permitir bypass en desarrollo o si hay un flag especial
  const allowBypass = isDevelopment || process.env.ALLOW_ADMIN_BYPASS === 'true';
  
  // Inicializar variables de control
  let isAdmin = false;
  let isSuperAdmin = false;
  let adminCompanyId = null;
  let userId = null;
  
  // Verificar autenticación por varios métodos
  let session = null;
  
  // 1. Intentar obtener sesión del servidor
  const sessionResult = await supabase.auth.getSession();
  session = sessionResult.data.session;
  
  // 2. Si no hay sesión, intentar verificar el token de autorización del encabezado
  if (!session) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        try {
          const { data } = await supabase.auth.getUser(token);
          if (data.user) {
            userId = data.user.id;
            console.log('Autenticación por token en encabezado exitosa. User ID:', userId);
          }
        } catch (error) {
          console.error('Error al verificar token en encabezado:', error);
        }
      }
    }
  }
  
  // 3. Si aún no hay sesión, intentar verificar el token en el cuerpo
  if (!session && !userId) {
    const authToken = req.body._authToken;
    if (authToken) {
      try {
        const { data } = await supabase.auth.getUser(authToken);
        if (data.user) {
          userId = data.user.id;
          console.log('Autenticación por token en cuerpo exitosa. User ID:', userId);
        }
      } catch (error) {
        console.error('Error al verificar token en cuerpo:', error);
      }
    }
  }
  
  // Registrar información de depuración
  console.log('Session:', session ? `Existe - User ID: ${session.user.id}` : 'No existe');
  console.log('User ID por token:', userId || 'No encontrado');
  console.log('Cookies recibidas:', req.headers.cookie ? 'Sí' : 'No');
  console.log('Headers de autorización:', req.headers.authorization ? 'Sí' : 'No');
  console.log('Token en cuerpo:', req.body._authToken ? 'Sí' : 'No');
  
  // Determinar si hay autenticación válida
  const isAuthenticated = !!session || !!userId;
  
  if (!isAuthenticated) {
    if (allowBypass) {
      // En desarrollo o con bypass habilitado, asumimos rol de superadmin
      console.log('Sin autenticación pero bypass permitido: asumiendo rol de superadmin');
      isAdmin = true;
      isSuperAdmin = true;
    } else {
      // En producción sin bypass, requerimos autenticación
      console.log('Sin autenticación en producción y sin bypass');
      return res.status(401).json({ 
        error: 'No autorizado - Se requiere iniciar sesión',
        details: {
          hasSession: !!session,
          hasUserId: !!userId,
          environment: process.env.NODE_ENV,
          allowBypass: allowBypass,
          headers: Object.keys(req.headers),
          bodyKeys: Object.keys(req.body)
        }
      });
    }
  }

  try {
    // Verificar que el usuario es admin o superadmin
    if (isAuthenticated) {
      // Determinar el ID de usuario a verificar
      const userIdToCheck = session?.user?.id || userId;
      
      if (userIdToCheck) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, company_id')
          .eq('user_id', userIdToCheck)
          .single();
        
        console.log('Perfil:', profile, 'Error:', profileError);
        
        if (profileError) {
          console.error('Error al obtener perfil:', profileError);
        }
        
        isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
        isSuperAdmin = profile?.role === 'superadmin';
        adminCompanyId = profile?.company_id;
      }
    }
    
    // Verificar permisos de administrador
    if (!isAdmin && !allowBypass) {
      return res.status(403).json({ 
        error: 'Acceso denegado - Se requieren permisos de administrador',
        details: {
          hasSession: !!session,
          hasUserId: !!userId,
          isAdmin: isAdmin,
          isSuperAdmin: isSuperAdmin,
          environment: process.env.NODE_ENV,
          allowBypass: allowBypass
        }
      });
    }
    
    // Eliminar el token de autenticación del cuerpo antes de procesar
    if (req.body._authToken) {
      delete req.body._authToken;
    }

    // Obtener datos del usuario a crear
    const { email, password, name, phone, role, company_id, company_name, plan } = req.body;

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
      // Plan: admin no puede asignar premium
      var userPlan = plan || 'free';
    } else {
      // Para superadmins, permitir crear o seleccionar compañía
      var companyId = company_id;
      var userPlan = plan || 'free';
      
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
    // Esto disparará el trigger on_auth_user_created en la base de datos
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        phone: phone,
        role: role,
        company_id: companyId,
        plan: userPlan
      }
    });

    if (authError || !authData.user) {
      return res.status(500).json({ 
        error: `Error al crear usuario en Auth: ${authError?.message || 'Usuario no creado'}` 
      });
    }

    // El perfil y créditos se crean automáticamente vía Trigger SQL
    // No es necesario insertar manualmente aquí

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
