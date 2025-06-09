'use client';

import React, { useState } from "react";
import { subirHorario } from "@/services/subirHorario";
import { auth } from "../../../../conexion_BD/firebase";
import { TrashIcon } from "@heroicons/react/24/outline";

// Helpers para validación
const timeToMinutes = (t) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const intervalsOverlap = (aIni, aFin, bIni, bFin) => {
  return aIni < bFin && bIni < aFin;
};

function agruparActividadesPorDia(extrasPorDia) {
  const actividadesPorDia = {
    Lun: [],
    Mar: [],
    Mié: [],
    Jue: [],
    Vie: [],
  };

  const tiempoLibreResumen = {};

  const paresActividades = [
    { inicioKey: 'desayunoInicio', finKey: 'desayunoFin', actividad: 'Desayuno' },
    { inicioKey: 'comidaInicio', finKey: 'comidaFin', actividad: 'Comida' },
    { inicioKey: 'trayectoIdaInicio', finKey: 'trayectoIdaFin', actividad: 'Trayecto Ida' },
    { inicioKey: 'trayectoVueltaInicio', finKey: 'trayectoVueltaFin', actividad: 'Trayecto Vuelta' }
  ];

for (const dia in extrasPorDia) {
  const extras = extrasPorDia[dia];

  const diaNormalizado = dia === "Sáb" ? "Sab" : dia;

  if (!["Lun", "Mar", "Mié", "Jue", "Vie", "Sab", "Dom"].includes(diaNormalizado)) {
    continue; // Ignorar días completamente desconocidos
  }

  if (["Sab", "Dom"].includes(diaNormalizado)) {
    const tiempoLibre = extras.tiempoLibre;
    if (tiempoLibre) {
      const diaCompleto = diaNormalizado === "Sab" ? "Sabado" : "Domingo";
      tiempoLibreResumen[diaCompleto] = parseInt(tiempoLibre);
    }
  } else {
    // Procesar días L-V normalmente
    paresActividades.forEach(({ inicioKey, finKey, actividad }) => {
      const inicio = extras[inicioKey];
      const fin = extras[finKey];
      if (inicio && fin) {
        actividadesPorDia[diaNormalizado].push({ actividad, inicio, fin });
      }
    });

    const despertar = extras.despertarse;
    const dormir = extras.dormirse;
    if (despertar && dormir) {
      actividadesPorDia[diaNormalizado].push({
        actividad: 'Dormirse',
        inicio: dormir,
        fin: despertar,
      });
    }
  }
}


  return {
    actividadesPorDia,
    extrasAgrupadas: tiempoLibreResumen
  };
}

const materiasIniciales = [
  { nombre: "Visión Artificial", color: "#facc15" },
  { nombre: "Teoría de la Computación", color: "#ef4444" },
  { nombre: "Procesamiento de Señales", color: "#3bcfd4" },
  { nombre: "Tecnologías del Lenguaje Natural", color: "#f59e0b" },
  { nombre: "Algoritmos Bioinspirados", color: "#133a94" },
  { nombre: "Aprendizaje de Máquina", color: "#10b9a0" },
  // { nombre: "Tareas o Entregas", color: "#888888" }
];

const dias = ["Lun", "Mar", "Mié", "Jue", "Vie"];
const diasConFines = [...dias, "Sab", "Dom"];

const camposFijos = [
  { key: 'despertarse', label: 'Despertarse' },
  { key: 'desayunoInicio', label: 'Desayunar (inicio)' },
  { key: 'desayunoFin', label: 'Desayunar (fin)' },
  { key: 'comidaInicio', label: 'Comer (inicio)' },
  { key: 'comidaFin', label: 'Comer (fin)' },
  { key: "trayectoIdaInicio", label: 'Trayecto ida (inicio)' },
  { key: "trayectoIdaFin", label: 'Trayecto ida (fin)' },
  { key: "trayectoVueltaInicio", label: 'Trayecto vuelta (inicio)' },
  { key: "trayectoVueltaFin", label: 'Trayecto vuelta (fin)' },
  { key: 'dormirse', label: 'Dormirse' },
];

