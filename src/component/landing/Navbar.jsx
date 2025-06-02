'use client';

import React, { useState, useEffect } from 'react';
// import { ThemeToggle } from "@/components/theme/ThemeToggle";
// import ThemeLogo from "@/components/logo/ThemeLogo";
import { 
    XMarkIcon,
    Bars3Icon,
    HomeIcon,
    InformationCircleIcon,
    IdentificationIcon,
    ChatBubbleLeftRightIcon,
    QuestionMarkCircleIcon,
    DevicePhoneMobileIcon,

} from '@heroicons/react/24/solid';
import { useScrollDetection } from "@/hooks/useScrollDetection";
import Link from 'next/link';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrollDetection(30);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-1 transition-colors duration-300 bg-background-80 shadow-md backdrop-blur">
        <div className='flex items-center px-4 py-4'>
          <div className='flex items-center gap-4 w-full'>
            
            <div>
              <Link href="/" className='flex items-center'>
                <img src="/logo.png" alt="logo" className='w-20 h-auto' />
              </Link>
            </div>

            <div className='w-full hidden lg:flex'>
              <nav className='ml-5 flex items-center w-4/5'>
                <ul className='flex justify-between w-full'>
                  <li className='flex items-center justify-center'><a href="#Principal" className='hover:text-background hover:bg-accent rounded-lg p-3'>Inicio</a></li>
                  <li className='flex items-center justify-center'><a href="#Datos" className='hover:text-background hover:bg-accent rounded-lg p-3'>Datos</a></li>
                  <li className='flex items-center justify-center'><a href="#Moreabout" className='hover:text-background hover:bg-accent rounded-lg p-3'>Descubre Más</a></li>
                  <li className='flex items-center justify-center'><a href="#testimonials" className='hover:text-background hover:bg-accent rounded-lg p-3'>Reseñas</a></li>
                  <li className='flex items-center justify-center'><a href="#FAQ" className='hover:text-background hover:bg-accent rounded-lg p-3'>Preguntas</a></li>
                  <li className='flex items-center justify-center'><a href="#FAQ" className='hover:text-background hover:bg-accent rounded-lg p-3'>Contacto</a></li>

                </ul>
              </nav>

              <div className='ml-20 flex items-center pr-4 w-1/5'>
                <div className='flex items-center justify-center mr-8'>
                  {/* <ThemeToggle alwaysWhite={!scrolled} /> */}
                </div>
                <ul className='flex items-center gap-8'>
                  <li className='border-r border-gray-400 pr-8'>
                    <Link href="/session?register=true"  className='cursor-pointer'>Registro</Link>
                  </li>
                  <li>
                    <Link href="/session" className='p-3 bg-primary rounded-2xl cursor-pointer text-white'>
                        Acceso
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className='flex lg:hidden items-center ml-auto space-x-6'>
            {/* <ThemeToggle alwaysWhite={!scrolled} /> */}
            <button className='lg:hidden cursor-pointer' onClick={() => setMenuOpen(true)}>
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

            <ul className='space-y-2'>
                <li className='mb-6'>

                  <img src="/logo.png" alt="logo" className='w-10 h-auto' />


                </li>
                <li className='py-3'>
                    <a href='#Principal' onClick={() => setMenuOpen(false)} className='flex items-center text-text-secondary hover:text-text font-bold text-[15px]'>
                        <HomeIcon className="w-6 h-6 mr-2" />
                        <p>Inicio</p>
                    </a>
                </li>
                <li className=' py-3'>
                    <a href='#Datos' onClick={() => setMenuOpen(false)} className='flex items-center text-text-secondary hover:text-text font-bold text-[15px]'>
                        <InformationCircleIcon className="w-6 h-6 mr-2" />
                        <p>Datos</p>
                    </a>
                </li>
                <li className='py-3'>
                    <a href='#Moreabout' onClick={() => setMenuOpen(false)} className='flex items-center text-text-secondary hover:text-text font-bold text-[15px]'>
                        <IdentificationIcon className="w-6 h-6 mr-2" />
                        <p>Descubre Más</p>
                    </a>
                </li>
                <li className=' py-3'>
                    <a href='#testimonials' onClick={() => setMenuOpen(false)} className='flex items-center text-text-secondary hover:text-text font-bold text-[px]'>
                        <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2" />
                        <p>Reseñas</p>
                    </a>
                </li>
                <li className=' py-3'>
                    <a href='#FAQ' onClick={() => setMenuOpen(false)} className='flex items-center text-text-secondary hover:text-text font-bold text-[px]'>
                        <QuestionMarkCircleIcon className="w-6 h-6 mr-2" />
                        <p>Preguntas</p>
                    </a>
                </li>
                <li className=' py-3'>
                    <a href='#contacto' onClick={() => setMenuOpen(false)} className='flex items-center text-text-secondary hover:text-text font-bold text-[px]'>
                        <DevicePhoneMobileIcon className="w-6 h-6 mr-2" />
                        <p>Contacto</p>
                    </a>
                </li>
            </ul>

            <ul className='mt-4'>
              <li className='flex w-full py-3'>
                <Link href="/session?register=true" className='flex justify-center items-center w-full px-4 py-2.5 text-sm rounded font-bold bg- transition-colors cursor-pointer'>
                  Registro
                </Link>
              </li>
              <li className='flex py-3 w-full'>
                <Link href="/session" className='flex justify-center items-center w-full px-4 py-2.5 text-sm rounded font-bold text-white bg-primary transition-colors cursor-pointer'>
                  Acceso
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