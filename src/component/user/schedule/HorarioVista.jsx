import React from "react";
import { useEffect } from "react";

const dias = ["Lun", "Mar", "Mié", "Jue", "Vie"];

export default function HorarioVista({ horario, onEditar, API }) {
  if (!horario) return null;

  let materias, clases, extras, horarios_materias;
  
  if (API) {
    ({ materias, clases, extras, horarios_materias } = horario);
  } else {
    ({ materias, clases, extras } = horario);
  }

  // console.log("HorarioVista renderizado con datos:", horario);
  // console.log("Materias:", materias);
  // console.log("API:", API);
  // console.log(`Materias API Dia:`, horario.horarios_materias);

  const getColor = (nombre) => materias?.[nombre]?.color || "#008f39";

    // useEffect(() => {
    //     console.log("HorarioVista renderizado con datos:", horario);
    // }, [horario]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Mi Horario {API ? " (desde API)" : " (personalizado)"}
      </h2>

      {dias.map((dia) => {
        const materiasDia = clases?.[dia] || [];
        const extrasDia = extras?.[dia] || [];
        const materiasAPIDia = API && horarios_materias ? (horarios_materias[dia] || []) : [];
        // console.log(`MateriasAPI para ${dia}:`, materiasAPIDia);

        const todasActividades = [
          ...materiasDia.map((a) => ({
            tipo: "materia",
            nombre: a.materia,
            inicio: a.horaInicio,
            fin: a.horaFin,
            color: getColor(a.materia),
          })),
          ...materiasAPIDia.map(a => ({
            tipo: "estudio",
            origen: "api",
            nombre: a.nombre || a.materia,
            inicio: a.hora_inicio || a.horaInicio,
            fin: a.hora_fin || a.horaFin,
            color: "#001a57",
          })),
          ...extrasDia.map((a) => ({
            tipo: "extra",
            nombre: a.actividad,
            inicio: a.inicio,
            fin: a.fin,
            color: "bg-blue-600",
          })),
        ];

        // console.log("Actividades completas:", todasActividades.map(a => ({
        //   nombre: a.nombre,
        //   tipo: a.tipo,
        //   inicio: a.inicio,
        //   esUndefined: typeof a.inicio === 'undefined',
        //   esNull: a.inicio === null,
        //   esString: typeof a.inicio === 'string'
        // })));


        todasActividades.sort((a, b) => a.inicio.localeCompare(b.inicio));

        return (
          <div key={dia} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{dia}</h3>

            {todasActividades.length > 0 ? (
              <div className="space-y-2">
                {todasActividades.map((act, idx) => {
                  const esDormir = act.tipo === "extra" && act.nombre === "Dormirse";

                  const textoHorario = esDormir
                    ? `${act.nombre} de ${act.fin} (Día anterior) a ${act.inicio} (Día actual)`
                    : `${act.nombre} de ${act.inicio} a ${act.fin}`;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg text-white ${
                        act.tipo === "extra" ? "bg-blue-600" : ""
                      }`}
                      style={act.tipo === "materia" || act.tipo === "estudio"  ? { backgroundColor: act.color } : {}}
                    >
                      <strong>{textoHorario}</strong>
                      {act.tipo === "extra" && (
                        <span className="ml-2 text-sm bg-white text-blue-600 px-2 py-0.5 rounded">
                          Actividad Base
                        </span>
                      )}
                      {act.tipo === "estudio" && (
                        <span className="ml-2 text-sm bg-white text-blue-600 px-2 py-0.5 rounded">
                          Estudio
                        </span>
                      )}
                      {act.tipo === "materia" && (
                        <span className="ml-2 text-sm bg-white text-blue-600 px-2 py-0.5 rounded">
                          Clase
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">Sin actividades registradas</p>
            )}
          </div>
        );
      })}

      {!API &&
      <div className="flex justify-center mt-8">
        <button
          onClick={onEditar}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
           Editar horario
        </button>
      </div>
      }
    </div>
  );
}
