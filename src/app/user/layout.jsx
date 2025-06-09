"use client";

import Sidebar from '@/component/user/Sidebar';
import NavbarHome from '@/component/user/NavbarHome';
import Protegido from '@/hooks/Protegido';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { verificarYActualizarRacha } from '@/services/racha';
import { useProteccionUsuario } from '@/hooks/ProteccionUsuario';
// import ProtegidoSchedule from '@/hooks/ProtegidoSchedule';
import Loading from '@/component/loading/loading';

export default function UsuarioLayout({ children }) {
  const pathname = usePathname();
  const { cargando } = useProteccionUsuario();

  useEffect(() => {
    verificarYActualizarRacha();
    // console.log("Verificando racha del usuario en el layout");
  }, [pathname]);

  if (cargando) return <Loading />;

  return (
    // <Protegido>
    //   <ProtegidoSchedule>
    //   <div className="flex justify-center items-center">

    //     {/* Navbar */}
    //     <div className="pt-20">
    //       <NavbarHome />
    //     </div>

    //     {/* Contenido principal */}
    //     <div className="flex mt-24 w-full items-center justify-center">
    //       {children}
    //     </div>
    //   </div>
    //   </ProtegidoSchedule>
    // </Protegido>
    <div className="flex justify-center items-center">
      <div className="pt-20">
        <NavbarHome />
      </div>
      <div className="flex mt-24 w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}
