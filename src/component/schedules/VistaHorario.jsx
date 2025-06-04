'use client';

import React from "react";

import { useRouter } from 'next/navigation';

const dias = ["Lun", "Mar", "Mié", "Jue", "Vie"];
const url = "/form";

export default function VistaHorario({ datos, extrasPorDia }) {
  const router = useRouter();

  // Click handler para el botón (+)
  const onAddClick = () => {
    router.push(url);
  };

  // Función para saber si el horario está vacío (sin actividades y sin extras)
  const horarioVacio = () => {
    // Revisa si hay al menos una actividad con materia
    const tieneActividades = dias.some((dia) =>
      datos?.[dia]?.some((act) => act.materia && act.materia !== "")
    );

    // Revisa si algún campo extra tiene valor
    const tieneExtras = dias.some((dia) => {
      const extras = extrasPorDia?.[dia];
      if (!extras) return false;
      return Object.values(extras).some((val) => val && val !== "");
    });

    return !tieneActividades && !tieneExtras;
  };

  if (!datos || !extrasPorDia || horarioVacio()) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "3rem",
          color: "#6b7280",
          userSelect: "none"
        }}
      >
        <p style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>No hay horario</p>
        <button
          onClick={onAddClick}
          aria-label="Agregar horario"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#3b82f6",
            fontSize: "3rem",
            padding: 0,
            lineHeight: 1,
            userSelect: "none"
          }}
        >
          {/* Ícono + simple en SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
            width="48"
            height="48"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Horario Guardado</h2>

      {dias.map((dia) => (
        <section
          key={dia}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            padding: "1rem"
          }}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "#374151" }}>{dia}</h3>

          {/* Mostrar extras por día */}
          {extrasPorDia[dia] && (
            <div
              style={{
                fontSize: "0.9rem",
                marginBottom: "1rem",
                color: "#6b7280",
                lineHeight: 1.5
              }}
            >
              <p>
                <strong>Trayecto Ida:</strong> {extrasPorDia[dia].trayectoIdaInicio} -{" "}
                {extrasPorDia[dia].trayectoIdaFin}
              </p>
              <p>
                <strong>Trayecto Vuelta:</strong> {extrasPorDia[dia].trayectoVueltaInicio} -{" "}
                {extrasPorDia[dia].trayectoVueltaFin}
              </p>
              <p>
                <strong>Desayuno:</strong> {extrasPorDia[dia].desayunoInicio} -{" "}
                {extrasPorDia[dia].desayunoFin}
              </p>
              <p>
                <strong>Comida:</strong> {extrasPorDia[dia].comidaInicio} -{" "}
                {extrasPorDia[dia].comidaFin}
              </p>
              <p>
                <strong>Despertarse:</strong> {extrasPorDia[dia].despertarse}
              </p>
              <p>
                <strong>Dormirse:</strong> {extrasPorDia[dia].dormirse}
              </p>
            </div>
          )}

          {/* Mostrar actividades */}
          {datos[dia]?.length ? (
            datos[dia].map((actividad, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor:
                    actividad.materia === "Otra"
                      ? "#d1d5db"
                      : "#f3f4f6",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  marginBottom: "0.75rem"
                }}
              >
                <p style={{ margin: 0, fontWeight: "600", color: "#111827" }}>
                  Materia:{" "}
                  <span style={{ fontWeight: "normal" }}>
                    {actividad.materia || "(sin materia)"}
                  </span>
                </p>
                {actividad.materia === "Otra" && (
                  <p style={{ margin: "0.25rem 0 0", fontStyle: "italic", color: "#4b5563" }}>
                    Acción: {actividad.accion || "(sin descripción)"}
                  </p>
                )}
                <p style={{ margin: "0.25rem 0 0", color: "#374151" }}>
                  {actividad.horaInicio} - {actividad.horaFin}
                </p>
              </div>
            ))
          ) : (
            <p style={{ fontStyle: "italic", color: "#9ca3af" }}>No hay actividades</p>
          )}
        </section>
      ))}
    </div>
  );
}
