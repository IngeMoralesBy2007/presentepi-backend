const { Pool } = require('pg');

// Cadena de conexion a Supabase (o cualquier Postgres) via variable de entorno.
// En Render se configura como DATABASE_URL en la pestaña "Environment".
// Supabase requiere SSL, por eso el rejectUnauthorized:false (su certificado
// no siempre coincide con la cadena de confianza por defecto de Node).
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    keepAlive: true, // reutiliza la conexion TCP en vez de renegociarla en cada consulta
    max: 10
});

pool.on('error', (err) => {
    console.error('Error inesperado en el pool de Postgres:', err.message);
});

// --- Creacion de tablas (se ejecuta al arrancar; CREATE TABLE IF NOT EXISTS es seguro repetir) ---
async function initSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS estudiantes (
            id SERIAL PRIMARY KEY,
            codigo_carne TEXT UNIQUE NOT NULL,
            nombre_completo TEXT NOT NULL,
            documento TEXT,
            programa TEXT,
            ciclo TEXT,
            correo TEXT,
            telefono TEXT,
            activo BOOLEAN NOT NULL DEFAULT true
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS eventos (
            id SERIAL PRIMARY KEY,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            fecha_hora_inicio TEXT NOT NULL,
            fecha_hora_fin TEXT,
            lugar TEXT,
            sede TEXT,
            responsable TEXT,
            cupo_maximo INTEGER NOT NULL DEFAULT 0,
            estado TEXT NOT NULL DEFAULT 'PROGRAMADO'
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS asistencias (
            id SERIAL PRIMARY KEY,
            evento_id INTEGER NOT NULL REFERENCES eventos(id),
            estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id),
            codigo_carne_escaneado TEXT,
            nombre_completo_snapshot TEXT,
            programa_snapshot TEXT,
            rol TEXT NOT NULL DEFAULT 'ESTUDIANTE',
            sede TEXT,
            fecha_hora_registro TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD HH24:MI:SS')),
            UNIQUE (evento_id, estudiante_id)
        );
    `);

    // Migraciones seguras: si las tablas ya existian de antes (Supabase es persistente),
    // aseguramos que tengan las columnas nuevas aunque se hayan creado sin ellas.
    await pool.query(`ALTER TABLE asistencias ADD COLUMN IF NOT EXISTS rol TEXT NOT NULL DEFAULT 'ESTUDIANTE';`);
    await pool.query(`ALTER TABLE asistencias ADD COLUMN IF NOT EXISTS sede TEXT;`);
    await pool.query(`ALTER TABLE eventos ADD COLUMN IF NOT EXISTS sede TEXT;`);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS registros_externos (
            id SERIAL PRIMARY KEY,
            evento_id INTEGER NOT NULL REFERENCES eventos(id),
            nombre_completo TEXT NOT NULL,
            documento TEXT,
            correo TEXT,
            telefono TEXT,
            procedencia TEXT,
            fecha_hora_registro TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD HH24:MI:SS'))
        );
    `);
}

module.exports = { pool, initSchema };
