// components/CalendarView.js
'use client';
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ModalForm from './ModalForm';
import ModalDetalleEvento from './ModalDetalleEvento';
import { bajarHorario } from '@/services/bajarHorario';
import { auth } from '../../../../conexion_BD/firebase';
import Loading from '@/component/loading/loading';
import { bajarTareas } from '@/services/bajarTareas';

const CalendarView = () => {
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tieneHorario, setTieneHorario] = useState(false);
  const [horarioExistente, setHorarioExistente] = useState(null);
  const [horarioExistenteRecivido, setHorarioExistenteRecivido] = useState(null); 
  const [cargando, setCargando] = useState(true);
  const [showDetalle, setShowDetalle] = useState(false);
  const [tareasUsuario, setTareasUsuario] = useState([]);

  const diaSemanaMap = {
    0: "Dom", 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb"
  };

    const diaNombreToIndex = {
    "Dom": 0,
    "Lun": 1,
    "Mar": 2,
    "Mié": 3,
    "Jue": 4,
    "Vie": 5,
    "Sáb": 6
    };

  useEffect(() => {
    if (!horarioExistente) return;

    const { clases = {}, extras = {}, materias = {} } = horarioExistente;
    const calendarEvents = [];

    const fechaActual = new Date();
    const fechaFin = new Date(fechaActual.getFullYear() + 1, 11, 31);

    let semana = 0;
    while (true) {
      const lunesDeSemana = getStartOfWeek(semana);
      if (lunesDeSemana > fechaFin) break;

      // Clases
      Object.entries(clases).forEach(([dia, eventos]) => {
        eventos.forEach(({ horaInicio, horaFin, materia }) => {
          const diaIndex = diaNombreToIndex[dia];
          const fecha = nextWeekdayDate(diaIndex, semana);
          calendarEvents.push({
            title: materia,
            start: `${fecha}T${horaInicio}`,
            end: `${fecha}T${horaFin}`,
            color: materias[materia]?.color || '#999',
            extendedProps: {
              importancia: materias[materia]?.importancia || null,
              tipo: 'clase',
            }
          });
        });
      });

      // Extras
      Object.entries(extras).forEach(([dia, eventos]) => {
        eventos.forEach(({ inicio, fin, actividad }) => {
          const diaIndex = diaNombreToIndex[dia];
          const fecha = nextWeekdayDate(diaIndex, semana);
          calendarEvents.push({
            title: actividad,
            start: `${fecha}T${inicio}`,
            end: `${fecha}T${fin}`,
            color: '#ccc',
            extendedProps: {
              tipo: 'extra',
            }
          });
        });
      });

      semana++;
    }

    // Tareas del usuario
    tareasUsuario.forEach(({ titulo, descripcion, fecha, materia, hora, duracion, dificultad }) => {
      calendarEvents.push({
        title: titulo,
        description: descripcion,
        start: fecha,
        allDay: true,
        color: materias[materia]?.color || '#000',
        extendedProps: {
          materia,
          hora: hora || '',
          tipo: 'tarea',
          description: descripcion,
          duracion, // Nuevo campo
          dificultad // Nuevo campo
        }
      });
    });

    setActivities(calendarEvents);
  }, [horarioExistente, tareasUsuario]);


  const fetchHorario = async () => {
    setCargando(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setCargando(false);
        return;
      }
      const tareasDelUsuario = await bajarTareas(userId);
          setTareasUsuario(tareasDelUsuario);
          const isObjectEmpty = (obj) => {
            return Object.values(obj).every(
              value => typeof value === 'object' && value !== null 
                ? Object.keys(value).length === 0 
                : !value
            );
          };
      console.log("Tareas del usuario:", tareasDelUsuario);
      const horario = await bajarHorario(userId);
      console.log("Horario obtenido en calendario:", horario);
      setHorarioExistenteRecivido(horario); 

      if (horario && !isObjectEmpty(horario)) {
        const horarioClonado = JSON.parse(JSON.stringify(horario)); 
        const extras = horarioClonado.extras;

        for (const dia in extras) {
          const nuevasActividades = [];

          extras[dia].forEach((actividad) => {
            if (
              actividad.actividad === "Dormirse" &&
              actividad.inicio > actividad.fin
            ) {
              // Dividir en dos: Dormirse y Despertarse
              nuevasActividades.push(
                {
                  actividad: "Dormirse",
                  inicio: actividad.inicio,
                  fin: "23:59",
                },
                {
                  actividad: "Despertarse",
                  inicio: "00:00",
                  fin: actividad.fin,
                }
              );
            } else {
              // Normal, no dividir
              nuevasActividades.push(actividad);
            }
          });

          extras[dia] = nuevasActividades;
        }

        setTieneHorario(true);
        setHorarioExistente(horarioClonado); // este sí se usa en el calendario
      } else {
        setTieneHorario(false);
        setHorarioExistente(null);
      }
    } catch (error) {
      console.error("Error al obtener el horario:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchHorario();
  }, []);


    const getStartOfWeek = (weeksAhead = 0) => {
        const now = new Date();
        const day = now.getDay(); // 0 (Domingo) a 6 (Sábado)
        const diffToMonday = (day === 0 ? -6 : 1) - day; // Lunes como base
        const monday = new Date(now);
        monday.setDate(now.getDate() + diffToMonday + weeksAhead * 7);
        monday.setHours(0, 0, 0, 0);
        return monday;
        };

        const nextWeekdayDate = (targetDay, weeksAhead = 0) => {
        const monday = getStartOfWeek(weeksAhead);
        const date = new Date(monday);
        date.setDate(monday.getDate() + (targetDay - 1)); // Lunes=1, Martes=2,...
        return date.toISOString().split('T')[0];
        };

    const handleDateClick = (arg) => {
        setSelectedDate(arg.dateStr);
        setSelectedEvent(null);
        setShowModal(true);
    };

    const handleEventClick = (clickInfo) => {
      const tipo = clickInfo.event.extendedProps?.tipo;

      if (tipo === 'clase' || tipo === 'extra') {
        setSelectedEvent({
          title: clickInfo.event.title,
          start: clickInfo.event.startStr,
          end: clickInfo.event.endStr,
          extendedProps: clickInfo.event.extendedProps
        });
        setShowDetalle(true);
      } else {
        setSelectedEvent({
          title: clickInfo.event.title,
          description: clickInfo.event.extendedProps?.description || '',
          hora: clickInfo.event.extendedProps?.hora || clickInfo.event.hora || '',
          start: clickInfo.event.startStr,
          end: clickInfo.event.endStr,
          allDay: clickInfo.event.allDay,
          extendedProps: {
            ...clickInfo.event.extendedProps,
            duracion: clickInfo.event.extendedProps?.duracion || '', // Nuevo campo
            dificultad: clickInfo.event.extendedProps?.dificultad || '' // Nuevo campo
          }
        });
        setShowModal(true);
      }
    };

    const handleSave = (newEvent) => {
        if (selectedEvent) {
        // Edit existing
        const updatedEvents = activities.map((ev) =>
            ev.title === selectedEvent.title && ev.start === selectedEvent.startStr
            ? newEvent
            : ev
        );
        setActivities(updatedEvents);
        } else {
        // Add new
        setActivities([...activities, newEvent]);
        }
        setShowModal(false);
    };

    const handleDelete = () => {
        if (selectedEvent) {
        setActivities(activities.filter(ev => ev.title !== selectedEvent.title || ev.start !== selectedEvent.startStr));
        setShowModal(false);
        }
        window.location.reload(); 
    };

  if (cargando) return <Loading />;

  return (
    <div className="w-full h-full p-4">
      <div className="w-full h-full">
        <FullCalendar
          height="auto"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          editable={true}
          selectable={true}
          events={activities}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }}
        />
      </div>

     {/* Mostrar Modales */}
    {showModal && (
      <ModalForm
        date={selectedDate}
        event={{
          title: selectedEvent?.title,
          startStr: selectedEvent?.start,
          extendedProps: {
            materia: selectedEvent?.extendedProps?.materia,
            description: selectedEvent?.extendedProps?.description,
            hora: selectedEvent?.hora,
            duracion: selectedEvent?.extendedProps?.duracion, // Nuevo campo
            dificultad: selectedEvent?.extendedProps?.dificultad // Nuevo campo
          },
          hora: selectedEvent?.hora,
          allDay: selectedEvent?.allDay
        }}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        materias={horarioExistente?.materias || {}}
      />
    )}

    {showDetalle && selectedEvent && (
      <ModalDetalleEvento
        event={selectedEvent}
        onClose={() => setShowDetalle(false)}
      />
    )}


    </div>
  );
};

export default CalendarView;
