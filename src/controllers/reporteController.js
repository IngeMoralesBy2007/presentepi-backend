const ExcelJS = require('exceljs');
const EventoModel = require('../models/EventoModel');
const AsistenciaModel = require('../models/AsistenciaModel');
const RegistroExternoModel = require('../models/RegistroExternoModel');

function leerFiltros(query) {
    return {
        lugar: query.sede || query.lugar || undefined,
        nombre: query.nombre || undefined,
        fechaDesde: query.fechaDesde || undefined,
        fechaHasta: query.fechaHasta || undefined
    };
}

// Trae los eventos que cumplen el filtro, con el conteo de asistentes de cada uno.
async function obtenerEventosConConteo(filtros) {
    const eventos = await EventoModel.buscarConFiltros(filtros);

    return Promise.all(eventos.map(async (evento) => {
        const totalEstudiantes = await AsistenciaModel.contarPorEvento(evento.id);
        const totalExternos = await RegistroExternoModel.contarPorEvento(evento.id);
        return {
            ...evento,
            total_estudiantes: totalEstudiantes,
            total_externos: totalExternos,
            total_general: totalEstudiantes + totalExternos
        };
    }));
}

const ReporteController = {

    // GET /api/reportes/eventos?sede=...&nombre=...&fechaDesde=...&fechaHasta=...
    async consultarEventos(req, res) {
        const filtros = leerFiltros(req.query);
        const eventos = await obtenerEventosConConteo(filtros);
        res.json(eventos);
    },

    // GET /api/reportes/export?sede=...&nombre=...&fechaDesde=...&fechaHasta=...
    // Excel con 2 hojas: Resumen (un evento por fila) y Detalle (cada asistente, de todos los eventos filtrados)
    async exportarExcel(req, res) {
        const filtros = leerFiltros(req.query);
        const eventos = await obtenerEventosConConteo(filtros);
        const soloFecha = (fechaHora) => (fechaHora ? String(fechaHora).split(/[ T]/)[0] : '');

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Politecnico Internacional - PresentePI';
        workbook.created = new Date();

        // --- Hoja resumen: un evento por fila ---
        const hojaResumen = workbook.addWorksheet('Resumen por evento');
        hojaResumen.columns = [
            { header: 'Evento', key: 'evento', width: 32 },
            { header: 'Sede', key: 'sede', width: 25 },
            { header: 'Fecha', key: 'fecha', width: 14 },
            { header: 'Estado', key: 'estado', width: 14 },
            { header: 'Asistentes (carné)', key: 'totalEstudiantes', width: 18 },
            { header: 'Externos', key: 'totalExternos', width: 12 },
            { header: 'Total', key: 'total', width: 10 }
        ];
        hojaResumen.getRow(1).font = { bold: true };
        eventos.forEach((e) => {
            hojaResumen.addRow({
                evento: e.nombre,
                sede: e.lugar,
                fecha: soloFecha(e.fecha_hora_inicio),
                estado: e.estado,
                totalEstudiantes: e.total_estudiantes,
                totalExternos: e.total_externos,
                total: e.total_general
            });
        });

        // --- Hoja detalle: cada asistente de cada evento filtrado ---
        const hojaDetalle = workbook.addWorksheet('Detalle de asistentes');
        hojaDetalle.columns = [
            { header: 'Evento', key: 'evento', width: 30 },
            { header: 'Sede', key: 'sede', width: 22 },
            { header: 'Fecha evento', key: 'fechaEvento', width: 14 },
            { header: 'Tipo', key: 'tipo', width: 14 },
            { header: 'Nombre completo', key: 'nombre', width: 32 },
            { header: 'Rol', key: 'rol', width: 20 },
            { header: 'Programa', key: 'programa', width: 25 },
            { header: 'Documento/Código', key: 'codigo', width: 18 },
            { header: 'Fecha registro', key: 'fechaRegistro', width: 14 }
        ];
        hojaDetalle.getRow(1).font = { bold: true };

        for (const evento of eventos) {
            const asistencias = await AsistenciaModel.obtenerPorEvento(evento.id);
            asistencias.forEach((a) => {
                hojaDetalle.addRow({
                    evento: evento.nombre,
                    sede: evento.lugar,
                    fechaEvento: soloFecha(evento.fecha_hora_inicio),
                    tipo: 'Carné Politécnico',
                    nombre: a.nombre_completo_snapshot,
                    rol: a.rol,
                    programa: a.programa_snapshot,
                    codigo: a.codigo_carne_escaneado,
                    fechaRegistro: soloFecha(a.fecha_hora_registro)
                });
            });

            const externos = await RegistroExternoModel.obtenerPorEvento(evento.id);
            externos.forEach((r) => {
                hojaDetalle.addRow({
                    evento: evento.nombre,
                    sede: evento.lugar,
                    fechaEvento: soloFecha(evento.fecha_hora_inicio),
                    tipo: 'Externo',
                    nombre: r.nombre_completo,
                    rol: 'EXTERNO',
                    programa: r.procedencia,
                    codigo: r.documento,
                    fechaRegistro: soloFecha(r.fecha_hora_registro)
                });
            });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="reporte_asistencia_presentepi.xlsx"');
        await workbook.xlsx.write(res);
        res.end();
    }
};

module.exports = ReporteController;
