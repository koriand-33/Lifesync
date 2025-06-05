import React from 'react';
import Image from 'next/image';

const userTestimonials = [
  {
    name: 'Carlos M.',
    occupation: 'Estudiante Universitario',
    testimonial:
      "Desde que uso esta app, siento que tengo el control de mi semana. ¡Ya no dejo todo para el último momento!",
  },
  {
    name: 'Laura G.',
    occupation: 'Estudiante Universitario - IA',
    testimonial:
      "Nunca pensé que un modelo de IA como KNN pudiera ayudarme tanto con mi rutina. Súper útil y fácil de usar.",
  },
  {
    name: 'Ricardo S.',
    occupation: 'Estudiante de Ingeniería',
    testimonial:
      "Recomiendo esta herramienta a todos mis compañeros. Me ayudó a mejorar mis hábitos de estudio sin estrés.",
  },
  {
    name: 'Ana T.',
    occupation: 'Estudiante de Ingeniería',
    testimonial:
      "“Organizarme era mi talón de Aquiles. Ahora estudio más y duermo mejor. Gracias a esta app, he mejorado mi rendimiento académico y mi bienestar general.",
  },
  {
    name: 'Miguel P.',
    occupation: 'Estudiante Universitario - IA',
    testimonial:
      "La interfaz es intuitiva y las recomendaciones tienen sentido. ¡Se nota que fue hecha por estudiantes para estudiantes!",
  },
  {
    name: 'María L.',
    occupation: 'Estudiante Universitario - IA',
    testimonial:
      "Finalmente encontré una app que entiende mi ritmo como estudiante. Ya no me siento tan abrumado. ¡Gracias por crear algo tan útil!",
  },
];

const logos = [
//   '/logos/sydney.svg',
//   '/logos/bern.svg',
//   '/logos/montreal.svg',
//   '/logos/terra.svg',
//   '/logos/colorado.svg',
//   '/logos/ankara.svg',
];

export default function Experiencias() {
  return (
    <section id="testimonials" className="py-16 px-4 sm:px-8 lg:px-16 flex flex-col items-center gap-12">
      <div className="w-full md:w-3/5 text-center">
        <h2 className="text-3xl font-bold text-text mb-4">Testimonios</h2>
        <p className="text-text">
          Descubre lo que nuestros clientes aman de nuestros productos. 
          Descubre cómo destacamos en eficiencia, durabilidad y satisfacción. 
          Únete a nosotros por calidad, innovación y soporte confiable
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
        {userTestimonials.map((testimonial, index) => (
          <div key={index} className="bg-details p-4 rounded-2xl shadow-md flex flex-col justify-between h-full">
            <p className="text-sm text-text mb-4">{testimonial.testimonial}</p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full">
                    <Image
                        src="/landing/img_usuario.png"
                        alt="User Avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                </div>
                <div>
                  <p className="font-semibold text-text">{testimonial.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.occupation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
