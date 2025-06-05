'use client';

import React, { useState } from "react";
import { subirHorario } from "@/services/subirHorario";
import { auth } from "../../../../conexion_BD/firebase";

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

  const [materias, setMaterias] = useState(() =>
    horarioExistente?.materias
      ? Object.entries(horarioExistente.materias).map(([nombre, { color }]) => ({ nombre, color }))
      : materiasIniciales
  );
  const [nuevaMateria, setNuevaMateria] = useState({ nombre: "", color: "#888888" });

  // Estado para actividades (solo seleccionables con materias)
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
    // reconstruye extrasPorDia desde actividades agrupadas
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

  // Manejo materias nuevas
  const agregarMateria = () => {
    if (
      nuevaMateria.nombre.trim() &&
      !materias.some((m) => m.nombre === nuevaMateria.nombre)
    ) {
      setMaterias((prev) => [...prev, nuevaMateria]);
      setNuevaMateria({ nombre: "", color: "#888888" });
    }
  };

  // Eliminar una materia agregada (y borrar actividades que usen esa materia)
  const eliminarMateria = (nombreMateria) => {
    setMaterias((prev) => prev.filter(m => m.nombre !== nombreMateria));
    setDatos((prev) => {
      const next = {};
      for (const d in prev) {
        next[d] = prev[d].filter(a => a.materia !== nombreMateria);
      }
      return next;
    });
  };

  // Cambios en campos fijos de cada día
  const manejarCambioExtra = (dia, campo, valor) => {
    setExtrasPorDia((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor
      }
    }));
  };

  // Cambios en actividades agregadas
  const manejarCambioActividad = (dia, index, campo, valor) => {
    setDatos((prev) => {
      const actividadesDia = [...prev[dia]];
      actividadesDia[index] = {
        ...actividadesDia[index],
        [campo]: valor
      };
      return { ...prev, [dia]: actividadesDia };
    });
  };

  const agregarActividad = (dia) => {
    setDatos((prev) => {
      const actividadesDia = [...prev[dia]];
      actividadesDia.push({ materia: "", horaInicio: "", horaFin: "" });
      return { ...prev, [dia]: actividadesDia };
    });
  };

  const eliminarActividad = (dia, index) => {
    setDatos((prev) => {
      const actividadesDia = [...prev[dia]];
      actividadesDia.splice(index, 1);
      return { ...prev, [dia]: actividadesDia };
    });
  };

  // Validación al enviar
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
    console.log("Materias:", materias);
    console.log("Horario enviado:", datos);
    const extrasFormateadas = agruparActividadesPorDia(extrasPorDia);
    console.log("Actividades extras organizadas por día:", extrasFormateadas);

    const userId = auth.currentUser?.uid;
      if (!userId) return;

    try {
      await subirHorario(userId, materias, datos, extrasFormateadas);
      alert("¡Horario guardado correctamente en Firebase!");
      onRefresh(); 
      onClose();
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
      alert("Hubo un error al guardar el horario. Inténtalo más tarde.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ padding: "2rem", maxWidth: 900, margin: "auto" }}
    >
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "1rem",
          textAlign: "center"
        }}
      >
        Horario de clases y actividades
      </h2>
      
      {/* Bloques de materias existentes */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontWeight: "bold", marginBottom: "0.75rem" }}>
          Materias y actividades:
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {materias.map((m, i) => (
            <div key={m.nombre} style={{
              background: m.color,
              minWidth: 110,
              textAlign: "center",
              padding: "0.7rem 1rem",
              borderRadius: "1rem",
              fontWeight: "600",
              position: "relative"
            }}>
              {m.nombre}
              {i >= materiasIniciales.length && (
                <span
                  title="Eliminar esta materia"
                  onClick={() => eliminarMateria(m.nombre)}
                  style={{
                    position: "absolute",
                    top: 5,
                    right: 8,
                    cursor: "pointer",
                    color: "#c0392b",
                    fontSize: "18px",
                    lineHeight: "16px",
                    fontWeight: "bold"
                  }}
                  tabIndex={0}
                  role="button"
                >
                  ❌
                </span>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Aqui escribe el nombre de la nueva materia"
            value={nuevaMateria.nombre}
            maxLength={30}
            className="p-2 rounded-md border border-gray-300"
            style={{ flex: 2, padding: "6px", fontSize: "14px" }}
            onChange={(e) =>
              setNuevaMateria((nm) => ({ ...nm, nombre: e.target.value }))
            }
          />
          <input
            type="color"
            value={nuevaMateria.color}
            style={{ width: 38, height: 38, padding: 2, flex: "none", border: "none" }}
            onChange={(e) =>
              setNuevaMateria((nm) => ({ ...nm, color: e.target.value }))
            }
          />
          <button
            type="button"
            onClick={agregarMateria}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            + Agregar materia o actividad
          </button>
        </div>
      </div>

      {/* Horario por días */}
      {dias.map((dia) => (
        <fieldset
          key={dia}
          style={{
            marginBottom: "2rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px"
          }}
        >
          <legend style={{ fontWeight: "bold", fontSize: "18px" }}>
            {dia}
          </legend>

          {/* Campos fijos */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: ".85rem",
            marginBottom: "1.5rem"
          }}>
            {camposFijos.map(({key,label}) => (
              <div key={key}>
                <label
                  htmlFor={`${dia}-extra-${key}`}
                  style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}
                >
                  {label}
                </label>
                <input
                  type={key === "despertarse" || key === "dormirse" ? "time" : "time"}
                  id={`${dia}-extra-${key}`}
                  value={extrasPorDia[dia][key]}
                  onChange={(e) =>
                    manejarCambioExtra(dia, key, e.target.value)
                  }
                  style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                  required
                />
              </div>
            ))}
          </div>

          {/* Actividades agregables ("extra") */}
          <h4 style={{marginBottom: "10px", marginTop: "1.25rem"}}>Actividades/Materias</h4>
          {datos[dia].map((actividad, idx) => {
            const color =
              materias.find((m) => m.nombre === actividad.materia)?.color || "#f3f4f6";
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: color,
                  padding: "1rem",
                  borderRadius: "6px",
                  marginBottom: "1rem"
                }}
              >
                <label
                  htmlFor={`${dia}-materia-${idx}`}
                  style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}
                >
                  Materia o actividad:
                </label>
                <select
                  id={`${dia}-materia-${idx}`}
                  value={actividad.materia}
                  onChange={(e) =>
                    manejarCambioActividad(dia, idx, "materia", e.target.value)
                  }
                  style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                  required
                >
                  <option value="">Selecciona una materia</option>
                  {materias.map((m) => (
                    <option key={m.nombre} value={m.nombre}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    marginTop: "1rem"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <label
                      htmlFor={`${dia}-horaInicio-${idx}`}
                      style={{
                        fontWeight: "600",
                        display: "block",
                        marginBottom: "4px"
                      }}
                    >
                      Hora inicio:
                    </label>
                    <input
                      type="time"
                      id={`${dia}-horaInicio-${idx}`}
                      value={actividad.horaInicio}
                      onChange={(e) =>
                        manejarCambioActividad(dia, idx, "horaInicio", e.target.value)
                      }
                      style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      htmlFor={`${dia}-horaFin-${idx}`}
                      style={{
                        fontWeight: "600",
                        display: "block",
                        marginBottom: "4px"
                      }}
                    >
                      Hora fin:
                    </label>
                    <input
                      type="time"
                      id={`${dia}-horaFin-${idx}`}
                      value={actividad.horaFin}
                      onChange={(e) =>
                        manejarCambioActividad(dia, idx, "horaFin", e.target.value)
                      }
                      style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                      required
                    />
                  </div>
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
            );
          })}
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
