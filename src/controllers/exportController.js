const ExcelJS = require('exceljs');
const EventoModel = require('../models/EventoModel');
const AsistenciaModel = require('../models/AsistenciaModel');
const RegistroExternoModel = require('../models/RegistroExternoModel');

const GRUPO_LABELS = { MANANA: 'Mañana', TARDE: 'Tarde', NOCHE: 'Noche' };
function grupoLegible(grupo) {
    return grupo ? (GRUPO_LABELS[grupo] || grupo) : '';
}

const ExportController = {

    // GET /api/eventos/:eventoId/export/excel
    async exportarExcel(req, res) {
        const { eventoId } = req.params;
        const evento = await EventoModel.obtenerPorId(eventoId);
        if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });

        const [asistenciasEstudiantes, registrosExternos] = await Promise.all([
            AsistenciaModel.obtenerPorEvento(eventoId),
            RegistroExternoModel.obtenerPorEvento(eventoId)
        ]);

        // separa "YYYY-MM-DD HH:mm:ss" o "YYYY-MM-DDTHH:mm" y nos quedamos solo con la fecha
        const soloFecha = (fechaHora) => (fechaHora ? String(fechaHora).split(/[ T]/)[0] : '');

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Politecnico Internacional - PresentePI';
        workbook.created = new Date();

        // --- Hoja de asistentes con carné (estudiantes, docentes, personal) ---
        const hojaEstudiantes = workbook.addWorksheet('Asistentes');
        hojaEstudiantes.columns = [
            { header: 'Evento', key: 'evento', width: 30 },
            { header: 'Nombre completo', key: 'nombre', width: 35 },
            { header: 'Rol', key: 'rol', width: 20 },
            { header: 'Grupo', key: 'grupo', width: 14 },
            { header: 'Sede', key: 'sede', width: 20 },
            { header: 'Programa', key: 'programa', width: 30 },
            { header: 'Documento/Código', key: 'codigo', width: 20 },
            { header: 'Fecha', key: 'fecha', width: 14 }
        ];
        hojaEstudiantes.getRow(1).font = { bold: true };
        asistenciasEstudiantes.forEach(a => {
            hojaEstudiantes.addRow({
                evento: evento.nombre,
                nombre: a.nombre_completo_snapshot,
                rol: a.rol,
                grupo: grupoLegible(a.grupo),
                sede: a.sede,
                programa: a.programa_snapshot,
                codigo: a.codigo_carne_escaneado,
                fecha: soloFecha(a.fecha_hora_registro)
            });
        });

        // --- Hoja de externos ---
        const hojaExternos = workbook.addWorksheet('Externos');
        hojaExternos.columns = [
            { header: 'Evento', key: 'evento', width: 30 },
            { header: 'Nombre completo', key: 'nombre', width: 35 },
            { header: 'Documento', key: 'documento', width: 20 },
            { header: 'Correo', key: 'correo', width: 30 },
            { header: 'Telefono', key: 'telefono', width: 18 },
            { header: 'Procedencia', key: 'procedencia', width: 25 },
            { header: 'Fecha', key: 'fecha', width: 14 }
        ];
        hojaExternos.getRow(1).font = { bold: true };
        registrosExternos.forEach(r => {
            hojaExternos.addRow({
                evento: evento.nombre,
                nombre: r.nombre_completo,
                documento: r.documento,
                correo: r.correo,
                telefono: r.telefono,
                procedencia: r.procedencia,
                fecha: soloFecha(r.fecha_hora_registro)
            });
        });

        // --- Hoja resumen ---
        const hojaResumen = workbook.addWorksheet('Resumen');
        hojaResumen.columns = [{ header: 'Dato', key: 'dato', width: 30 }, { header: 'Valor', key: 'valor', width: 30 }];
        hojaResumen.getRow(1).font = { bold: true };
        hojaResumen.addRow({ dato: 'Evento', valor: evento.nombre });
        hojaResumen.addRow({ dato: 'Sede', valor: evento.sede });
        hojaResumen.addRow({ dato: 'Lugar', valor: evento.lugar });
        hojaResumen.addRow({ dato: 'Fecha del evento', valor: soloFecha(evento.fecha_hora_inicio) });
        hojaResumen.addRow({ dato: 'Total asistentes (carné)', valor: asistenciasEstudiantes.length });
        hojaResumen.addRow({ dato: 'Total externos', valor: registrosExternos.length });
        hojaResumen.addRow({ dato: 'Total general', valor: asistenciasEstudiantes.length + registrosExternos.length });

        const nombreArchivo = `asistencia_${evento.nombre.replace(/[^a-z0-9]+/gi, '_')}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

        await workbook.xlsx.write(res);
        res.end();
    }
};

module.exports = ExportController;
