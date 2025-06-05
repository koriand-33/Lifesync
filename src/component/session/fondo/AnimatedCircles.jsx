"use client";
import { Link } from "lucide-react";
import { FC, ReactNode } from "react";
// import Logosession from '@/components/logo/logoSession/logosession';


/**
 * @typedef {Object} AnimatedCircleProps
 * @property {boolean} [isRight]
 * @property {React.ReactNode} children
 */

const AnimatedCircle = ({ isRight = false, children }) => {
  return (
    <div className="relative h-[100%] overflow-hidden">
      {/* h-screen */}
      {/* Fondo animado */}
      <div className="hidden md:block absolute inset-0 z-0">
        <div
          className={`absolute w-[200%] h-[200%] bg-details rounded-full transition-transform duration-700 ease-in-out
            ${isRight ? "translate-x-1/2" : "-translate-x-1/2"}`}
          style={{ top: "-50%", left: "-50%" }}
        />
      </div>
      <div className="block md:hidden absolute inset-0 z-0">
        <div
          className={`absolute w-[200%] h-[200%] bg-details rounded-full transition-transform duration-700 ease-in-out
            ${isRight ? "translate-y-1/2" : "-translate-y-1/2"}`}
          style={{ top: "-60%", left: "-50%" }}
        />
      </div>

      

      {/* Contenido encima */}
      <div className="relative z-2 w-full h-full">
        <div className="md:absolute flex w-full  ml-20 py-3 ">
          <a href="/" className="flex items-center justify-center cursor-pointer">
            <img src="/logo.png" alt="logo" className="h-12"/>
          </a>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AnimatedCircle;
