# Configuración de Supabase Local

Este documento explica cómo configurar y utilizar Supabase localmente para desarrollo.

## Requisitos previos

- Docker y Docker Compose
- Node.js y npm
- Supabase CLI

## Instalación de Docker

Docker es necesario para ejecutar Supabase localmente:

```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

Después de instalar Docker, cierra sesión y vuelve a iniciar sesión para que los cambios de grupo surtan efecto.

## Instalación de Supabase CLI

### Usando curl (Linux/macOS)

```bash
curl -s https://api.github.com/repos/supabase/cli/releases/latest | \
    grep "browser_download_url.*$(uname -s)_$(uname -m).tar.gz" | \
    cut -d : -f 2,3 | \
    tr -d \" | \
    wget -qi - -O - | \
    tar -xz -C /usr/local/bin
```

### Usando npm

```bash
npm install -g supabase
```

## Inicialización de Supabase en tu proyecto

```bash
# Navega a la carpeta de tu proyecto
cd /path/to/your/project

# Inicializa Supabase
supabase init
```

## Iniciar Supabase localmente

```bash
supabase start
```

Cuando ejecutes este comando, Supabase CLI iniciará todos los servicios necesarios y te proporcionará:
- URL local (generalmente http://localhost:54321)
- Clave anónima para la API
- Clave de servicio (para operaciones administrativas)
- URL del Studio (interfaz gráfica para administrar tu base de datos)

## Configuración de variables de entorno

### Para desarrollo local (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-clave-anon-local>
```

### Para producción (.env.production)

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-clave-anon-produccion>
```

## Acceso a Supabase Studio local

Después de iniciar Supabase localmente, puedes acceder a la interfaz de Studio en:
http://localhost:54323

Esta interfaz te permite:
- Administrar tablas y datos
- Gestionar autenticación
- Configurar almacenamiento
- Crear y probar funciones Edge
- Ejecutar consultas SQL

## Detener Supabase local

Cuando hayas terminado de trabajar, puedes detener los servicios con:

```bash
supabase stop
```

## Migración de esquema

Para crear migraciones basadas en los cambios en tu base de datos local:

```bash
supabase db diff --schema public --file nombre-de-migracion
```

## Aplicar migraciones

```bash
supabase db push
```

## Más información

Para más detalles, consulta la [documentación oficial de Supabase CLI](https://supabase.com/docs/reference/cli).
