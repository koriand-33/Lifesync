"use client";

import Sidebar from '@/component/user/Sidebar';
import NavbarHome from '@/component/user/NavbarHome';
import Protegido from '@/hooks/Protegido';

export default function UsuarioLayout({ children }) {
  return (
    <Protegido>
      <div className="flex justify-center items-center">

        {/* Navbar */}
        <div className="pt-20">
          <NavbarHome />
        </div>

        {/* Contenido principal */}
        <div className="flex mt-24 w-full items-center justify-center">
          {children}
        </div>
      </div>
    </Protegido>
  );
}
