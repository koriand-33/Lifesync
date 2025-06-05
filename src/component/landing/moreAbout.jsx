import React from 'react'

const MoreAbout = () => {
  return (
       <div id='Moreabout' className='flex flex-col lg:flex-row  items-center justify-center mt-5 h-50vh '>
      {/* Texto principal */}
      <div className='w-full lg:w-1/2 p-10'>
        <h1 className='text-4xl font-bold text-text mb-5'>Organiza tu Semana con IA: Tu Aliado en la Gestión del Tiempo</h1>
        <p className='mt-10 text-lg mb-5'>
          ¿Eres estudiante de ESCOM de 5to semestre de IA y sientes que el tiempo no te alcanza? ¿O quizás eres de otra carrera o semestre y buscas una forma más inteligente de organizar tus estudios? ¡Tenemos la solución!
        </p>
        <p className='mt-5 text-lg'>Nuestra aplicación está diseñada para transformar la manera en que gestionas tu tiempo. Olvídate del estrés y la desorganización, y dale la bienvenida a la eficiencia potenciada por la inteligencia artificial.</p>

      </div>
      {/* Imagen principal */}
      <div className='flex w-full items-center justify-center lg:w-1/2 rounded-xl md:rounded-lg md:p-20'>
        <img src="/landing/about/agenda.jpg" alt="imagen Principal" className='w-full rounded-full'/>
      </div>


    </div>
  )
}

export default MoreAbout