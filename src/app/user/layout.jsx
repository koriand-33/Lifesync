"use client";

import NavbarHome from '@/component/user/NavbarHome';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { verificarYActualizarRacha } from '@/services/racha';
import { useProteccionUsuario } from '@/hooks/ProteccionUsuario';
// import ProtegidoSchedule from '@/hooks/ProtegidoSchedule';
import Loading from '@/component/loading/loading';

export default function UsuarioLayout({ children }) {
  const pathname = usePathname();
  const { cargando } = useProteccionUsuario();

  const ocultarUI = pathname === "/user/setup-schedule";

  useEffect(() => {
    verificarYActualizarRacha();
  }, [pathname]);

  if (cargando) return <Loading />;

  return (
    <div className="flex justify-center items-center">
      {!ocultarUI && (
        <div className="pt-20">
          <NavbarHome />
        </div>
      )}

      <div className={`flex ${!ocultarUI ? "mt-24" : ""} w-full items-center justify-center`}>
        {children}

        {/* 🔒 Overlay de bloqueo/interacción */}
        <div
          id="overlay-subida-datos"
          className="fixed inset-0 bg-black bg-opacity-60 text-white flex items-center justify-center text-xl font-bold z-[9999]"
          style={{ display: 'none' }}
        >
          ⏳ No recargues la página. Se están subiendo los datos...
        </div>
      </div>
    </div>
  );
}
