// components/CalendarView.js
'use client';
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from './ModalForm'; // Componente de formulario
// import { formatISO, set } from 'date-fns';

const CalendarView = () => {
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const materias = {
    "Algoritmos bioinspirados": { "color": "#133a94", "prioridad": 1 },
    "Aprendizaje Máquina": { "color": "#10b9a0", "prioridad": 2 },
    "Procesamiento de señales": { "color": "#3bcfd4", "prioridad": 4 },
    "Tecnologías de Lenguaje Natural": { "color": "#f59e0b", "prioridad": 5 },
    "Teoría de la computación": { "color": "#ef4444", "prioridad": 6 },
    "Visión Artificial": { "color": "#facc15", "prioridad": 3 }
  };

  const clases = {
    "Lun": [
      { "horaInicio": "10:00", "horaFin": "11:00", "materia": "Teoría de la computación" },
      { "horaInicio": "11:00", "horaFin": "12:00", "materia": "Procesamiento de señales" }
    ],
    "Mar": [],
    "Mié": [],
    "Jue": [],
    "Vie": [{ "horaInicio": "11:00", "horaFin": "12:00", "materia": "Procesamiento de señales" }]
  };

  const extras = {
    "Lun": [
      { "inicio": "07:44", "fin": "08:00", "actividad": "Desayuno" },
      { "inicio": "14:00", "fin": "15:00", "actividad": "Comida" },
      { "inicio": "08:45", "fin": "09:00", "actividad": "Trayecto Ida" },
      { "inicio": "16:00", "fin": "16:30", "actividad": "Trayecto Vuelta" },
      { "inicio": "06:44", "fin": "23:00", "actividad": "Dormirse" }
    ],
    "Mar": [
      { "inicio": "07:44", "fin": "08:00", "actividad": "Desayuno" },
      { "inicio": "14:00", "fin": "15:00", "actividad": "Comida" },
      { "inicio": "08:45", "fin": "09:00", "actividad": "Trayecto Ida" },
      { "inicio": "16:00", "fin": "16:30", "actividad": "Trayecto Vuelta" },
      { "inicio": "06:44", "fin": "23:00", "actividad": "Dormirse" }
    ],
    "Mié": [
      { "inicio": "07:44", "fin": "08:00", "actividad": "Desayuno" },
      { "inicio": "14:00", "fin": "15:00", "actividad": "Comida" },
      { "inicio": "08:45", "fin": "09:00", "actividad": "Trayecto Ida" },
      { "inicio": "16:00", "fin": "16:30", "actividad": "Trayecto Vuelta" },
    //   { "inicio": "06:44", "fin": "23:00", "actividad": "Dormirse" }
        { "inicio": "00:00", "fin": "06:44", "actividad": "Dormirse" },
        { "inicio": "23:00", "fin": "23:59", "actividad": "Dormirse" }
    ],
    "Jue": [
      { "inicio": "07:44", "fin": "08:00", "actividad": "Desayuno" },
      { "inicio": "14:00", "fin": "15:00", "actividad": "Comida" },
      { "inicio": "08:45", "fin": "09:00", "actividad": "Trayecto Ida" },
      { "inicio": "16:00", "fin": "16:30", "actividad": "Trayecto Vuelta" },
      { "inicio": "23:00", "fin": "06:44", "actividad": "Dormirse" }
    ],
    "Vie": [
      { "inicio": "07:44", "fin": "08:00", "actividad": "Desayuno" },
      { "inicio": "14:00", "fin": "15:00", "actividad": "Comida" },
      { "inicio": "08:45", "fin": "09:00", "actividad": "Trayecto Ida" },
      { "inicio": "16:00", "fin": "16:30", "actividad": "Trayecto Vuelta" },
      { "inicio": "06:44", "fin": "23:00", "actividad": "Dormirse" }
    ]
  };

  const tareas = {
    "Algoritmos bioinspirados": [
      {
        "fechaEntrega": "2023-10-15",
        "descripcion": "Proyecto de optimización",
        "tiempoDuracion": 1600,
        "difucultad": 7,
        "entregado": false,
        "calificacion": null
      }
    ]
  };

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
    const calendarEvents = [];
    const fechaActual = new Date();
    const fechaFin = new Date(fechaActual.getFullYear() + 5, 11, 31); // Hasta 5 años más

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
            color: materias[materia]?.color || '#999'
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
            color: '#ccc'
            });
        });
        });

        semana++;
    }

    // Tareas (no repetitivas)
    Object.entries(tareas).forEach(([materia, tareasMateria]) => {
        tareasMateria.forEach(({ fechaEntrega, descripcion }) => {
        calendarEvents.push({
            title: `Tarea: ${descripcion}`,
            start: fechaEntrega,
            allDay: true,
            color: materias[materia]?.color || '#000'
        });
        });
    });

    setActivities(calendarEvents);
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
    setSelectedEvent(clickInfo.event);
    setSelectedDate(null);
    setShowModal(true);
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
  };

  return (
    <div className="w-full h-full p-4">
      <div className="w-full h-full">
        <FullCalendar
        //   height="100%"
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

      {showModal && (
        <Modal
          date={selectedDate}
          event={selectedEvent}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default CalendarView;
