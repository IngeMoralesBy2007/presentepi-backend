# Backend - PresentePI (App de Asistencia Bienestar)

API REST en Node.js + Express + PostgreSQL (arquitectura MVC) para el registro de
asistencia a eventos del área de Bienestar del Politécnico Internacional.

## Base de datos: PostgreSQL (Supabase)

Este backend usa **PostgreSQL** en vez de un archivo local, para que la
asistencia registrada durante un evento **no se pierda** si el servicio se
reinicia (algo que sí pasaba con SQLite en el disco efímero de Render).

### 1. Crear el proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) → crea una cuenta → "New project"
2. Ponle un nombre (ej: `presentepi`) y una contraseña de base de datos (guárdala)
3. Espera 1-2 minutos a que se aprovisione

### 2. Obtener la cadena de conexión
1. En el proyecto de Supabase: **Settings** (ícono de engranaje) → **Database**
2. Busca la sección **"Connection string"** → pestaña **"URI"**
3. Copia la cadena (se ve así: `postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-...supabase.com:6543/postgres`)
4. Reemplaza `[YOUR-PASSWORD]` por la contraseña que pusiste en el paso 1

### 3. Configurar la variable de entorno
Esta cadena va en la variable `DATABASE_URL`:
- **Local:** crea un archivo `.env` en la raíz del proyecto con:
  ```
  DATABASE_URL=postgresql://postgres.xxxxx:tu-password@aws-...supabase.com:6543/postgres
  ```
- **Render:** en tu servicio → pestaña **"Environment"** → **"Add Environment Variable"**
  → key `DATABASE_URL`, value la cadena completa

Las tablas se crean solas la primera vez que arranca el servidor (no hay que
correr ninguna migración a mano).

## Instalación y ejecución local

```bash
npm install
npm start
```

El servidor queda en `http://localhost:3000` (o el puerto de la variable de entorno `PORT`).

Para desarrollo con recarga automática:

```bash
npm run dev
```

## Estructura (MVC)

```
server.js                  → punto de entrada (espera a que Postgres esté listo antes de arrancar)
src/app.js                 → configuración de Express y montaje de rutas
src/config/db.js           → conexión a Postgres (pg Pool) + creación de tablas
src/models/                → acceso a datos (Estudiante, Evento, Asistencia, RegistroExterno)
src/controllers/           → lógica de negocio de cada recurso
src/routes/                → definición de endpoints
```

## Endpoints principales

### Estudiantes
- `GET  /api/estudiantes` — listar todos
- `GET  /api/estudiantes/:id` — obtener por id
- `GET  /api/estudiantes/carne/:codigo` — buscar por código de carné (usado al escanear)
- `POST /api/estudiantes` — crear
- `PUT  /api/estudiantes/:id` — actualizar
- `DELETE /api/estudiantes/:id` — eliminar

### Eventos
- `GET  /api/eventos` — listar (filtro opcional `?estado=ACTIVO`)
- `GET  /api/eventos/:id` — obtener por id
- `POST /api/eventos` — crear
- `PUT  /api/eventos/:id` — actualizar
- `PATCH /api/eventos/:id/estado` — cambiar estado (`PROGRAMADO`, `ACTIVO`, `CERRADO`)
- `DELETE /api/eventos/:id` — eliminar (rechaza si ya tiene asistencia registrada)

### Asistencia por escaneo de carné
- `GET  /api/eventos/:eventoId/asistencias` — listar asistencia de un evento
- `POST /api/eventos/:eventoId/asistencias/escaneo` — registrar asistencia por código de barras
  body: `{ "codigoCarne": "1044629517" }`
- `POST /api/eventos/:eventoId/asistencias/datos` — registrar asistencia por datos leídos del carné (OCR)
  body: `{ "nombreCompleto": "...", "documento": "...", "programa": "..." }`

### Registro externo (personas fuera de la universidad)
- `GET  /api/eventos/:eventoId/externos` — listar registros externos de un evento
- `POST /api/eventos/:eventoId/externos` — registrar
  body: `{ "nombreCompleto": "...", "documento": "...", "correo": "...", "telefono": "...", "procedencia": "..." }`

### Exportación / auditoría
- `GET /api/eventos/:eventoId/export/excel` — descarga un Excel con 3 hojas
  (Estudiantes, Externos, Resumen), con el nombre del evento y la fecha (sin hora)

## Notas para el despliegue (Render)

- Comando de build: `npm install`
- Comando de start: `npm start`
- Variable de entorno obligatoria: `DATABASE_URL` (la cadena de conexión de Supabase)
- Variable de entorno opcional: `PORT` (Render la asigna automáticamente)
- Las fechas de registro se guardan en hora de Colombia (America/Bogota, UTC-5)
  sin importar en qué huso horario esté el servidor.
