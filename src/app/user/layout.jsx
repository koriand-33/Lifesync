"use client";

import Sidebar from '@/component/user/Sidebar';
import NavbarHome from '@/component/user/NavbarHome';
import Protegido from '@/hooks/Protegido';

export default function UsuarioLayout({ children }) {
  return (
    <Protegido>
      <div className="flex">
        {/* Sidebar opcional */}
        {/* <div className="sticky top-0 h-full z-5">
          <Sidebar />
        </div> */}

        {/* Navbar */}
        <div className="pt-20 px-6">
          <NavbarHome />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-auto mt-20">
          {children}
        </div>
      </div>
    </Protegido>
  );
}
