import React from 'react';

const TextoSession = ({ onRegisterClick }) => {
  return (
    <>

    <div className='hidden md:block '>
        <div className="flex items-center lg:justify-center p-8 min-h-screen">
        <div className=' flex flex-col items-center justify-center w-3/4 min-h-[50vh] rounded-xl p-12 space-y-8 text-center'>
            <h1 className="text-5xl font-bold ">¡Bienvenido de nuevo!</h1>
            <p className="text-xl max-w-2xl leading-relaxed mb-10">
            Accede a tu cuenta para disfrutar de todos los beneficios de nuestro portal. 
            Si aún no tienes una cuenta, regístrate fácilmente.
            </p>
            <button onClick={onRegisterClick} className="px-8 py-3 bg-text text-background rounded-lg font-boldtransition-transform hover:scale-105 shadow-lg">
            Registrarse
            </button>
        </div>
        </div>
    </div>

    
        {/* Mobile view  arriba*/}
    <div className='block md:hidden h-1/2' >
        <div className="flex min-w-screen">
        <div className='flex flex-col items-center h-4/5 min-h-[50vh] rounded-xl sm:p-12 space-y-8 text-center'>
            <h1 className="text-3xl sm:text-5xl font-bold ">¡Bienvenido de nuevo!</h1>
            <p className="text-base sm:text-xl max-w-2xl leading-relaxed mb-10">
            Accede a tu cuenta para disfrutar de todos los beneficios de nuestro portal. 
            Si aún no tienes una cuenta, regístrate fácilmente.
            </p>
            <button onClick={onRegisterClick} className="px-8 py-3 bg-text text-background rounded-lg font-bold transition-transform hover:scale-105 shadow-lg">
            Registrarse
            </button>
        </div>
        </div>
    </div>

    </>
  );
};

export default TextoSession;