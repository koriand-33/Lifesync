"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../conexion_BD/firebase";
import { bajarHorario } from "@/services/bajarHorario";

export function useProteccionUsuario() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/session");
        setCargando(false);
        return;
      }

      setUsuario(user); // Guarda usuario temporalmente
    });

    return () => unsubscribe();
  }, [router]);

  // Segunda parte: cuando tenemos usuario, verificamos su horario
  useEffect(() => {
    const verificarHorario = async () => {
      if (!usuario) return;

      try {
        const horario = await bajarHorario(usuario.uid);
        console.log("Desde proteccion Horario:", horario);

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
        console.log("Desde proteccion TieneHorario:", tieneHorario);

        if (!tieneHorario && window.location.pathname !== "/user/setup-schedule") {
          router.replace("/user/setup-schedule");
        } else if (tieneHorario && window.location.pathname === "/user/setup-schedule") {
          router.replace("/user/home");
        } else {
          setCargando(false);
        }
      } catch (error) {
        console.error("Error al verificar horario:", error);
        setCargando(false);
      }
    };

    verificarHorario();
  }, [usuario, router]);

  return { cargando, usuario };
}
