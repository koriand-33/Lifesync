import React from 'react';

const MateriaCard = ({ materia }) => {
  return (
    <div className={`rounded-lg p-4 mb-4 border-l-4 ${materia.color} shadow-md hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1`}>
      <h3 className={`text-xl font-bold mb-2 pb-2 border-b-2 ${materia.color.split(' ')[1]}`}>
        {materia.nombre}
      </h3>
      
      <div className="space-y-2 mb-3">
        <p><span className="font-semibold">Profesor:</span> {materia.profesor}</p>
        <p><span className="font-semibold">Horario:</span> {materia.horario}</p>
        <p><span className="font-semibold">Aula:</span> {materia.aula}</p>
        <p><span className="font-semibold">Créditos:</span> {materia.creditos}</p>
      </div>
      
      <div className="bg-white p-3 rounded-md">
        <p className="text-gray-700">{materia.descripcion}</p>
      </div>
    </div>
  );
};

export default MateriaCard;