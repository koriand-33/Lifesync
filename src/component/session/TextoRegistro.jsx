import React from 'react'
// interface Props {
//     onRegisterClick: () => void;
//   }

const TextoRegistro = ({ onRegisterClick }) => {
  return (
    <>

    <div className='hidden md:block '>
        <div className="flex items-center justify-end lg:justify-center p-8 min-h-screen ">
        <div className=' flex flex-col items-center justify-center w-3/4 min-h-[50vh] rounded-xl p-12 space-y-8 text-center'>
            <h1 className="text-5xl font-bold">¿Ya tienes una cuenta? </h1>
            <p className="text-xl  max-w-2xl leading-relaxed mb-10">
                Inicia sesión para continuar y disfrutar de todos los beneficios de nuestra plataforma. ¡Nos alegra tenerte de vuelta!
            </p>
            <button onClick={onRegisterClick} className="px-8 py-3 bg-text text-background rounded-lg font-bold transition-transform hover:scale-105 shadow-lg">
                Iniciar sesión
            </button>
        </div>
        </div>
    </div>

    <div className='block md:hidden h-1/2' >
        <div className="flex min-w-screen">
        <div className='flex flex-col items-center h-4/5 min-h-[50vh] rounded-xl sm:p-12 space-y-8 text-center'>
            <h1 className="xs:text-3xl text-5xl font-bold">¿Ya tienes una cuenta?</h1>
            <p className="xs:text-base text-xl max-w-2xl leading-relaxed mb-10">
                Inicia sesión para continuar y disfrutar de todos los beneficios de nuestra plataforma. ¡Nos alegra tenerte de vuelta!
            </p>
            <button onClick={onRegisterClick} className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold transition-transform hover:scale-105 shadow-lg">
                Iniciar sesión
            </button>
        </div>
        </div>
    </div>

    </>
  )
}

export default TextoRegistro