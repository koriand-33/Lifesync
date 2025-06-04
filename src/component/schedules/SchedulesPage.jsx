'use client';
import React, { useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import VistaHorario from "./VistaHorario";
import HorarioForms from "./HorarioForms";

export default function SchedulesPage() {
  const [datos, setDatos] = useState(null);
  const [extrasPorDia, setExtrasPorDia] = useState(null);

  const router = useRouter();
  const pathname = usePathname();

  // Renderiza según la RUTA
  if (pathname.endsWith('/form')) {
    return (
      <HorarioForms
        datos={datos}
        extrasPorDia={extrasPorDia}
        onGuardar={(datosForm, extras) => {
          setDatos(datosForm);
          setExtrasPorDia(extras);
          router.push('/schedules'); // Redirige al horario principal
        }}
      />
    );
  }

  // Default, ruta principal /schedules
  return (
    <VistaHorario
      datos={datos}
      extrasPorDia={extrasPorDia}
    />
  );
}
