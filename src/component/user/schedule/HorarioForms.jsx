'use client';

import React, { useState } from "react";
import { subirHorario } from "@/services/subirHorario";
import { auth } from "../../../../conexion_BD/firebase";

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
    Vie: []
  };

  const paresActividades = [
    { inicioKey: 'desayunoInicio', finKey: 'desayunoFin', actividad: 'Desayuno' },
    { inicioKey: 'comidaInicio', finKey: 'comidaFin', actividad: 'Comida' },
    { inicioKey: 'trayectoIdaInicio', finKey: 'trayectoIdaFin', actividad: 'Trayecto Ida' },
    { inicioKey: 'trayectoVueltaInicio', finKey: 'trayectoVueltaFin', actividad: 'Trayecto Vuelta' }
  ];

  for (const dia in extrasPorDia) {
    const extras = extrasPorDia[dia];

    paresActividades.forEach(({ inicioKey, finKey, actividad }) => {
      const inicio = extras[inicioKey];
      const fin = extras[finKey];

      if (inicio && fin) {
        actividadesPorDia[dia].push({
          actividad,
          inicio,
          fin
        });
      }
    });

    const despertar = extras.despertarse;
    const dormir = extras.dormirse;

    if (despertar && dormir) {
      actividadesPorDia[dia].push({
        actividad: 'Dormirse',
        inicio: despertar,
        fin: dormir
      });
    }
  }

  return actividadesPorDia;
}

const materiasIniciales = [
  { nombre: "Visión Artificial", color: "#facc15" },
  { nombre: "Teoría de la computación", color: "#ef4444" },
  { nombre: "Procesamiento de señales", color: "#3bcfd4" },
  { nombre: "Tecnologías de Lenguaje Natural", color: "#f59e0b" },
  { nombre: "Algoritmos bioinspirados", color: "#133a94" },
  { nombre: "Aprendizaje Máquina", color: "#10b9a0" }
];

const dias = ["Lun", "Mar", "Mié", "Jue", "Vie"];

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
  { key: 'dormirse', label: 'Dormirse' }
];

export default function HorarioForms({ horarioExistente = null, onClose, onRefresh }) {
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
  const [datos, setDatos] = useState(() =>
    horarioExistente?.clases || Object.fromEntries(dias.map((dia) => [dia, []]))
  );
  // Estado para actividades fijas de cada día
  const [extrasPorDia, setExtrasPorDia] = useState(() => {
    if (!horarioExistente?.extras) {
      return Object.fromEntries(
        dias.map((dia) => [
          dia,
          Object.fromEntries(camposFijos.map(c => [c.key, ""]))
        ])
      );
    }
    // reconstruir extrasPorDia desde actividades agrupadas
    const reconstruido = {};
    for (const dia of dias) {
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
          extras.despertarse = act.inicio;
          extras.dormirse = act.fin;
        }
      }
      reconstruido[dia] = extras;
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
    // Validar directo campos INICIO-FIN
    if (key.endsWith('Fin')) {
      const inicioKey = key.replace('Fin', 'Inicio');
      const ini = timeToMinutes(next[dia][inicioKey]);
      const fin = timeToMinutes(valor);
      if (ini !== null && fin !== null && fin <= ini) {
        alert("La hora de fin debe ser mayor a la de inicio.");
        next[dia][key] = "";
      }
    }
    // Validar traslape con otras actividades fijas
    // Checa todos los pares de intervalos fijos en ese día
    const intervals = [];
    camposFijos.forEach(({ key: cKey, label }) => {
      if (cKey.endsWith('Inicio')) {
        const iniV = timeToMinutes(next[dia][cKey]);
        const finV = timeToMinutes(next[dia][cKey.replace('Inicio', 'Fin')]);
        if (iniV !== null && finV !== null)
          intervals.push({ ini: iniV, fin: finV, label });
      }
    });
    // Revisar despertar/dormir
    const despertar = timeToMinutes(next[dia].despertarse);
    const dormir = timeToMinutes(next[dia].dormirse);
    if (despertar !== null && dormir !== null)
      intervals.push({ ini: despertar, fin: dormir, label: "Dormirse" });
    // Checar traslapes entre ellos
    for (let i = 0; i < intervals.length; i++) {
      for (let j = i + 1; j < intervals.length; j++) {
        if (intervalTraslape(intervals[i].ini, intervals[i].fin, intervals[j].ini, intervals[j].fin)) {
          alert(`Las actividades "${intervals[i].label}" y "${intervals[j].label}" se traslapan. Se borra el último valor ingresado.`);
          // Borra el último editado
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
      for (let { key, label } of camposFijos) {
        if (!extrasPorDia[dia][key]) {
          alert(`Por favor completa el campo "${label}" en ${dia}.`);
          return;
        }
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
          const ini = timeToMinutes(extrasPorDia[dia][key]);
          const fin = timeToMinutes(extrasPorDia[dia][key.replace('Inicio', 'Fin')]);
          if (ini !== null && fin !== null) {
            intervals.push({ ini, fin, label });
          }
        }
      }
      const despertar = timeToMinutes(extrasPorDia[dia].despertarse);
      const dormir = timeToMinutes(extrasPorDia[dia].dormirse);
      if (despertar !== null && dormir !== null) {
        intervals.push({ ini: despertar, fin: dormir, label: "Dormirse" });
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
    for (const m of materiasAll) materiasObj[m.nombre] = { color: m.color };
    const extrasAgrupadas = agruparActividadesPorDia(extrasPorDia);

    await subirHorario({
      uid: auth.currentUser.uid,
      materias: materiasObj,
      clases: datos,
      extras: extrasAgrupadas
    });

    if (onRefresh) onRefresh();
    if (onClose) onClose();
  };

  // Materias disponibles (para select)
  const opcionesMaterias = [...materiasFijas, ...materiasExtra];

  // FORMATOS
  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto" }}>
      <h2 style={{ marginBottom: "1rem", textAlign: "center" }}>Materias fijas (ordena según dificultad: 6 = más difícil)</h2>
      <div>
        {materiasFijas.map((mat, idx) => (
          <div
            key={mat.nombre}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={e => { e.preventDefault(); onDragOver(idx); }}
            onDragEnd={onDragEnd}
            style={{
              display: "flex", gap: "6px", alignItems: "center", marginBottom: 6,
              background: dragIndex === idx ? "#ddeeff" : "transparent",
              cursor: "grab"
            }}
          >
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
            {/* No eliminar */}
          </div>
        ))}
      </div>
      <div style={{ margin: "2.5rem 0 1rem 0", fontWeight: "bold", textAlign: "center" }}>Materias o actividades extras (puedes agregar y quitar)</div>
      {materiasExtra.map((mat, idx) => (
        <div key={idx} style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: 6 }}>
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
              background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 28, height: 28, fontSize: 18, cursor: "pointer"
            }}>🗑️</button>
        </div>
      ))}
      <form onSubmit={agregarMateria} style={{ display: "flex", gap: 6, alignItems: "center" }}>
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
      <h2 style={{ marginBottom: "1rem", textAlign: "center" }}>Horario Semanal</h2>
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
                🗑️ Eliminar
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
  );
}
