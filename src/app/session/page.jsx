// nuevo page 3v

"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AnimatedCircle from '@/component/session/fondo/AnimatedCircles';
import FormInicioSession from '@/component/session/FormInicioSession';
import FormInicioRegistro from '@/component/session/FormInicioRegistro';
import TextoRegistro from '@/component/session/TextoRegistro';
import TextoSession from '@/component/session/TextoSession';
import Loading from '@/component/loading/loading';
// import FormInicioRegistroProveedor from '@/component/session/FormInicioRegistroProveedor';


const SessionContent   = () => {
  const [isRight, setIsRight] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar si hay un parámetro 'register' en la URL
    const registerParam = searchParams.get('register');
    if (registerParam === 'true') {
      setIsRight(true);
    }
  }, [searchParams]);

  const togglePosition = () => {
    setIsRight(!isRight);
  };

  return (
    <div className=''>
      <AnimatedCircle isRight={isRight}>
        <div className='flex flex-col md:flex-row w-full h-full'>

          {/* Mitad izquierda - Acceso */}
          <div className="flex items-center justify-center md:w-1/2">
            <div className={`h-full w-full ${isRight ? 'hidden' : 'block'}`}>             
              <TextoSession onRegisterClick={togglePosition} />
            </div>

            <div className={`p-2 ${isRight ? 'block' : 'hidden'}`}>
              <div className='hidden md:flex flex-col justify-center items-center'>
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <div className='flex flex-col w-full'>
                    <div className="w-full pt-10">
                      <FormInicioRegistro />
                    </div>
                  </div>
                </div>
              </div>

              <div className='block md:hidden'>
                <TextoRegistro onRegisterClick={togglePosition} />
              </div>
            </div>
          </div>

          {/* Mitad derecha - Registro */}
          <div className="flex md:items-center justify-center md:w-1/2">
            <div className={`flex items-center justify-center h-full w-full ${isRight ? 'hidden' : 'block'}`}>
              <FormInicioSession />
            </div>

            <div className={isRight ? 'block' : 'hidden'}>
              <div className='hidden md:block'>
                <TextoRegistro onRegisterClick={togglePosition} />
              </div>
            </div>

            <div className={`${isRight ? 'md:hidden block' : 'hidden'}`}>
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className='flex flex-col w-full'>
                  <div className="w-full">
                    <FormInicioRegistro />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </AnimatedCircle>
    </div>
  );
};

const Acceso = () => {
  return (
    <React.Suspense fallback={<Loading/>}>
      <SessionContent />
    </React.Suspense>
  );
};

export default Acceso;
