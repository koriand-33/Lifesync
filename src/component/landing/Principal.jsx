import React from 'react'

const Principal = () => {
  return (
    <div id='Principal' className='flex flex-col md:flex-row  items-center justify-center h-50vh'>

      {/* Imagen principal */}
      <div className='flex w-full items-center justify-center md:w-1/2 rounded-xl md:rounded-lg md:p-20'>
        <img src="/landing/principal.jpg" alt="imagen Principal" className='md:w-full w-2/5 rounded-full'/>
      </div>

      {/* Texto principal */}
      <div className='w-full md:w-1/2 p-10'>
        <h1 className='text-4xl font-bold text-text mb-5'>Crea tu agenda inteligente con IA y mejora tu organizacion académico</h1>
        <p className='text-lg text-text mb-5'>
          ¿Te cuesta organizar tu tiempo de estudio? Prueba nuestra aplicación web con Inteligencia Artificial que te recomienda cuándo y cómo estudiar de forma personalizada. Organiza tus actividades, evita la procrastinación y mejora tu productividad desde cualquier lugar.
        </p>
        <button className='px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-strong transition-colors'>
          Comenzar
        </button>
      </div>

    </div>
  )
}

export default Principal