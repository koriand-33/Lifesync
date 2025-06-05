"use client";
import { useEffect, useState } from "react";
import { auth } from "../../conexion_BD/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Loading from "@/component/loading/loading";

export default function Protegido({ children }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
    //     console.log("🧪 onAuthStateChanged fired");
    // debugger;
      if (user) {
        setUsuario(user);
        setCargando(false);
      } else {
        setCargando(false);
        // Usa push solo si estamos en una ruta protegida
        if (typeof window !== "undefined" && window.location.pathname.startsWith("/user")) {
          router.replace("/session"); // <-- más seguro que push para evitar loops
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (cargando) return <Loading />;

  return usuario ? <>{children}</> : null;
}
