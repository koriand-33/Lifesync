/**
 * Calcula el score total del usuario con base en sus tareas completadas.
 * @param {Array<{
 *   duracion: number | null,
 *   dificultad: number | null,
 *   state: boolean
 * }>} tareasCompletadas
 * @returns {number} Score total
 */
export const calcularScore = (tareasCompletadas) => {
  if (!Array.isArray(tareasCompletadas)) return 0;

  let score = 0;

  tareasCompletadas.forEach(tarea => {
    if (tarea.state !== true) return;

    const duracion = tarea.duracion ?? 1;     
    const dificultad = tarea.dificultad ?? 1;

    // Fórmula: (dificultad * duración) * 10
    score += dificultad * duracion * 10;
  });

  return Math.round(score);
};
