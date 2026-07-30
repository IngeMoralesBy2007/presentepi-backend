# Backend - App de Asistencia Bienestar

API REST en Node.js + Express + SQLite (arquitectura MVC) para el registro de
asistencia a eventos del área de Bienestar del Politécnico Internacional.

## Instalación y ejecución local

```bash
npm install
npm start
```

El servidor queda en `http://localhost:3000` (o el puerto de la variable de entorno `PORT`).
La base de datos SQLite (`bienestar.db`) se crea automáticamente al iniciar.

Para desarrollo con recarga automática:

```bash
npm run dev
```

## Estructura (MVC)

```
server.js                  → punto de entrada
src/app.js                 → configuración de Express y montaje de rutas
src/config/db.js           → conexión SQLite + creación de tablas
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
- `DELETE /api/eventos/:id` — eliminar

### Asistencia por escaneo de carné
- `GET  /api/eventos/:eventoId/asistencias` — listar asistencia de un evento
- `POST /api/eventos/:eventoId/asistencias/escaneo` — registrar asistencia
  body: `{ "codigoCarne": "1044629517" }`

### Registro externo (personas fuera de la universidad)
- `GET  /api/eventos/:eventoId/externos` — listar registros externos de un evento
- `POST /api/eventos/:eventoId/externos` — registrar
  body: `{ "nombreCompleto": "...", "documento": "...", "correo": "...", "telefono": "...", "procedencia": "..." }`

### Exportación / auditoría
- `GET /api/eventos/:eventoId/export/excel` — descarga un Excel con 3 hojas
  (Estudiantes, Externos, Resumen)

## Notas para el despliegue (Render)

- Comando de build: `npm install`
- Comando de start: `npm start`
- Variable de entorno opcional: `PORT` (Render la asigna automáticamente)
- SQLite se guarda como archivo local `bienestar.db`. En Render, si usas un
  plan gratuito, el disco no es persistente entre despliegues — para producción
  real conviene añadir un "Persistent Disk" de Render y apuntar `dbPath` a esa ruta.
