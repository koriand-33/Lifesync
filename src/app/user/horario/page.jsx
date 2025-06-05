'use client';

import React, { useEffect, useState } from "react";

const dias = ["Lun", "Mar", "Mié", "Jue", "Vie"];

export default function HorarioVista() {
  const [datos, setDatos] = useState({});
  const [extras, setExtras] = useState({});

  useEffect(() => {
    // Leer de localStorage
    const datosGuardados = localStorage.getItem("horarioDatos");
    const extrasGuardados = localStorage.getItem("horarioExtras");
    if (datosGuardados && extrasGuardados) {
      setDatos(JSON.parse(datosGuardados));
      setExtras(JSON.parse(extrasGuardados));
    }
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: "auto" }}>
      <h2 style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: '2rem' }}>
        Vista de Horario
      </h2>
      {dias.map((dia) => (
        <div key={dia} style={{ padding: 16, marginBottom: 20, border: "1px solid #ccc", borderRadius: 8 }}>
          <h3 style={{ marginBottom: 8 }}>{dia}</h3>
          <div>
            <small><b>Despertarse:</b> {extras[dia]?.despertarse} <b>- Dormirse:</b> {extras[dia]?.dormirse}</small>
          </div>
          <ul>
            {Array.isArray(datos[dia]) ? datos[dia].map((actividad, idx) => (
              <li key={idx} style={{ marginBottom: 6 }}>
                <b>{actividad.materia}</b>
                {!!actividad.accion && <>: {actividad.accion}</>}
                {" - "}
                {actividad.horaInicio} a {actividad.horaFin}
              </li>
            )) : <li>Sin actividades</li>}
          </ul>
        </div>
      ))}
    </div>
  );
}