export default function HorarioForms({ horarioExistente = null, onClose, onRefresh }) {
  console.log("🟢 Datos recibidos por HorarioForms:");
  console.log("horarioExistente:", horarioExistente);
  console.log("onClose:", onClose);
  console.log("onRefresh:", onRefresh);

  // Materias fijas: siempre esas 6, pero ordenables
  const [materiasFijas, setMateriasFijas] = useState(
    () => horarioExistente && horarioExistente.materias
      ? materiasIniciales
        .map((m) => ({ ...m })) // conservar orden del inicial si no hay historial
        .sort((a, b) => {
          // Si está en horarioExistente, tez el color como identificación
          const aPos = Object.keys(horarioExistente.materias).indexOf(a.nombre);
          const bPos = Object.keys(horarioExistente.materias).indexOf(b.nombre);
          return aPos - bPos;
        })
      : materiasIniciales.map(m => ({ ...m }))
  );
  // Materias solo-agregables (podrán eliminarse)
  const [materiasExtra, setMateriasExtra] = useState(
    () => horarioExistente
      ? Object.entries(horarioExistente.materias)
          .filter(([nombre]) => !materiasIniciales.find(mi => mi.nombre === nombre))
          .map(([nombre, { color }]) => ({ nombre, color }))
      : []
  );
  const [nuevaMateria, setNuevaMateria] = useState({ nombre: "", color: "#888888" });

  // Drag&drop orden
  const [dragIndex, setDragIndex] = useState(null);

  // Estado para actividades agregables con materias
  // const [datos, setDatos] = useState(() =>
  //   horarioExistente?.clases || Object.fromEntries(dias.map((dia) => [dia, []]))
  // );
  const [datos, setDatos] = useState(() => {
    if (horarioExistente?.clases) {
      // Asegurarnos que todos los días existan, incluso si no estaban en horarioExistente
      const clasesConTodosLosDias = Object.fromEntries(
        dias.map(dia => [dia, horarioExistente.clases[dia] || []])
      );
      return clasesConTodosLosDias;
    }
    return Object.fromEntries(dias.map(dia => [dia, []]));
  });
  // Estado para actividades fijas de cada día
  const [extrasPorDia, setExtrasPorDia] = useState(() => {
    if (!horarioExistente?.extras) {
      return Object.fromEntries(
        diasConFines.map((dia) => [
          dia,
          dia === "Sab" || dia === "Dom"
            ? { tiempoLibre: "" }
            : Object.fromEntries(camposFijos.map(c => [c.key, ""]))
        ])
      );
    }
    // reconstruir extrasPorDia desde actividades agrupadas
    const reconstruido = {};
    for (const dia of diasConFines) {
      if (dia === "Sab" || dia === "Dom") {
        const tiempo = horarioExistente.tiempo_fines?.[dia === "Sab" ? "Sabado" : "Domingo"];
        reconstruido[dia] = {
          tiempoLibre: tiempo?.toString() || ""
        };
      } else {
        const diaExtras = horarioExistente.extras[dia] || [];
        const extras = Object.fromEntries(camposFijos.map(c => [c.key, ""]));
        for (const act of diaExtras) {
          if (act.actividad === "Desayuno") {
            extras.desayunoInicio = act.inicio;
            extras.desayunoFin = act.fin;
          } else if (act.actividad === "Comida") {
            extras.comidaInicio = act.inicio;
            extras.comidaFin = act.fin;
          } else if (act.actividad === "Trayecto Ida") {
            extras.trayectoIdaInicio = act.inicio;
            extras.trayectoIdaFin = act.fin;
          } else if (act.actividad === "Trayecto Vuelta") {
            extras.trayectoVueltaInicio = act.inicio;
            extras.trayectoVueltaFin = act.fin;
          } else if (act.actividad === "Dormirse") {
            extras.despertarse = act.fin;
            extras.dormirse = act.inicio;
          }
        }
        reconstruido[dia] = extras;
      }
    }
    return reconstruido;
  });

  const manejarCambioMateriaFija = (idx, campo, valor) => {
    setMateriasFijas((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [campo]: valor } : m))
    );
  };

  const manejarCambioMateriaExtra = (idx, campo, valor) => {
    setMateriasExtra((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [campo]: valor } : m))
    );
  };

  // Drag and drop reorder fijo
  const onDragStart = (idx) => setDragIndex(idx);
  const onDragOver = (idx) => {
    if (dragIndex === null || dragIndex === idx) return;
    setMateriasFijas(prev => {
      const copy = prev.slice();
      const [dragItem] = copy.splice(dragIndex, 1);
      copy.splice(idx, 0, dragItem);
      setDragIndex(idx);
      return copy;
    });
  };
  const onDragEnd = () => setDragIndex(null);

  const agregarMateria = (e) => {
    e.preventDefault();
    if (nuevaMateria.nombre.trim() !== "") {
      setMateriasExtra([...materiasExtra, { ...nuevaMateria }]);
      setNuevaMateria({ nombre: "", color: "#888888" });
    }
  };

  const eliminarMateriaExtra = (idx) => {
    setMateriasExtra(materiasExtra.filter((_, i) => i !== idx));
  };

  

  const agregarActividad = (dia) => {
    setDatos((prev) => ({
      ...prev,
      [dia]: [
        ...prev[dia],
        { materia: "", horaInicio: "", horaFin: "" }
      ]
    }));
  };

  const eliminarActividad = (dia, idx) => {
    setDatos((prev) => ({
      ...prev,
      [dia]: prev[dia].filter((_, i) => i !== idx)
    }));
  };

  // Ayudante para manipular intervalos
