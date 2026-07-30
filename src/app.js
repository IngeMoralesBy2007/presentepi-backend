const express = require('express');
const cors = require('cors');

const estudianteRoutes = require('./routes/estudianteRoutes');
const eventoRoutes = require('./routes/eventoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Chequeo rapido de salud del servicio (util para Render/Vercel)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', servicio: 'bienestar-backend' });
});

app.use('/api/estudiantes', estudianteRoutes);
app.use('/api/eventos', eventoRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generico
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
