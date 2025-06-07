'use client';

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  Bars3Icon,
  HomeIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  InformationCircleIcon,
  MapIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// cerrar sesion
import { signOut } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { auth } from '../../../conexion_BD/firebase';

const Navbar = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navItems = [
    { name: 'Home', href: '/user/home', icon: HomeIcon },
    { name: 'Calendar', href: '/user/calendario', icon: CalendarIcon },
    { name: 'Schedules', href: '/user/schedules', icon: ClockIcon },
    { name: 'Perfil', href: '/user/profile', icon: UserIcon },
  ];

    const cerrarSesion = () => {
      signOut(auth)
        .then(() => {
          console.log("Sesión cerrada");
          router.push("/session");
        })
        .catch((error) => {
          console.error("Error al cerrar sesión:", error);
        });
    };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-20 transition-colors duration-300 bg-background-80 shadow-md backdrop-blur">
        <div className="flex items-center px-4 py-4">
          <div className="flex items-center gap-4 w-full">
            <div>
              <Link href="/user/home" className="flex items-center">
                <img src="/logo.png" alt="logo" className="w-20 h-auto" />
              </Link>
            </div>

            <div className="w-full hidden lg:flex">
              <nav className="ml-5 flex items-center w-4/5">
                <ul className="flex justify-between w-full">
                  {navItems.map((item) => (
                    <li
                      key={item.name}
                      className={`rounded-lg p-3 ${
                        pathname === item.href
                          ? 'bg-accent text-background'
                          : 'hover:bg-accent hover:text-background'
                      }`}
                    >
                      <Link href={item.href}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="ml-20 flex items-center pr-4 w-1/5">
                <ul className="flex items-center gap-8">
                  <li>
                    <button
                      onClick={cerrarSesion}
                      className="p-3 bg-primary rounded-2xl cursor-pointer text-white"
                    >
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex lg:hidden items-center ml-auto space-x-6">
            <button
              className="lg:hidden cursor-pointer"
              onClick={() => setMenuOpen(true)}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black opacity-50 z-40"
            onClick={() => setMenuOpen(false)}
          />

          <div className="fixed bg-background w-1/2 min-w-[300px] top-0 left-0 p-6 h-full shadow-md overflow-auto z-50">
            <button
              onClick={() => setMenuOpen(false)}
              className="fixed top-2 right-4 rounded-full bg-background text-text p-3 cursor-pointer z-50"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <ul className="space-y-2">
              <li className="mb-6">
                <img src="/logo.png" alt="logo" className="w-10 h-auto" />
              </li>

              {navItems.map(({ name, href, icon: Icon }) => (
                <li key={name} className="py-3">
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center font-bold text-[15px] ${
                      pathname === href
                        ? 'text-text'
                        : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    <Icon className="w-6 h-6 mr-2" />
                    <p>{name}</p>
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="mt-4">
              <li className="flex py-3 w-full">
                <button
                  onClick={cerrarSesion}
                  className="flex justify-center items-center w-full px-4 py-2.5 text-sm rounded font-bold text-white bg-primary transition-colors cursor-pointer"
                >
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
