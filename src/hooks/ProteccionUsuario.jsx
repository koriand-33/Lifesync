"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../conexion_BD/firebase";
import { bajarHorario } from "@/services/bajarHorario";

export function useProteccionUsuario() {
  const router = useRouter();
  const pathname = usePathname();
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/session");
        return;
      }

      setUsuario(user); 
    });

    return () => unsubscribe();
  }, [router]);

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

        if (!tieneHorario && pathname !== "/user/setup-schedule") {
          router.replace("/user/setup-schedule");
          return;
        }

        if (tieneHorario && pathname === "/user/setup-schedule") {
          router.replace("/user/home");
          return;
        }

        setCargando(false);
      } catch (error) {
        console.error("Error al verificar horario:", error);
        setCargando(false);
      }
    };

    verificarHorario();
  }, [usuario, pathname, router]);

  return { cargando, usuario };
}
