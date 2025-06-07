'use client';
import React, { useEffect, useState } from "react";
import CalendarComponent from "@/component/user/calendar/CalendarComponent";

const dias = ["Lun", "Mar", "Mié", "Jue", "Vie"];

export default function HorarioVista() {
 
  return (
    <div className="w-full h-screen">
      <CalendarComponent />
    </div>
  );
}
