import React from 'react'
import Card from './card'

const CardInfo = () => {
  return (
    <div id='Datos' className="scroll-mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
                <Card href='/landing/cards/planificacion.png' titulo='Organización inteligente' descripcion='Recibe recomendaciones personalizadas sobre cómo distribuir tu tiempo de estudio, basadas en tu carga académica.'/>
            </div>
            <div>
                <Card href='/landing/cards/posiciones.png' titulo='Accesible desde cualquier lugar' descripcion='Plataforma web responsiva. Consulta tu plan de estudio desde tu celular, tablet o laptop sin complicaciones.'/>
            </div>
            <div>
                <Card href='/landing/cards/productividad.png' titulo='Impulsa tu productividad' descripcion='Evita la procrastinación con sugerencias automáticas de estudio que se adaptan a ti.'/>
            </div>
            <div>
                <Card href='/landing/cards/sofa.png' titulo='Mejora tu bienestar' descripcion='Reduce el estrés académico y mejora tu descanso con una planificación eficiente y clara.'/>
            </div>
        </div>
    </div>
  )
}

export default CardInfo