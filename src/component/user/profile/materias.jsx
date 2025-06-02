"use client";
import React from 'react';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { materias } from './MateriaData';
import MateriaCard from './CardMateria';

const MateriasCarousel = ({ toggleModal }) => {
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1280 },
      items: 4
    },
    desktop: {
      breakpoint: { max: 1280, min: 1024 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 1024, min: 768 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 768, min: 0 },
      items: 1
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className='flex items-center justify-between mb-10'>
        <h2 className="text-2xl font-bold">Mis Materias</h2>
        {/* <button 
          onClick={toggleModal}
          className="text-white bg-primary cursor-pointer hover:bg-primary-strong focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          type="button"
        >
          Ver mis preferencias
        </button> */}
      </div>
      
      <Carousel 
        responsive={responsive} 
        autoPlay={false}
        autoPlaySpeed={5000}
        infinite={true}
        // arrows={false}
        className="w-full"
        itemClass="px-2"
      >
        {materias.map(materia => (
          <MateriaCard key={materia.id} materia={materia} />
        ))}
      </Carousel>
    </div>
  );
};

export default MateriasCarousel;