import React from 'react'

const Principal = () => {
  return (
    <div className='flex items-center justify-center  mt-5 h-50vh '>

      {/* Imagen principal */}
      <div className='w-1/2 rounded-xl md:rounded-lg p-20'>
        <img src="/landing/principal.jpg" alt="imagen Principal" className='w-50 rounded-full'/>
      </div>

      {/* Texto principal */}
      <div className='w-1/2 p-10'>
        <h1 className='text-4xl font-bold text-text mb-5'>Bienvenido a nuestro sitio web</h1>
        <p className='text-lg text-text-secondary mb-5'>
          Aquí encontrarás información valiosa y recursos útiles para mejorar tu experiencia.
          Explora nuestras secciones y descubre todo lo que tenemos para ofrecerte.
        </p>
        <button className='px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-strong transition-colors'>
          Comenzar
        </button>
      </div>

    </div>
  )
}

export default Principal