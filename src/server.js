require('dotenv').config();
const app = require('./src/app');
const { initSchema } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await initSchema();
        console.log('Conexion a Postgres OK, tablas listas.');
    } catch (err) {
        console.error('No se pudo conectar/preparar la base de datos:', err.message);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Servidor de Bienestar corriendo en http://localhost:${PORT}`);
    });
}

start();
