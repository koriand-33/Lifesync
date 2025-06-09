"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../../../conexion_BD/firebase";
import { bajarHorario } from "@/services/bajarHorario";
import HorarioForms from "@/component/user/schedule/HorarioForms";
import Loading from "@/component/loading/loading";

export default function SetupSchedulePage() {
  const [horarioExistente, setHorarioExistente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/session");
        return;
      }

      try {
        const horario = await bajarHorario(user.uid);
        console.log("Setup page horario:", horario);

        const isHorarioVacio = (horario) => {
          if (!horario || typeof horario !== "object") return true;
          return Object.values(horario).every(
            value =>
              typeof value === "object"
                ? Object.keys(value).length === 0
                : !value
          );
        };

        const tieneHorario = !isHorarioVacio(horario);

        if (tieneHorario) {
          router.replace("/user/home");
        } else {
          setHorarioExistente(horario);
          setCargando(false);
        }
      } catch (error) {
        console.error("Error al obtener el horario:", error);
        alert("Error al obtener el horario. Recarga la página.");
        setCargando(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const closeModal = () => false;

  if (cargando) return <Loading />;

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="my-9 font-bold text-2xl">Por favor ingresa tu horario</h2>
      <div className="w-screen">
        <HorarioForms
          horarioExistente={horarioExistente}
          onClose={closeModal}
          onRefresh={() => {
            setCargando(true);
            setHorarioExistente(null);
          }}
        />
      </div>
    </div>
  );
}
