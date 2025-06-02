"use client";

import Sidebar from '@/component/user/Sidebar';
import NavbarHome from '@/component/user/NavbarHome';
// import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function UsuarioLayout({ children }) {
  return (
    <div className="flex">
      {/* Sidebar: se queda fija a la izquierda */}
      {/* <div className="sticky top-0 h-full z-5">
        <Sidebar />
      </div> */}
      <div className="pt-20 px-6">
        <NavbarHome/>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto mt-20">
        {children}
      </div>

    </div>
  );
}
