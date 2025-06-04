'use client';

import React from "react";
import { useRouter } from 'next/navigation';

const dias = ["Lun", "Mar", "Mié", "Jue", "Vie"];

export default function VistaHorario({ datos, extrasPorDia }) {
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

          {extrasPorDia?.[dia] && (
            <div
              style={{
                fontSize: "0.9rem",
                marginBottom: "1rem",
                color: "#6b7280",
                lineHeight: 1.5
              }}
            >
              <p><strong>Trayecto Ida:</strong> {extrasPorDia[dia].trayectoIdaInicio} - {extrasPorDia[dia].trayectoIdaFin}</p>
              <p><strong>Trayecto Vuelta:</strong> {extrasPorDia[dia].trayectoVueltaInicio} - {extrasPorDia[dia].trayectoVueltaFin}</p>
              <p><strong>Desayuno:</strong> {extrasPorDia[dia].desayunoInicio} - {extrasPorDia[dia].desayunoFin}</p>
              <p><strong>Comida:</strong> {extrasPorDia[dia].comidaInicio} - {extrasPorDia[dia].comidaFin}</p>
              <p><strong>Despertarse:</strong> {extrasPorDia[dia].despertarse}</p>
              <p><strong>Dormirse:</strong> {extrasPorDia[dia].dormirse}</p>
            </div>
          )}

          {datos?.[dia]?.length ? (
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
                  Materia: <span style={{ fontWeight: "normal" }}>{actividad.materia || "(sin materia)"}</span>
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
