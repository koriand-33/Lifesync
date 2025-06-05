'use client';

import React, { useState } from "react";



const materias = [
  { nombre: "Visión Artificial", color: "#facc15" },
  { nombre: "Teoría de la computación", color: "#ef4444" },
  { nombre: "Procesamiento de señales", color: "#6b7280" },
  { nombre: "Tecnologías de Lenguaje Natural", color: "#f59e0b" },
  { nombre: "Algoritmos bioinspirados", color: "#a3a3a3" },
  { nombre: "Aprendizaje Máquina", color: "#10b9a0" },
  { nombre: "Otra", color: "#10b981" }
];

const dias = ["Lun", "Mar", "Mié", "Jue", "Vie"];


export default function HorarioForms() {
  // Estado para actividades
  // const [datos, setDatos] = useState(() =>
  //   Object.fromEntries(
  //     dias.map((dia) => [
  //       dia,
  //       [
  //         {
  //           materia: "",
  //           accion: "",
  //           horaInicio: "",
  //           horaFin: ""
  //         }
  //       ]
  //     ])
  //   )
  // );
  const [datos, setDatos] = useState(() =>
  Object.fromEntries(
      dias.map((dia) => [dia, []])
    )
  );

  // Estado para campos extras por día
  const [extrasPorDia, setExtrasPorDia] = useState(() =>
    Object.fromEntries(
      dias.map((dia) => [
        dia,
        {
          trayectoIdaInicio: "",
          trayectoIdaFin: "",
          trayectoVueltaInicio: "",
          trayectoVueltaFin: "",
          desayunoInicio: "",
          desayunoFin: "",
          comidaInicio: "",
          comidaFin: "",
          despertarse: "",
          dormirse: ""
        }
      ])
    )
  );

  // Maneja cambios en campos extras por día
  const manejarCambioExtra = (dia, campo, valor) => {
    setExtrasPorDia((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor
      }
    }));
  };

  // Maneja cambios en actividades
  const manejarCambio = (dia, index, campo, valor) => {
    setDatos((prev) => {
      const actividadesDia = [...prev[dia]];
      actividadesDia[index] = {
        ...actividadesDia[index],
        [campo]: valor
      };
      return { ...prev, [dia]: actividadesDia };
    });
  };

  // Agrega actividad a día dado
  const agregarActividad = (dia) => {
    setDatos((prev) => {
      const actividadesDia = [...prev[dia]];
      actividadesDia.push({ materia: "", accion: "", horaInicio: "", horaFin: "" });
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
  const handleSubmit = (e) => {
    e.preventDefault();

    for (const dia of dias) {
      const extras = extrasPorDia[dia];

      // Validar todos los campos de hora en extras
      const camposHora = [
        "trayectoIdaInicio", "trayectoIdaFin",
        "trayectoVueltaInicio", "trayectoVueltaFin",
        "desayunoInicio", "desayunoFin",
        "comidaInicio", "comidaFin",
        "despertarse", "dormirse"
      ];

      for (const campo of camposHora) {
        if (!extras[campo]) {
          alert(`Por favor completa el campo "${campo.replace(/([A-Z])/g, ' $1')}" en ${dia}.`);
          return;
        }
      }
    }

    console.log("Extras por día:", extrasPorDia);
    console.log("Horario enviado:", datos);
    alert("Horario guardado en consola (ver DevTools)");
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
          <legend style={{ fontWeight: "bold", fontSize: "18px" }}>{dia}</legend>

          {/* Campos extras por día */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "1rem",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: "6px"
            }}
          >
            {/* Trayecto Ida */}
            <div>
              <strong>Trayecto Ida</strong>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor={`${dia}-trayectoIdaInicio`}
                    style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}
                  >
                    Hora inicio:
                  </label>
                  <input
                    type="time"
                    id={`${dia}-trayectoIdaInicio`}
                    value={extrasPorDia[dia].trayectoIdaInicio}
                    onChange={(e) => manejarCambioExtra(dia, "trayectoIdaInicio", e.target.value)}
                    required
                    style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor={`${dia}-trayectoIdaFin`}
                    style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}
                  >
                    Hora fin:
                  </label>
                  <input
                    type="time"
                    id={`${dia}-trayectoIdaFin`}
                    value={extrasPorDia[dia].trayectoIdaFin}
                    onChange={(e) => manejarCambioExtra(dia, "trayectoIdaFin", e.target.value)}
                    required
                    style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                  />
                </div>
              </div>
            </div>

            {/* Trayecto Vuelta */}
            <div>
              <strong>Trayecto Vuelta</strong>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor={`${dia}-trayectoVueltaInicio`}
                    style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}
                  >
                    Hora inicio:
                  </label>
                  <input
                    type="time"
                    id={`${dia}-trayectoVueltaInicio`}
                    value={extrasPorDia[dia].trayectoVueltaInicio}
                    onChange={(e) => manejarCambioExtra(dia, "trayectoVueltaInicio", e.target.value)}
                    required
                    style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor={`${dia}-trayectoVueltaFin`}
                    style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}
                  >
                    Hora fin:
                  </label>
                  <input
                    type="time"
                    id={`${dia}-trayectoVueltaFin`}
                    value={extrasPorDia[dia].trayectoVueltaFin}
                    onChange={(e) => manejarCambioExtra(dia, "trayectoVueltaFin", e.target.value)}
                    required
                    style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                  />
                </div>
              </div>
            </div>

            {/* Desayuno */}
            <div>
              <strong>Desayuno</strong>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor={`${dia}-desayunoInicio`}
                    style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}
                  >
                    Hora inicio:
                  </label>
                  <input
                    type="time"
                    id={`${dia}-desayunoInicio`}
                    value={extrasPorDia[dia].desayunoInicio}
                    onChange={(e) => manejarCambioExtra(dia, "desayunoInicio", e.target.value)}
                    required
                    style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor={`${dia}-desayunoFin`}
                    style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}
                  >
                    Hora fin:
                  </label>
                  <input
                    type="time"
                    id={`${dia}-desayunoFin`}
                    value={extrasPorDia[dia].desayunoFin}
                    onChange={(e) => manejarCambioExtra(dia, "desayunoFin", e.target.value)}
                    required
                    style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                  />
                </div>
              </div>
            </div>

            {/* Comida */}
            <div>
              <strong>Comida</strong>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor={`${dia}-comidaInicio`}
                    style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}
                  >
                    Hora inicio:
                  </label>
                  <input
                    type="time"
                    id={`${dia}-comidaInicio`}
                    value={extrasPorDia[dia].comidaInicio}
                    onChange={(e) => manejarCambioExtra(dia, "comidaInicio", e.target.value)}
                    required
                    style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor={`${dia}-comidaFin`}
                    style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}
                  >
                    Hora fin:
                  </label>
                  <input
                    type="time"
                    id={`${dia}-comidaFin`}
                    value={extrasPorDia[dia].comidaFin}
                    onChange={(e) => manejarCambioExtra(dia, "comidaFin", e.target.value)}
                    required
                    style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                  />
                </div>
              </div>
            </div>

            {/* Dormir y Despertar */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <div style={{ flex: 1 }}>
                <label
                  htmlFor={`${dia}-despertarse`}
                  style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}
                >
                  Hora de despertarse:
                </label>
                <input
                  type="time"
                  id={`${dia}-despertarse`}
                  value={extrasPorDia[dia].despertarse}
                  onChange={(e) => manejarCambioExtra(dia, "despertarse", e.target.value)}
                  required
                  style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  htmlFor={`${dia}-dormirse`}
                  style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}
                >
                  Hora de dormirse:
                </label>
                <input
                  type="time"
                  id={`${dia}-dormirse`}
                  value={extrasPorDia[dia].dormirse}
                  onChange={(e) => manejarCambioExtra(dia, "dormirse", e.target.value)}
                  required
                  style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                />
              </div>
            </div>
          </div>

          {/* Actividades del día */}
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
                  Materia:
                </label>
                <select
                  id={`${dia}-materia-${idx}`}
                  value={actividad.materia}
                  onChange={(e) =>
                    manejarCambio(dia, idx, "materia", e.target.value)
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

                {actividad.materia === "Otra" && (
                  <>
                    <label
                      htmlFor={`${dia}-accion-${idx}`}
                      style={{
                        fontWeight: "600",
                        marginTop: "0.5rem",
                        display: "block"
                      }}
                    >
                      Acción:
                    </label>
                    <input
                      type="text"
                      id={`${dia}-accion-${idx}`}
                      placeholder="Describe la acción"
                      value={actividad.accion}
                      onChange={(e) =>
                        manejarCambio(dia, idx, "accion", e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "6px",
                        fontSize: "14px",
                        marginTop: "0.25rem"
                      }}
                      required={actividad.materia === "Otra"}
                    />
                  </>
                )}

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
                      style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}
                    >
                      Hora inicio:
                    </label>
                    <input
                      type="time"
                      id={`${dia}-horaInicio-${idx}`}
                      value={actividad.horaInicio}
                      onChange={(e) =>
                        manejarCambio(dia, idx, "horaInicio", e.target.value)
                      }
                      style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                      required
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label
                      htmlFor={`${dia}-horaFin-${idx}`}
                      style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}
                    >
                      Hora fin:
                    </label>
                    <input
                      type="time"
                      id={`${dia}-horaFin-${idx}`}
                      value={actividad.horaFin}
                      onChange={(e) =>
                        manejarCambio(dia, idx, "horaFin", e.target.value)
                      }
                      style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                      required
                    />
                  </div>
                </div>

                {/* boton de eliminar */}
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