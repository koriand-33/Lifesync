"use client";
import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const faqs = [
  {
    question: "¿Qué es LIFESYNC?",
    answer:
      "LIFESYNC es una plataforma impulsada por inteligencia artificial que te ayuda a organizar tu vida académica. Analiza tu carga escolar, tus tareas y tus tiempos libres para crear un horario de estudio totalmente personalizado y eficiente.",
  },
  {
    question: "¿Cómo funciona LIFESYNC?",
    answer:
      "Solo necesitas ingresar tu horario fijo, tus horas disponibles y las tareas o temas que necesitas estudiar. LIFESYNC usará IA para generar un plan de estudio que se adapta a tus necesidades y maximiza tu productividad.",
  },
  {
    question: "¿Es seguro usar LIFESYNC?",
    answer:
      "Sí, tu información es completamente confidencial. No compartimos tus datos con terceros y todo el procesamiento ocurre en un entorno seguro y privado.",
  },
  {
    question: "¿Qué necesito para comenzar?",
    answer:
      "Solo necesitas registrarte e ingresar tus datos académicos básicos. La plataforma está diseñada para ser intuitiva, rápida y fácil de usar, incluso si es tu primera vez con una herramienta de organización inteligente.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="FAQ" className="px-4 py-16 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <SparklesIcon className="w-10 h-10 mx-auto text-indigo-500" />
        <h2 className="text-4xl font-bold mt-4">Preguntas Frecuentes</h2>
        <p className="mt-2 text-gray-600">
          Descubre cómo LIFESYNC puede ayudarte a optimizar tu tiempo y lograr tus metas académicas.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-gray-200 rounded-xl bg-white shadow-sm transition-all"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-4 text-left group"
              >
                <h3 className="text-base md:text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {faq.question}
                </h3>
                {isOpen ? (
                  <ChevronUpIcon className="w-5 h-5 text-indigo-500" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-gray-700">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
