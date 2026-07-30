const ExcelJS = require('exceljs');
const EventoModel = require('../models/EventoModel');
const AsistenciaModel = require('../models/AsistenciaModel');
const RegistroExternoModel = require('../models/RegistroExternoModel');

const ExportController = {

    // GET /api/eventos/:eventoId/export/excel
    async exportarExcel(req, res) {
        const { eventoId } = req.params;
        const evento = EventoModel.obtenerPorId(eventoId);
        if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });

        const asistenciasEstudiantes = AsistenciaModel.obtenerPorEvento(eventoId);
        const registrosExternos = RegistroExternoModel.obtenerPorEvento(eventoId);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Bienestar - Politecnico Internacional';
        workbook.created = new Date();

        // --- Hoja de estudiantes ---
        const hojaEstudiantes = workbook.addWorksheet('Estudiantes');
        hojaEstudiantes.columns = [
            { header: 'Nombre completo', key: 'nombre', width: 35 },
            { header: 'Programa', key: 'programa', width: 30 },
            { header: 'Codigo de carne', key: 'codigo', width: 20 },
            { header: 'Fecha y hora de registro', key: 'fecha', width: 25 }
        ];
        hojaEstudiantes.getRow(1).font = { bold: true };
        asistenciasEstudiantes.forEach(a => {
            hojaEstudiantes.addRow({
                nombre: a.nombre_completo_snapshot,
                programa: a.programa_snapshot,
                codigo: a.codigo_carne_escaneado,
                fecha: a.fecha_hora_registro
            });
        });

        // --- Hoja de externos ---
        const hojaExternos = workbook.addWorksheet('Externos');
        hojaExternos.columns = [
            { header: 'Nombre completo', key: 'nombre', width: 35 },
            { header: 'Documento', key: 'documento', width: 20 },
            { header: 'Correo', key: 'correo', width: 30 },
            { header: 'Telefono', key: 'telefono', width: 18 },
            { header: 'Procedencia', key: 'procedencia', width: 25 },
            { header: 'Fecha y hora de registro', key: 'fecha', width: 25 }
        ];
        hojaExternos.getRow(1).font = { bold: true };
        registrosExternos.forEach(r => {
            hojaExternos.addRow({
                nombre: r.nombre_completo,
                documento: r.documento,
                correo: r.correo,
                telefono: r.telefono,
                procedencia: r.procedencia,
                fecha: r.fecha_hora_registro
            });
        });

        // --- Hoja resumen ---
        const hojaResumen = workbook.addWorksheet('Resumen');
        hojaResumen.columns = [{ header: 'Dato', key: 'dato', width: 30 }, { header: 'Valor', key: 'valor', width: 30 }];
        hojaResumen.getRow(1).font = { bold: true };
        hojaResumen.addRow({ dato: 'Evento', valor: evento.nombre });
        hojaResumen.addRow({ dato: 'Lugar', valor: evento.lugar });
        hojaResumen.addRow({ dato: 'Fecha inicio', valor: evento.fecha_hora_inicio });
        hojaResumen.addRow({ dato: 'Total estudiantes', valor: asistenciasEstudiantes.length });
        hojaResumen.addRow({ dato: 'Total externos', valor: registrosExternos.length });
        hojaResumen.addRow({ dato: 'Total general', valor: asistenciasEstudiantes.length + registrosExternos.length });

        const nombreArchivo = `asistencia_evento_${eventoId}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

        await workbook.xlsx.write(res);
        res.end();
    }
};

module.exports = ExportController;
