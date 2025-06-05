import React from 'react'
// 600 X 357

const Card = ({href, titulo, descripcion}) => {
  return (
    <div className='bg- h-40 p-4 rounded-lg flex items-center bg-details'>
        <div className='flex w-1/3 flex-col justify-center items-center'>
            <img src={href} alt="Card" className='h-20'/>
        </div>
        <div className='ml-5 w-2/3'>
            <h2 className='text-xl  lg:text-lg font-bold text-text mb-3'>{titulo}</h2>
            <p className='text-text text-xs'>{descripcion}</p>
        </div>
    </div>
  )
}

export default Card