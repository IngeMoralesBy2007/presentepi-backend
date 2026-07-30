const Database = require('better-sqlite3');
const path = require('path');

// Archivo local de SQLite (se crea automaticamente si no existe)
const dbPath = path.join(__dirname, '..', '..', 'bienestar.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- Creacion de tablas ---

db.exec(`
CREATE TABLE IF NOT EXISTS estudiantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_carne TEXT UNIQUE NOT NULL,
    nombre_completo TEXT NOT NULL,
    documento TEXT,
    programa TEXT,
    ciclo TEXT,
    correo TEXT,
    telefono TEXT,
    activo INTEGER NOT NULL DEFAULT 1
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    fecha_hora_inicio TEXT NOT NULL,
    fecha_hora_fin TEXT,
    lugar TEXT,
    responsable TEXT,
    cupo_maximo INTEGER NOT NULL DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'PROGRAMADO'
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS asistencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id INTEGER NOT NULL,
    estudiante_id INTEGER NOT NULL,
    codigo_carne_escaneado TEXT,
    nombre_completo_snapshot TEXT,
    programa_snapshot TEXT,
    fecha_hora_registro TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (evento_id) REFERENCES eventos(id),
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    UNIQUE (evento_id, estudiante_id)
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS registros_externos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id INTEGER NOT NULL,
    nombre_completo TEXT NOT NULL,
    documento TEXT,
    correo TEXT,
    telefono TEXT,
    procedencia TEXT,
    fecha_hora_registro TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (evento_id) REFERENCES eventos(id)
);
`);

module.exports = db;
