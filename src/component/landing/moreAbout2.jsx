"use client";
import { useState } from "react";

const steps = [
  {
    title: "Ingresa tu Horario Fijo",
    description: "Añade tus clasSes, actividades y compromisos inamovibles.",
    image: "/landing/about/ingreso.jpg",
  },
  {
    title: "Define tus Horas Libres",
    description: "Marca los momentos en los que estás disponible para estudiar o realizar tareas.",
    image: "/landing/about/estudio.jpg",
  },
  {
    title: "Añade tus Tareas y Temas",
    description: "Registra todos los trabajos pendientes, temas a estudiar y proyectos a desarrollar.",
    image: "/landing/about/proyectos.png",
  },
  {
    title: "¡Y listo!",
    description:
      "Nuestra inteligencia artificial tomará toda esta información y creará un horario de estudio personalizado y optimizado, distribuyendo tus actividades de la manera más eficiente posible.",
    image: "/landing/about/listo.jpg",
  },
];

export default function MoreAbout2() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="Moreabout2" className="p-10 mx-auto">
      <h2 className="text-4xl font-bold mb-8 text-center">¿Cómo funciona?</h2>
      <p className="my-10">Es más sencillo de lo que crees. Nuestra aplicación ha sido diseñada para ser intuitiva y fácil de usar. Solo sigue estos pasos para que nuestra inteligencia artificial empiece a trabajar para ti:</p>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                activeStep === index
                  ? "bg-blue-100 border-blue-500 shadow-md"
                  : "bg-white hover:bg-gray-50 border-gray-300"
              }`}
            >
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </button>
          ))}
        </div>

        {/* Image Display */}
        <div className="flex justify-center">
          <div className="w-full max-w-md h-[320px] rounded-xl overflow-hidden shadow-lg">
            <img
              src={steps[activeStep].image}
              alt={`Paso ${activeStep + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>


      </div>
    </section>
  );
}
