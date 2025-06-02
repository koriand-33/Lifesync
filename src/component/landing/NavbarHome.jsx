'use client';

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  Bars3Icon,
  HomeIcon,
  InformationCircleIcon,
  MapIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname(); // Obtener la ruta actual

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navItems = [
    { name: 'Home', href: '/home', icon: HomeIcon },
    { name: 'Calendar', href: '/calendar', icon: InformationCircleIcon },
    { name: 'Schedules', href: '/schedules', icon: MapIcon },
    { name: 'Perfil', href: '/perfil', icon: BuildingOfficeIcon },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-1 transition-colors duration-300 bg-background-80 shadow-md backdrop-blur">
        <div className="flex items-center px-4 py-4">
          <div className="flex items-center gap-4 w-full">
            <div>
              <Link href="/" className="flex items-center">
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
                    <Link
                      href="/session/Acceso"
                      className="p-3 bg-primary rounded-2xl cursor-pointer text-white"
                    >
                      Cerrar sesión
                    </Link>
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
                <Link
                  href="/session/Acceso"
                  className="flex justify-center items-center w-full px-4 py-2.5 text-sm rounded font-bold text-white bg-primary transition-colors cursor-pointer"
                >
                  Cerrar sesión
                </Link>
              </li>
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