const intervalTraslape = (aIni, aFin, bIni, bFin) => aIni < bFin && bIni < aFin;

// Validación y manejo de horarios al editar actividades de materias
const manejarCambioActividad = (dia, idx, campo, valor) => {
  setDatos((prev) => {
    const actividades = prev[dia].map((act, i) =>
      i === idx ? { ...act, [campo]: valor } : act
    );
    // Solo validamos si ya hay ambos campos
    const act = actividades[idx];
    // Validar hora fin > hora inicio
    if ((campo === "horaFin" || campo === "horaInicio") && act.horaInicio && act.horaFin) {
      const hI = timeToMinutes(act.horaInicio);
      const hF = timeToMinutes(act.horaFin);
      if (hF <= hI) {
        alert("La hora de fin debe ser mayor a la de inicio.");
        actividades[idx][campo] = ""; // Borra el valor editado
        return { ...prev, [dia]: actividades };
      }
    }
    // Validar traslape en actividades de ese día
    if (act.horaInicio && act.horaFin) {
      const hI = timeToMinutes(act.horaInicio);
      const hF = timeToMinutes(act.horaFin);
      for (let j = 0; j < actividades.length; j++) {
        if (j !== idx) {
          const o = actividades[j];
          if (o.horaInicio && o.horaFin) {
            const oI = timeToMinutes(o.horaInicio);
            const oF = timeToMinutes(o.horaFin);
            if (intervalTraslape(hI, hF, oI, oF)) {
              alert(`La actividad se traslapa con otra. Se eliminará esta entrada.`);
              // elimina la actividad editada
              return { ...prev, [dia]: actividades.filter((_, k) => k !== idx) };
            }
          }
        }
      }
    }
    return { ...prev, [dia]: actividades };
  });
};

