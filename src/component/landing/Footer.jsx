"use client";
import { Mail, Github, Linkedin, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer id="Footer" className="border-t py-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Image
            src="/logo.png"
            alt="LIFESYNC logo"
            width={140}
            height={60}
            priority
          />
          <h4 className="mt-4 font-semibold text-gray-900">Newsletter</h4>
          <p className="text-sm text-gray-600 mb-3">
            Suscríbete para recibir consejos de organización y novedades de LIFESYNC.
          </p>
          <form className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg"
            >
              Suscribirme
            </button>
          </form>
        </div>

        {/* Navegación */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Producto</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li><a href="#features" className="hover:text-indigo-600">Características</a></li>
            <li><a href="#testimonials" className="hover:text-indigo-600">Testimonios</a></li>
            <li><a href="#highlights" className="hover:text-indigo-600">Beneficios</a></li>
            <li><a href="#pricing" className="hover:text-indigo-600">Precios</a></li>
            <li><a href="#faq" className="hover:text-indigo-600">FAQs</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Compañía</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li><a href="#about" className="hover:text-indigo-600">Sobre nosotros</a></li>
            <li><a href="#careers" className="hover:text-indigo-600">Vacantes</a></li>
            <li><a href="#contact" className="hover:text-indigo-600">Contacto</a></li>
          </ul>
        </div>
      </div>

      {/* Línea divisoria y sección final */}
      <div className="mt-10 pt-6 border-t flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <Link href="/privacy" className="hover:text-indigo-600">Política de Privacidad</Link>
          <span className="hidden sm:inline-block">&bull;</span>
          <Link href="/terms" className="hover:text-indigo-600">Términos de uso</Link>
          <span className="sm:ml-4">© {new Date().getFullYear()} LIFESYNC</span>
        </div>

        {/* Redes sociales */}
        <div className="flex gap-4 mt-4 md:mt-0">
          <a
            href="https://github.com/tuusuario"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-indigo-600"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://twitter.com/tuusuario"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="hover:text-indigo-600"
          >
            <X className="w-5 h-5" />
          </a>
          <a
            href="https://linkedin.com/in/tuusuario"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-indigo-600"
          >
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
