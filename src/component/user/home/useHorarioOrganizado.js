import { useEffect, useState } from 'react';
import { horas24 } from '@/utils/constants';
import { parseISO, format } from 'date-fns';

export function useHorarioOrganizado(horarioExistente, proximas) {
    const [horarioHoy, setHorarioHoy] = useState([]);

    useEffect(() => {
        if (!horarioExistente || !proximas) return;

        // Fecha fija para pruebas (2025-06-06 - viernes)
        // const fechaPrueba = new Date('2025-06-06T00:00:00');
        
        const hoy = new Date();;
        const fechaHoyStr = format(hoy, 'yyyy-MM-dd');
        console.log("Fecha de prueba:", fechaHoyStr);
        
        const diaActual = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][hoy.getDay()];
        console.log("Día actual:", diaActual);
        
        const clases = horarioExistente.clases?.[diaActual] || [];
        const extras = horarioExistente.extras?.[diaActual] || [];

        // Filtrar tareas para hoy - comparando solo la fecha (sin hora)
        const tareasHoy = proximas.filter(t => {
            try {
                // Comparar solo las fechas (ignorando la hora)
                return t.fecha === fechaHoyStr && !t.completada && t.hora;
            } catch (e) {
                console.error("Error procesando fecha de tarea:", t, e);
                return false;
            }
        });

        console.log("Tareas para hoy encontradas:", tareasHoy);

        const resultado = horas24.map(horaBloque => {
            const [horaStr] = horaBloque.split(':');
            const horaNum = parseInt(horaStr, 10);
            
            const actividades = [
                // Clases
                ...clases.filter(c => {
                    const [inicioH] = c.horaInicio?.split(':').map(Number) || [];
                    const [finH] = c.horaFin?.split(':').map(Number) || [];
                    return horaNum >= inicioH && horaNum < finH;
                }).map(c => ({
                    tipo: 'clase',
                    titulo: c.materia,
                    horaInicio: c.horaInicio,
                    horaFin: c.horaFin,
                    color: '#3b82f6'
                })),
                
                // Extras
                ...extras.filter(e => {
                    const [inicioH] = e.inicio?.split(':').map(Number) || [];
                    const [finH] = e.fin?.split(':').map(Number) || [];
                    return horaNum >= inicioH && horaNum < finH;
                }).map(e => ({
                    tipo: 'extra',
                    titulo: e.actividad,
                    horaInicio: e.inicio,
                    horaFin: e.fin,
                    color: '#8b5cf6'
                })),
                
                // Tareas
                ...tareasHoy.filter(t => {
                    if (!t.hora) return false;
                    const [tareaH] = t.hora.split(':').map(Number);
                    return tareaH === horaNum;
                }).map(t => ({
                    tipo: 'tarea',
                    titulo: t.titulo,
                    descripcion: t.descripcion,
                    materia: t.materia,
                    horaInicio: t.hora,
                    horaFin: t.hora,
                    color: '#f59e0b',
                    datosCompletos: t,
                    horaExacta: t.hora,
                    state: t.state
                }))
            ];

            return {
                hora: horaBloque,
                actividades: actividades.sort((a, b) => {
                    if (a.tipo === 'tarea' && b.tipo === 'tarea') {
                        return a.horaExacta.localeCompare(b.horaExacta);
                    }
                    const orden = { tarea: 1, clase: 2, extra: 3 };
                    return orden[a.tipo] - orden[b.tipo];
                })
            };
        });

        console.log("Horario organizado resultante:", resultado);
        setHorarioHoy(resultado);
    }, [horarioExistente, proximas]);

    return horarioHoy;
}