// Validación y manejo de horarios al editar campos fijos
const manejarCambioFijo = (dia, key, valor) => {
  setExtrasPorDia(prev => {
    const next = {
      ...prev,
      [dia]: {
        ...prev[dia],
        [key]: valor
      },
    };

    // Si el valor está vacío (el usuario borró el campo), no hacer validaciones
    if (!valor) return next;

    // Validar directo campos INICIO-FIN
    if (key.endsWith('Fin')) {
      const inicioKey = key.replace('Fin', 'Inicio');
      const valorInicio = next[dia][inicioKey];

      // Evita validar si alguno no tiene formato HH:mm
      if (!/^\d{2}:\d{2}$/.test(valorInicio) || !/^\d{2}:\d{2}$/.test(valor)) {
        return next;
      }

      const ini = timeToMinutes(valorInicio);
      const fin = timeToMinutes(valor);

      if (fin <= ini) {
        alert("La hora de fin debe ser mayor a la de inicio.");
        next[dia][key] = "";
        return next;
      }
    }

    // Validar traslape con otras actividades fijas
    const intervals = [];

    // Validar pares INICIO-FIN
    for (let { key: cKey, label } of camposFijos) {
      if (cKey.endsWith("Inicio")) {
        const iniStr = next[dia][cKey];
        const finStr = next[dia][cKey.replace("Inicio", "Fin")];

        // Solo agregar si ambos tienen formato válido
        if (!/^\d{2}:\d{2}$/.test(iniStr) || !/^\d{2}:\d{2}$/.test(finStr)) continue;

        const iniV = timeToMinutes(iniStr);
        const finV = timeToMinutes(finStr);

        if (iniV !== null && finV !== null)
          intervals.push({ ini: iniV, fin: finV, label });
      }
    }

    // Validar despertar/dormirse
    const despertarStr = next[dia].despertarse;
    const dormirStr = next[dia].dormirse;

    if (/^\d{2}:\d{2}$/.test(despertarStr) && /^\d{2}:\d{2}$/.test(dormirStr)) {
      const despertar = timeToMinutes(despertarStr);
      const dormir = timeToMinutes(dormirStr);

      if (despertar !== null && dormir !== null)
        intervals.push({ ini: dormir, fin: despertar, label: "Dormirse" });
    }

    // Checar traslapes entre todos los intervalos válidos
    for (let i = 0; i < intervals.length; i++) {
      for (let j = i + 1; j < intervals.length; j++) {
        if (intervalTraslape(intervals[i].ini, intervals[i].fin, intervals[j].ini, intervals[j].fin)) {
          alert(`Las actividades "${intervals[i].label}" y "${intervals[j].label}" se traslapan. Se borra el último valor ingresado.`);
          next[dia][key] = "";
          return next;
        }
      }
    }

    return next;
  });
};


  // VALIDACIÓN AL GUARDAR
  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const dia of dias) {
      if (dia === "Sab" || dia === "Dom") continue; // Saltar fines de semana

      for (let { key, label } of camposFijos) {
        if (!extrasPorDia[dia][key]) {
          alert(`Por favor completa el campo "${label}" en ${dia}.`);
          return;
        }
      }
    }

    // Validar tiempo libre en fines de semana
    for (const dia of ["Sab", "Dom"]) {
      const tiempoLibre = extrasPorDia[dia]?.tiempoLibre;
      if (!tiempoLibre || isNaN(parseInt(tiempoLibre))) {
        alert(`Por favor ingresa el tiempo libre en ${dia}.`);
        return;
      }
    }

    for (const dia of dias) {
      for (let { key, label } of camposFijos) {
        if (key.endsWith('Inicio')) {
          const finKey = key.replace('Inicio', 'Fin');
          const horaInicio = timeToMinutes(extrasPorDia[dia][key]);
          const horaFin = timeToMinutes(extrasPorDia[dia][finKey]);
          if (horaInicio !== null && horaFin !== null && horaFin <= horaInicio) {
            alert(`En ${dia}, "${label}" debe tener hora de fin mayor a la de inicio.`);
            return;
          }
        }
      }
      const despertar = timeToMinutes(extrasPorDia[dia].despertarse);
      const dormir = timeToMinutes(extrasPorDia[dia].dormirse);
      if (despertar !== null && dormir !== null && dormir <= despertar) {
        alert(`En ${dia}, "Dormirse" debe ser después de "Despertarse".`);
        return;
      }
      for (let idx = 0; idx < datos[dia].length; idx++) {
        const act = datos[dia][idx];
        const hI = timeToMinutes(act.horaInicio);
        const hF = timeToMinutes(act.horaFin);
        if (hI !== null && hF !== null && hF <= hI) {
          alert(`En ${dia}, la actividad "${act.materia}" (#${idx + 1}) la hora de fin debe ser mayor a la de inicio.`);
          return;
        }
      }
    }
    for (const dia of dias) {

      const intervals = [];
      for (let { key, label } of camposFijos) {
        if (key.endsWith('Inicio')) {
          const inicioStr = extrasPorDia[dia][key];
          const finKey = key.replace('Inicio', 'Fin');
          const finStr = extrasPorDia[dia][finKey];

          // Validar formato completo antes de convertir
          if (!/^\d{2}:\d{2}$/.test(inicioStr) || !/^\d{2}:\d{2}$/.test(finStr)) {
            continue; // todavía se está escribiendo o valor incompleto
          }

          const ini = timeToMinutes(inicioStr);
          const fin = timeToMinutes(finStr);

          if (fin <= ini) {
            alert(`En ${dia}, "${label}" debe tener hora de fin mayor a la de inicio.`);
            return;
          }

          intervals.push({ ini, fin, label });
        }
      }


      for (const dia of ["Sab", "Dom"]) {
        const tiempo = extrasPorDia[dia]?.tiempoLibre;
        if (!tiempo || isNaN(parseInt(tiempo))) {
          alert(`Por favor ingresa el tiempo libre en ${dia}.`);
          return;
        }
      }

      const despertar = timeToMinutes(extrasPorDia[dia].despertarse);
      const dormir = timeToMinutes(extrasPorDia[dia].dormirse);

      if (despertar !== null && dormir !== null) {
        // Si "dormir" es anterior a "despertar" (ej. 23:00 < 6:44), suma 24 horas al fin
        const finSueño = dormir < despertar ? dormir + 1440 : dormir;
        intervals.push({ ini: dormir, fin: finSueño, label: "Dormirse" });
      }

      for (let idx = 0; idx < datos[dia].length; idx++) {
        const act = datos[dia][idx];
        const hI = timeToMinutes(act.horaInicio);
        const hF = timeToMinutes(act.horaFin);
        if (hI !== null && hF !== null) {
          intervals.push({ ini: hI, fin: hF, label: `Actividad "${act.materia}" (#${idx + 1})` });
        }
      }
      for (let i = 0; i < intervals.length; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
          if (intervalsOverlap(intervals[i].ini, intervals[i].fin, intervals[j].ini, intervals[j].fin)) {
            alert(
              `En ${dia}, las actividades "${intervals[i].label}" y "${intervals[j].label}" se traslapan.`
            );
            return;
          }
        }
      }
    }

    // Agrupamos materias fijas y extra
    const materiasAll = [...materiasFijas, ...materiasExtra];
    const materiasObj = {};
    // for (const m of materiasAll) materiasObj[m.nombre] = { color: m.color };
    // Asignar importancia a materias fijas (ordenadas, 1 = más importante)
    materiasFijas.forEach((m, idx) => {
      materiasObj[m.nombre] = {
        color: m.color,
        importancia: materiasFijas.length - idx // de 6 a 1
      };
    });

    // Materias extra no tienen importancia asignada
    materiasExtra.forEach((m) => {
      materiasObj[m.nombre] = { color: m.color };
    });
    // Añadimos la materia de Tareas o Entregas
    // Añadir la materia "Tareas o Entregas" si no existe
    if (!materiasObj["Eventos"]) {
      materiasObj["Eventos"] = { color: "#888888" };
    }

    const { actividadesPorDia, extrasAgrupadas } = agruparActividadesPorDia(extrasPorDia); 

    console.log("extrasAgrupadas:", extrasAgrupadas);

    // await subirHorario(auth.currentUser.uid, materiasObj, datos, extrasAgrupadas);
    await subirHorario(auth.currentUser.uid, materiasObj, datos, actividadesPorDia, extrasAgrupadas);

    if (onRefresh) onRefresh();
    if (onClose) onClose();
  };

  // Materias disponibles (para select)
  const opcionesMaterias = [...materiasFijas, ...materiasExtra];

  // FORMATOS
  return (
    <>
      <h2 style={{ textAlign: "center"}} className="text-2xl mt-10 font-semibold">Materias fijas</h2>
      <p className="flex justify-center items-center mb-8">(ordena según dificultad: 6 = más difícil)</p>
      <div className="px-8">
        {materiasFijas.map((mat, idx) => (
          <div
            key={mat.nombre}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={e => { e.preventDefault(); onDragOver(idx); }}
            onDragEnd={onDragEnd}
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              marginBottom: 6,
              background: dragIndex === idx ? "#ddeeff" : "#f9fafb",
              border: "1px solid #ccc",
              padding: "8px",
              borderRadius: "6px",
              cursor: "grab"
            }}
            className="hover:bg-gray-100 transition-colors duration-200"
          >
            <span
              title="Arrastra para reordenar"
              style={{
                fontSize: "20px",
                cursor: "grab",
                userSelect: "none"
              }}
            >
              ☰
            </span>

            <span style={{
              fontWeight: 700, width: 20,
              color: "#388", textAlign: "right"
            }}>{materiasFijas.length - idx}</span>
            <input
              type="text"
              value={mat.nombre}
              onChange={e => manejarCambioMateriaFija(idx, "nombre", e.target.value)}
              required
              style={{ flex: 2, padding: 4 }}
              placeholder="Nombre de la materia"
              readOnly // Solo se puede editar color
            />
            <input
              type="color"
              value={mat.color}
              onChange={e => manejarCambioMateriaFija(idx, "color", e.target.value)}
              style={{ width: 34, height: 34, border: "none" }}
            />
          </div>
        ))}
      </div>
      <div style={{ margin: "2.5rem 0 1rem 0", fontWeight: "bold", textAlign: "center" }}>Materias o actividades extras (puedes agregar y quitar)</div>
      {materiasExtra.map((mat, idx) => (
        <div key={idx} style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: 6 }} className="px-8">
          <input
            type="text"
            value={mat.nombre}
            onChange={e => manejarCambioMateriaExtra(idx, "nombre", e.target.value)}
            required
            style={{ flex: 2, padding: 4 }}
            placeholder="Nombre de la materia"
          />
          <input
            type="color"
            value={mat.color}
            onChange={e => manejarCambioMateriaExtra(idx, "color", e.target.value)}
            style={{ width: 34, height: 34, border: "none" }}
          />
          <button
            type="button"
            onClick={() => eliminarMateriaExtra(idx)}
            style={{
              background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 31, height: 31, fontSize: 18, cursor: "pointer"
            }}
            className="flex items-center justify-center"
            >
              <TrashIcon className="h-4" />
            </button>
        </div>
      ))}
      <form onSubmit={agregarMateria} style={{ display: "flex", gap: 6, alignItems: "center"}} className="px-8">
        <input
          type="text"
          value={nuevaMateria.nombre}
          onChange={e => setNuevaMateria(m => ({ ...m, nombre: e.target.value }))}
          placeholder="Agregar materia"
          style={{ flex: 2, padding: 4 }}
          required
        />
        <input
          type="color"
          value={nuevaMateria.color}
          onChange={e => setNuevaMateria(m => ({ ...m, color: e.target.value }))}
          style={{ width: 34, height: 34, border: "none" }}
        />
        <button type="submit"
          style={{ background: "#3b82f6", color: "white", border: "none", padding: "0 10px", borderRadius: 5, fontWeight: "bold", fontSize: 18, cursor: "pointer" }}>
          +
        </button>
      </form>
      <hr style={{ margin: "2rem 0" }} />
      <h2 style={{ marginBottom: "1rem", textAlign: "center" }} className="text-2xl font-semibold">Horario Semanal</h2>   
      <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto" }}>
      {dias.map(dia => (
        <fieldset key={dia} style={{ border: "1px solid #bbb", marginBottom: 28, borderRadius: 9, padding: 18 }}>
          <legend style={{ fontWeight: "bold", fontSize: 18 }}>{dia}</legend>

          {/* Campos fijos */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
            {camposFijos.map(({ key, label }) => (
              <div key={key} style={{ minWidth: 140, flex: 1 }}>
                <label htmlFor={`${dia}-${key}`} style={{ display: "block", fontWeight: "600", marginBottom: 3 }}>{label}:</label>
                <input
                  type="time"
                  id={`${dia}-${key}`}
                  value={extrasPorDia[dia][key]}
                  onChange={e => manejarCambioFijo(dia, key, e.target.value)}
                  style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                  required
                />
              </div>
            ))}
          </div>

          {/* Actividades extra/materias */}
          <h4 style={{ margin: "16px 0 8px 0" }}>Materias/actividades programadas</h4>
          {datos[dia].map((actividad, idx) => (
            <div key={idx} style={{ display: "flex", gap: 13, alignItems: "center", marginBottom: 7, background: "#f3f3f36b", padding: 9, borderRadius: 5 }}>
              <div style={{ flex: 2 }}>
                <label htmlFor={`${dia}-materia-${idx}`} style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}>Materia:</label>
                <select
                  id={`${dia}-materia-${idx}`}
                  value={actividad.materia}
                  onChange={e => manejarCambioActividad(dia, idx, "materia", e.target.value)}
                  required
                  style={{ width: "100%", padding: "5px", fontSize: "14px" }}
                >
                  <option value="">Selecciona</option>
                  {opcionesMaterias.map(m => (
                    <option value={m.nombre} key={m.nombre}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor={`${dia}-horaInicio-${idx}`} style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}>Hora inicio:</label>
                <input
                  type="time"
                  id={`${dia}-horaInicio-${idx}`}
                  value={actividad.horaInicio}
                  onChange={e => manejarCambioActividad(dia, idx, "horaInicio", e.target.value)}
                  style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor={`${dia}-horaFin-${idx}`} style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}>Hora fin:</label>
                <input
                  type="time"
                  id={`${dia}-horaFin-${idx}`}
                  value={actividad.horaFin}
                  onChange={e => manejarCambioActividad(dia, idx, "horaFin", e.target.value)}
                  style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => eliminarActividad(dia, idx)}
                style={{
                  marginTop: "1rem",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                <div className="flex items-center justify-center">
                  <TrashIcon className="h-4 mr-2" />
                  <p>Eliminar</p>
                </div>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => agregarActividad(dia)}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            + Agregar actividad
          </button>
        </fieldset>
      ))}

      {/* Espacio para tiempo libre en fines de semana */}
      <fieldset style={{ border: "1px solid #bbb", marginBottom: 28, borderRadius: 9, padding: 18 }}>
        <legend style={{ fontWeight: "bold", fontSize: 18 }}>Tiempo libre en fines de semana</legend>
        <p>Ingresa el tiempo libre en horas en cada día de la semana</p>

        {/* Sábado */}
        <div className="my-4">
          <label htmlFor="sabado-tiempoLibre" className="font-semibold">Tiempo libre en Sábado (horas):</label>
          <input 
            type="number"
            id="sabado-tiempoLibre"
            min={0}
            max={24}
            placeholder="Sábado (horas)"
            className="mb-3 rounded-md border border-gray-300"
            style={{ width: "100%", padding: "6px", fontSize: "14px" }}
            onChange={(e) => manejarCambioFijo("Sab", "tiempoLibre", e.target.value)}
            value={extrasPorDia["Sab"]?.tiempoLibre || ""}
            required
          />
        </div>

        {/* Domingo */}
        <div className="my-4">
          <label htmlFor="domingo-tiempoLibre" className="font-semibold">Tiempo libre en Domingo (horas):</label>
          <input 
            type="number"
            id="domingo-tiempoLibre"
            min={0}
            max={24}
            placeholder="Domingo (horas)"
            className="mb-3 rounded-md border border-gray-300"
            style={{ width: "100%", padding: "6px", fontSize: "14px" }}
            onChange={(e) => manejarCambioFijo("Dom", "tiempoLibre", e.target.value)}
            value={extrasPorDia["Dom"]?.tiempoLibre || ""}
            required
          />
        </div>
      </fieldset>


      {/* Boton de guardado */}
      <button
        type="submit"
        style={{
          display: "block",
          margin: "2rem auto",
          backgroundColor: "#10b981",
          color: "white",
          fontWeight: "bold",
          fontSize: "16px",
          border: "none",
          borderRadius: "6px",
          padding: "0.75rem 2rem",
          cursor: "pointer"
        }}
      >
        Guardar horario
      </button>
    </form>
    </>
  );
}
