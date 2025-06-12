from sklearn.neighbors import KNeighborsRegressor, KNeighborsClassifier
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import numpy as np
from datetime import datetime, timedelta
import json
from copy import deepcopy
from statistics import mode


mapeo_dias = {
    "Monday": "lunes",
    "Tuesday": "martes",
    "Wednesday": "miércoles",
    "Thursday": "jueves",
    "Friday": "viernes",
    "Saturday": "sábado",
    "Sunday": "domingo",
}


def leer_json(ruta: str):
    with open(ruta, "r", encoding="utf-8") as archivo:
        datos = json.load(archivo)
    return datos


def asignar_tareas(json: dict, tiempo_semanal: float, frecuencias: dict):
    from datetime import datetime, timedelta
    from statistics import mean

    tareas_actividad = {}

    # Mapeo de números de día a nombres en español
    dias_semana = {
        0: "lunes",
        1: "martes",
        2: "miércoles",
        3: "jueves",
        4: "viernes",
        5: "sábado",
        6: "domingo",
    }

    # Obtener fecha actual
    fecha_actual = datetime.now().date()

    # Diccionario auxiliar para tracking de materias (para aplicar frecuencias por materia)
    tareas_por_materia = {}
    for materia in json["tareas"].keys():
        tareas_por_materia[materia] = 0

    # Procesar cada tarea y crear el diccionario principal
    for materia in json["tareas"].keys():
        for tarea in json["tareas"][materia]:
            descripcion = tarea["descripcion"]
            tiempo_total = tarea["tiempoDuracion"] / 60

            # Procesar fecha de entrega
            fecha_entrega = datetime.strptime(tarea["fechaEntrega"], "%Y-%m-%d").date()

            # Calcular días faltantes
            dias_faltantes = (fecha_entrega - fecha_actual).days

            # Determinar día de la semana (solo si es <= 7 días)
            if dias_faltantes <= 7:
                dia_semana = dias_semana[fecha_entrega.weekday()]
                # Todo el tiempo va en tiempo_horas
                tiempo_horas = tiempo_total
                tiempo_horas_sig = None
            else:
                dia_semana = None
                # Algoritmo de distribución de tiempo según días faltantes
                # Los primeros 7 días reciben una proporción del trabajo total
                # Fórmula: entre 30% y 70% dependiendo de cuántos días falten
                factor_base = 7 / dias_faltantes  # Proporción básica
                factor_ajustado = 0.3 + (0.4 * factor_base)  # Entre 30% y 70%
                factor_ajustado = min(factor_ajustado, 0.7)  # Máximo 70%

                tiempo_horas = tiempo_total * factor_ajustado
                tiempo_horas_sig = tiempo_total - tiempo_horas

            # Crear entrada en el diccionario principal
            tareas_actividad[descripcion] = {
                "tiempo_horas": tiempo_horas,
                "tiempo_horas_sig": tiempo_horas_sig,
                "dia_semana": dia_semana,
                "fecha_entrega": tarea["fechaEntrega"],
                "dias_faltantes": dias_faltantes,
                "materia": materia,  # Guardamos la materia para aplicar frecuencias
                "tiempo_total_original": tiempo_total,  # Para aplicar frecuencias correctamente
            }

            # Actualizar contador por materia (con tiempo total original)
            tareas_por_materia[materia] += tiempo_total

    # Función auxiliar para recalcular distribución de tiempo
    def recalcular_distribucion_tiempo(tiempo_total_nuevo, dias_faltantes):
        """Recalcula la distribución entre tiempo_horas y tiempo_horas_sig"""
        if dias_faltantes <= 7:
            return tiempo_total_nuevo, None
        else:
            factor_base = 7 / dias_faltantes
            factor_ajustado = 0.3 + (0.4 * factor_base)
            factor_ajustado = min(factor_ajustado, 0.7)

            tiempo_horas = tiempo_total_nuevo * factor_ajustado
            tiempo_horas_sig = tiempo_total_nuevo - tiempo_horas
            return tiempo_horas, tiempo_horas_sig

    # Aplicar frecuencias
    tareas_procesadas = set()

    for key in frecuencias.keys():
        # Si es una actividad específica
        if key in tareas_actividad and key not in tareas_procesadas:
            tiempo_total_original = tareas_actividad[key]["tiempo_total_original"]
            tiempo_total_ajustado = (tiempo_total_original * frecuencias[key]) / mean(
                frecuencias.values()
            )

            # Recalcular distribución con el nuevo tiempo total
            dias_faltantes = tareas_actividad[key]["dias_faltantes"]
            nuevo_tiempo_horas, nuevo_tiempo_horas_sig = recalcular_distribucion_tiempo(
                tiempo_total_ajustado, dias_faltantes
            )

            # Actualizar tiempos en el diccionario principal
            tareas_actividad[key]["tiempo_horas"] = nuevo_tiempo_horas
            tareas_actividad[key]["tiempo_horas_sig"] = nuevo_tiempo_horas_sig
            tareas_actividad[key]["tiempo_total_original"] = tiempo_total_ajustado
            tareas_procesadas.add(key)

            # Actualizar también el tracking por materia
            materia = tareas_actividad[key]["materia"]
            tareas_por_materia[materia] -= tiempo_total_original
            tareas_por_materia[materia] += tiempo_total_ajustado

        # Si es una materia completa
        elif key in tareas_por_materia:
            factor_ajuste = frecuencias[key] / mean(frecuencias.values())

            # Actualizar todas las actividades de esta materia
            for descripcion, datos in tareas_actividad.items():
                if datos["materia"] == key and descripcion not in tareas_procesadas:
                    tiempo_total_original = datos["tiempo_total_original"]
                    tiempo_total_ajustado = tiempo_total_original * factor_ajuste

                    # Recalcular distribución con el nuevo tiempo total
                    dias_faltantes = datos["dias_faltantes"]
                    nuevo_tiempo_horas, nuevo_tiempo_horas_sig = (
                        recalcular_distribucion_tiempo(
                            tiempo_total_ajustado, dias_faltantes
                        )
                    )

                    # Actualizar tiempos
                    tareas_actividad[descripcion]["tiempo_horas"] = nuevo_tiempo_horas
                    tareas_actividad[descripcion][
                        "tiempo_horas_sig"
                    ] = nuevo_tiempo_horas_sig
                    tareas_actividad[descripcion][
                        "tiempo_total_original"
                    ] = tiempo_total_ajustado
                    tareas_procesadas.add(descripcion)

    # Calcular tiempo restante (solo sumando tiempo_horas, no tiempo_horas_sig)
    tiempo_total_primera_semana = sum(
        datos["tiempo_horas"] for datos in tareas_actividad.values()
    )
    tiempo_restante = tiempo_semanal - tiempo_total_primera_semana

    # Limpiar los campos auxiliares del output final
    for descripcion in tareas_actividad:
        del tareas_actividad[descripcion]["materia"]
        del tareas_actividad[descripcion]["tiempo_total_original"]

    # Crear resultado final
    resultado = {"tareas": tareas_actividad, "tiempo_restante": tiempo_restante}

    return resultado


def calc_dif_horas(inicio, fin):
    inicio_parts = inicio.split(":")
    fin_parts = fin.split(":")

    inicio_horas = int(inicio_parts[0]) + int(inicio_parts[1]) / 60
    fin_horas = int(fin_parts[0]) + int(fin_parts[1]) / 60

    diferencia = fin_horas - inicio_horas

    # Si la diferencia es negativa, significa que cruza medianoche (ej: 23:00 a 06:44)
    if diferencia < 0:
        diferencia += 24

    return diferencia


def obtener_tiempo_libre(json: dict, frecuencias: dict):
    tiempo_libre_total = {}
    periodos_libres = {}
    momento_mas_libre = {}

    # Momentos del día a evaluar (en formato decimal)
    momentos_evaluar = [8.5, 11.5, 14.5, 17.5, 20.5]

    def decimal_a_hora(decimal):
        """Convierte hora decimal a formato HH:MM"""
        horas = int(decimal)
        minutos = int((decimal - horas) * 60)
        return f"{horas:02d}:{minutos:02d}"

    def hora_a_decimal(hora_str):
        """Convierte formato HH:MM a decimal"""
        partes = hora_str.split(":")
        return int(partes[0]) + int(partes[1]) / 60

    def calcular_tiempo_libre_momento(periodos, momento_decimal):
        """Calcula cuánto tiempo libre hay alrededor de un momento específico"""
        tiempo_total = 0
        momento_str = decimal_a_hora(momento_decimal)

        for inicio, fin in periodos:
            inicio_decimal = hora_a_decimal(inicio)
            fin_decimal = hora_a_decimal(fin)

            # Si el momento está dentro del período libre
            if inicio_decimal <= momento_decimal <= fin_decimal:
                # Sumar todo el período
                tiempo_total += fin_decimal - inicio_decimal
            # Si el período está cerca del momento (dentro de 2 horas)
            elif (
                abs(inicio_decimal - momento_decimal) <= 2
                or abs(fin_decimal - momento_decimal) <= 2
            ):
                # Sumar una fracción basada en la cercanía
                distancia_inicio = abs(inicio_decimal - momento_decimal)
                distancia_fin = abs(fin_decimal - momento_decimal)
                distancia_min = min(distancia_inicio, distancia_fin)

                if distancia_min <= 2:
                    # Dar más peso a períodos más cercanos
                    peso = (2 - distancia_min) / 2
                    tiempo_total += (fin_decimal - inicio_decimal) * peso

        return tiempo_total

    for dia in json["extras"].keys():
        # Recopilar todos los períodos ocupados del día
        ocupados = []

        # Agregar actividades extras (excepto "Dormirse" que manejamos especial)
        for actividad in json["extras"][dia]:
            if actividad["actividad"] != "Dormirse":
                ocupados.append((actividad["inicio"], actividad["fin"]))

        # Agregar clases si existen para este día
        if dia in json["clases"]:
            for clase in json["clases"][dia]:
                ocupados.append((clase["horaInicio"], clase["horaFin"]))

        # Ordenar por hora de inicio
        ocupados.sort(key=lambda x: x[0])

        # Encontrar períodos libres entre actividades
        libres = []
        tiempo_total = 0

        if ocupados:
            # Empezar desde el fin del desayuno en lugar de la hora de despertar
            primer_inicio = ocupados[0][0]  # Hora del desayuno

            # Períodos libres entre actividades (empezando desde después del desayuno)
            for i in range(len(ocupados) - 1):
                fin_actual = ocupados[i][1]
                inicio_siguiente = ocupados[i + 1][0]

                if fin_actual != inicio_siguiente:
                    tiempo_libre = calc_dif_horas(fin_actual, inicio_siguiente)
                    if tiempo_libre > 0:
                        libres.append((fin_actual, inicio_siguiente))
                        tiempo_total += tiempo_libre

            # Período libre al final del día (antes de dormir)
            hora_dormir = None
            for actividad in json["extras"][dia]:
                if actividad["actividad"] == "Dormirse":
                    hora_dormir = actividad["inicio"]
                    break

            if hora_dormir and ocupados[-1][1] != hora_dormir:
                tiempo_libre = calc_dif_horas(ocupados[-1][1], hora_dormir)
                if tiempo_libre > 0:
                    libres.append((ocupados[-1][1], hora_dormir))
                    tiempo_total += tiempo_libre

        # Calcular el momento más libre del día
        tiempo_por_momento = {}
        for momento in momentos_evaluar:
            tiempo_por_momento[momento] = calcular_tiempo_libre_momento(libres, momento)

        # Encontrar el momento con más tiempo libre
        momento_optimo = max(tiempo_por_momento, key=tiempo_por_momento.get)

        tiempo_libre_total[dia] = tiempo_total
        periodos_libres[dia] = libres
        momento_mas_libre[dia] = momento_optimo

    mats = [
        "Algoritmos Bioinspirados",
        "Procesamiento de Señales",
        "Teoría de la Computación",
        "Tecnologías del Lenguaje Natural",
        "Aprendizaje de Máquina",
        "Visión Artificial",
    ]
    materias = {}
    for mat in mats:
        materias[mat] = json["materias"][mat]["prioridad"] ** 0.8 * frecuencias[mat]

    return {
        "tiempo_total_libre": tiempo_libre_total,
        "periodos_libres": periodos_libres,
        "momento_mas_libre": momento_mas_libre,
        "materias": materias,
    }


import numpy as np
from datetime import datetime, timedelta


def asignar_horarios_estudio(
    horas_materias: dict,
    periodos_libres: dict,
    tareas_actividad: dict,
    tiempo_total_libre: dict,
    dia_actual: str,
    hora_actual: str,
    tiempo_sabado: float,
    tiempo_domingo: float,
):
    horarios_materias = {}
    horarios_tareas = {}

    # Mapeo de días
    dias_completos = {
        "lunes": "Lun",
        "martes": "Mar",
        "miércoles": "Mié",
        "jueves": "Jue",
        "viernes": "Vie",
        "sábado": "Sab",
        "domingo": "Dom",
    }

    dias_orden_original = ["Lun", "Mar", "Mié", "Jue", "Vie"]

    def hora_a_decimal(hora_str):
        partes = hora_str.split(":")
        return int(partes[0]) + int(partes[1]) / 60

    def decimal_a_hora(decimal):
        horas = int(decimal)
        minutos = int((decimal - horas) * 60)
        return f"{horas:02d}:{minutos:02d}"

    # PASO 1: Determinar el orden de días basado en el día actual
    dia_actual_abrev = dias_completos[dia_actual]
    hora_actual_decimal = hora_a_decimal(hora_actual)

    # Si es sábado o domingo, usar la lógica tradicional (lunes a viernes)
    if dia_actual_abrev in ["Sab", "Dom"]:
        dias_semana_orden = dias_orden_original.copy()
        ajustar_primer_dia = False
        incluir_proxima_semana = False
    else:
        # Reordenar días empezando desde hoy
        indice_actual = dias_orden_original.index(dia_actual_abrev)
        dias_semana_orden = (
            dias_orden_original[indice_actual:] + dias_orden_original[:indice_actual]
        )
        ajustar_primer_dia = True
        incluir_proxima_semana = True

    # PASO 2: Agregar días de la próxima semana si es necesario
    if incluir_proxima_semana:
        # Agregar todos los días de la próxima semana hasta el día actual (inclusive)
        indice_actual = dias_orden_original.index(dia_actual_abrev)
        dias_proxima_semana = dias_orden_original[
            : indice_actual + 1
        ]  # Incluir el día actual
        dias_proxima_semana_con_sufijo = [f"{dia}_p" for dia in dias_proxima_semana]
        dias_semana_orden.extend(dias_proxima_semana_con_sufijo)

    # FUNCIONALIDAD EXTRA: Eliminar duplicados (excepto el día actual)
    def eliminar_duplicados_excepto_actual(lista_dias, dia_actual_abrev):
        """Elimina días duplicados, priorizando los que terminan en '_p', excepto el día actual"""
        dias_finales = []
        dias_base_procesados = set()

        for dia in lista_dias:
            dia_base = dia[:-2] if dia.endswith("_p") else dia

            # Si es el día actual, siempre incluirlo (no eliminar duplicados)
            if dia_base == dia_actual_abrev:
                dias_finales.append(dia)
            elif dia_base not in dias_base_procesados:
                # Primera vez que vemos este día base (y no es el día actual)
                dias_finales.append(dia)
                dias_base_procesados.add(dia_base)
            elif dia.endswith("_p"):
                # Si ya existe el día base pero este termina en "_p", reemplazar
                for i, dia_existente in enumerate(dias_finales):
                    dia_existente_base = (
                        dia_existente[:-2]
                        if dia_existente.endswith("_p")
                        else dia_existente
                    )
                    if dia_existente_base == dia_base and not dia_existente.endswith(
                        "_p"
                    ):
                        dias_finales[i] = dia  # Reemplazar con la versión "_p"
                        break

        return dias_finales

    # Aplicar la eliminación de duplicados
    if incluir_proxima_semana:
        dias_semana_orden = eliminar_duplicados_excepto_actual(
            dias_semana_orden, dia_actual_abrev
        )

    # PASO 3: Ajustar períodos del primer día (día actual) según la hora actual
    def ajustar_periodos_primer_dia(periodos_dia, hora_limite):
        """Ajusta los períodos del primer día para empezar desde la hora actual"""
        periodos_ajustados = []
        hora_limite_decimal = hora_a_decimal(hora_limite)

        for inicio, fin in periodos_dia:
            inicio_decimal = hora_a_decimal(inicio)
            fin_decimal = hora_a_decimal(fin)

            # Si el período es completamente antes de la hora actual, omitirlo
            if fin_decimal <= hora_limite_decimal:
                continue

            # Si el período empieza antes de la hora actual, ajustar el inicio
            if inicio_decimal < hora_limite_decimal:
                inicio_ajustado = decimal_a_hora(hora_limite_decimal)
            else:
                inicio_ajustado = inicio

            periodos_ajustados.append((inicio_ajustado, fin))

        return periodos_ajustados

    def ajustar_periodos_dia_proximo(periodos_dia, hora_limite):
        """Ajusta los períodos del día de la próxima semana hasta la hora actual"""
        periodos_ajustados = []
        hora_limite_decimal = hora_a_decimal(hora_limite)

        for inicio, fin in periodos_dia:
            inicio_decimal = hora_a_decimal(inicio)
            fin_decimal = hora_a_decimal(fin)

            # Si el período empieza después de la hora límite, omitirlo
            if inicio_decimal >= hora_limite_decimal:
                continue

            # Si el período termina después de la hora límite, ajustar el fin
            if fin_decimal > hora_limite_decimal:
                fin_ajustado = decimal_a_hora(hora_limite_decimal)
            else:
                fin_ajustado = fin

            periodos_ajustados.append((inicio, fin_ajustado))

        return periodos_ajustados

    # PASO 4: Calcular tiempo total necesario
    tiempo_total_materias = sum(
        float(horas[0]) if isinstance(horas, np.ndarray) else float(horas)
        for horas in horas_materias.values()
    )
    # Extraer solo tiempo_horas de tareas (no tiempo_horas_sig)
    tiempo_total_tareas = sum(
        datos["tiempo_horas"] for datos in tareas_actividad["tareas"].values()
    )
    tiempo_necesario_total = tiempo_total_materias + tiempo_total_tareas

    # Calcular tiempo libre total disponible (incluyendo próxima semana)
    tiempo_libre_total_semana = 0
    for dia in dias_semana_orden:
        if dia.endswith("_p"):
            # Día de la próxima semana
            dia_base = dia[:-2]  # Quitar el "_p"
            if dia_base == dia_actual_abrev:
                # Es el mismo día actual pero de la próxima semana
                periodos_ajustados = ajustar_periodos_dia_proximo(
                    periodos_libres.get(dia_base, []), hora_actual
                )
                tiempo_dia = sum(
                    hora_a_decimal(fin) - hora_a_decimal(inicio)
                    for inicio, fin in periodos_ajustados
                )
            else:
                tiempo_dia = tiempo_total_libre.get(dia_base, 0)
        elif dia == dias_semana_orden[0] and ajustar_primer_dia:
            # Primer día de esta semana (desde hora actual)
            periodos_ajustados = ajustar_periodos_primer_dia(
                periodos_libres.get(dia, []), hora_actual
            )
            tiempo_dia = sum(
                hora_a_decimal(fin) - hora_a_decimal(inicio)
                for inicio, fin in periodos_ajustados
            )
        else:
            tiempo_dia = tiempo_total_libre.get(dia, 0)
        tiempo_libre_total_semana += tiempo_dia

    # PASO 5: Reservar tiempo de descanso si es posible
    tiempo_descanso_disponible = max(
        0, tiempo_libre_total_semana - tiempo_necesario_total
    )
    tiempo_descanso_por_dia = {}

    if tiempo_descanso_disponible > 0:
        # Distribuir el descanso proporcionalmente entre los días según su tiempo libre
        for dia in dias_semana_orden:
            if dia.endswith("_p"):
                # Día de la próxima semana
                dia_base = dia[:-2]
                if dia_base == dia_actual_abrev:
                    periodos_ajustados = ajustar_periodos_dia_proximo(
                        periodos_libres.get(dia_base, []), hora_actual
                    )
                    tiempo_dia = sum(
                        hora_a_decimal(fin) - hora_a_decimal(inicio)
                        for inicio, fin in periodos_ajustados
                    )
                else:
                    tiempo_dia = tiempo_total_libre.get(dia_base, 0)
            elif dia == dias_semana_orden[0] and ajustar_primer_dia:
                periodos_ajustados = ajustar_periodos_primer_dia(
                    periodos_libres.get(dia, []), hora_actual
                )
                tiempo_dia = sum(
                    hora_a_decimal(fin) - hora_a_decimal(inicio)
                    for inicio, fin in periodos_ajustados
                )
            else:
                tiempo_dia = tiempo_total_libre.get(dia, 0)

            if tiempo_libre_total_semana > 0:
                proporcion = tiempo_dia / tiempo_libre_total_semana
                tiempo_descanso_por_dia[dia] = tiempo_descanso_disponible * proporcion
            else:
                tiempo_descanso_por_dia[dia] = 0

    # PASO 6: Crear períodos disponibles después de reservar descanso
    def reservar_descanso_en_periodo(periodos_dia, tiempo_descanso):
        """Reserva tiempo de descanso al final de los períodos del día"""
        if tiempo_descanso <= 0 or not periodos_dia:
            return periodos_dia.copy()

        periodos_restantes = periodos_dia.copy()
        tiempo_a_reservar = tiempo_descanso

        # Empezar desde el final de los períodos
        i = len(periodos_restantes) - 1
        while i >= 0 and tiempo_a_reservar > 0:
            inicio, fin = periodos_restantes[i]
            inicio_decimal = hora_a_decimal(inicio)
            fin_decimal = hora_a_decimal(fin)
            tiempo_periodo = fin_decimal - inicio_decimal

            if tiempo_a_reservar >= tiempo_periodo:
                # Reservar todo el período
                periodos_restantes.pop(i)
                tiempo_a_reservar -= tiempo_periodo
            else:
                # Reservar parte del período (desde el final)
                nuevo_fin = fin_decimal - tiempo_a_reservar
                periodos_restantes[i] = (inicio, decimal_a_hora(nuevo_fin))
                tiempo_a_reservar = 0

            i -= 1

        return periodos_restantes

    periodos_disponibles = {}
    for dia in dias_semana_orden:
        if dia.endswith("_p"):
            # Día de la próxima semana
            dia_base = dia[:-2]
            if dia_base in periodos_libres:
                if dia_base == dia_actual_abrev:
                    # Mismo día pero próxima semana (hasta hora actual)
                    periodos_base = ajustar_periodos_dia_proximo(
                        periodos_libres[dia_base], hora_actual
                    )
                else:
                    periodos_base = periodos_libres[dia_base]

                # Reservar descanso
                periodos_con_descanso = reservar_descanso_en_periodo(
                    periodos_base, tiempo_descanso_por_dia.get(dia, 0)
                )
                periodos_disponibles[dia] = periodos_con_descanso
            else:
                periodos_disponibles[dia] = []
        else:
            # Día de esta semana
            if dia in periodos_libres:
                # Ajustar el primer día si es necesario
                if dia == dias_semana_orden[0] and ajustar_primer_dia:
                    periodos_base = ajustar_periodos_primer_dia(
                        periodos_libres[dia], hora_actual
                    )
                else:
                    periodos_base = periodos_libres[dia]

                # Reservar descanso
                periodos_con_descanso = reservar_descanso_en_periodo(
                    periodos_base, tiempo_descanso_por_dia.get(dia, 0)
                )
                periodos_disponibles[dia] = periodos_con_descanso
            else:
                periodos_disponibles[dia] = []

    def calcular_prioridad(tarea, tiempo_horas, dia_entrega):
        """Calcula la prioridad de una tarea basada en urgencia y duración"""
        dia_entrega_abrev = dias_completos[dia_entrega]

        # Buscar el día de entrega en el orden actual (incluyendo próxima semana)
        dias_disponibles = 0
        for i, dia in enumerate(dias_semana_orden):
            dia_comparar = dia[:-2] if dia.endswith("_p") else dia
            if dia_comparar == dia_entrega_abrev:
                dias_disponibles = i
                break
        else:
            # Si no se encuentra, asumir que es muy lejano
            dias_disponibles = len(dias_semana_orden)

        # Si no tiene días disponibles, máxima prioridad
        if dias_disponibles == 0:
            return 1000

        # Factor de urgencia (menos días = más urgente)
        factor_urgencia = (len(dias_semana_orden) + 1 - dias_disponibles) / len(
            dias_semana_orden
        )

        # Factor de duración (más horas = más prioritario)
        factor_duracion = min(tiempo_horas / 10, 1.0)

        # Combinar factores (urgencia tiene más peso)
        prioridad = (factor_urgencia * 0.7) + (factor_duracion * 0.3)

        return prioridad

    def asignar_tiempo_en_periodo(dia, tiempo_necesario, descripcion, es_tarea=True):
        """Asigna tiempo en los períodos disponibles de un día específico"""
        asignaciones = []
        tiempo_restante = tiempo_necesario

        i = 0
        while i < len(periodos_disponibles[dia]) and tiempo_restante > 0:
            inicio, fin = periodos_disponibles[dia][i]
            inicio_decimal = hora_a_decimal(inicio)
            fin_decimal = hora_a_decimal(fin)
            tiempo_periodo = fin_decimal - inicio_decimal

            if tiempo_periodo > 0:
                if tiempo_restante <= tiempo_periodo:
                    # El tiempo restante cabe en este período
                    fin_asignacion = inicio_decimal + tiempo_restante
                    asignaciones.append((inicio, decimal_a_hora(fin_asignacion)))

                    # Actualizar el período disponible
                    if fin_asignacion < fin_decimal:
                        periodos_disponibles[dia][i] = (
                            decimal_a_hora(fin_asignacion),
                            fin,
                        )
                    else:
                        periodos_disponibles[dia].pop(i)

                    tiempo_restante = 0
                else:
                    # Usar todo el período
                    asignaciones.append((inicio, fin))
                    tiempo_restante -= tiempo_periodo
                    periodos_disponibles[dia].pop(i)
                    continue
            else:
                i += 1
            i += 1

        return asignaciones, tiempo_restante

    # PASO 7: Priorizar y ordenar tareas
    tareas_priorizadas = []
    for tarea, datos in tareas_actividad["tareas"].items():
        tiempo_horas = datos["tiempo_horas"]
        dia_entrega = (
            datos["dia_semana"] if datos["dia_semana"] else "lunes"
        )  # Default si es None
        prioridad = calcular_prioridad(tarea, tiempo_horas, dia_entrega)
        tareas_priorizadas.append((prioridad, tarea, tiempo_horas, dia_entrega, datos))

    # Ordenar por prioridad (mayor prioridad primero)
    tareas_priorizadas.sort(key=lambda x: x[0], reverse=True)

    # PASO 8: Asignar tareas según prioridad (solo para horarios de materias)
    # Las tareas se procesan para el primer diccionario (horarios_materias) pero
    # el segundo diccionario será diferente
    tareas_asignaciones_horarios = {}

    for prioridad, tarea, tiempo_horas, dia_entrega, datos in tareas_priorizadas:
        if datos["dia_semana"] is None:
            # Si dia_semana es None, no asignar en horarios (solo en tiempos por día)
            continue

        # Determinar qué días están disponibles para esta tarea
        dia_entrega_abrev = dias_completos[dia_entrega]

        # Encontrar hasta qué día se puede trabajar
        dias_disponibles = []
        for dia in dias_semana_orden:
            dia_comparar = dia[:-2] if dia.endswith("_p") else dia
            if dia_comparar == dia_entrega_abrev:
                break
            dias_disponibles.append(dia)

        tareas_asignaciones_horarios[tarea] = {}
        tiempo_restante = tiempo_horas

        # Intentar asignar en los días disponibles
        for dia in dias_disponibles:
            if tiempo_restante <= 0:
                break

            asignaciones, tiempo_restante = asignar_tiempo_en_periodo(
                dia, tiempo_restante, tarea, es_tarea=True
            )

            if asignaciones:
                tareas_asignaciones_horarios[tarea][dia] = asignaciones

        # Si no se pudo asignar todo el tiempo, reportar
        if tiempo_restante > 0:
            print(
                f"Advertencia: No se pudo asignar {tiempo_restante:.2f} horas para {tarea} (entrega {dia_entrega})"
            )

    # PASO 9: Asignar tiempo de estudio de materias
    for materia, horas_array in horas_materias.items():
        horas_semanales = (
            float(horas_array[0])
            if isinstance(horas_array, np.ndarray)
            else float(horas_array)
        )

        horarios_materias[materia] = {}
        tiempo_restante = horas_semanales

        # Distribuir el tiempo de manera equitativa entre los días
        for dia in dias_semana_orden:
            if tiempo_restante <= 0:
                break

            # Calcular cuánto tiempo asignar en este día (distribución equitativa)
            dias_restantes = len(
                [
                    d
                    for d in dias_semana_orden[dias_semana_orden.index(dia) :]
                    if len(periodos_disponibles[d]) > 0
                ]
            )

            if dias_restantes > 0:
                tiempo_para_hoy = min(tiempo_restante / dias_restantes, tiempo_restante)

                asignaciones, tiempo_no_asignado = asignar_tiempo_en_periodo(
                    dia, tiempo_para_hoy, materia, es_tarea=False
                )

                if asignaciones:
                    horarios_materias[materia][dia] = asignaciones

                tiempo_restante -= tiempo_para_hoy - tiempo_no_asignado

        # Si queda tiempo sin asignar, intentar distribuirlo en cualquier día disponible
        for dia in dias_semana_orden:
            if tiempo_restante <= 0:
                break

            asignaciones, tiempo_restante = asignar_tiempo_en_periodo(
                dia, tiempo_restante, materia, es_tarea=False
            )

            if asignaciones:
                if materia not in horarios_materias:
                    horarios_materias[materia] = {}
                if dia not in horarios_materias[materia]:
                    horarios_materias[materia][dia] = []
                horarios_materias[materia][dia].extend(asignaciones)

    # TRANSFORMAR horarios_materias de organizado por materia a organizado por día
    def transformar_horarios_materias(horarios_por_materia):
        """
        Transforma el diccionario de horarios organizados por materia
        a un diccionario organizado por día con el formato requerido
        """
        horarios_por_dia = {}

        for materia, dias_horarios in horarios_por_materia.items():
            for dia, horarios in dias_horarios.items():
                if dia not in horarios_por_dia:
                    horarios_por_dia[dia] = []

                # Convertir cada tupla (inicio, fin) al formato de diccionario
                for hora_inicio, hora_fin in horarios:
                    horarios_por_dia[dia].append(
                        {
                            "horaInicio": hora_inicio,
                            "horaFin": hora_fin,
                            "materia": materia,
                        }
                    )

        # Ordenar los horarios por hora de inicio en cada día
        for dia in horarios_por_dia:
            horarios_por_dia[dia].sort(key=lambda x: x["horaInicio"])

        return horarios_por_dia

    # Aplicar la transformación
    horarios_materias_transformado = transformar_horarios_materias(horarios_materias)

    # PASO 10: Crear nuevo formato para horarios_tareas (por tiempos por día con fechas)
    def calcular_fecha_real(dia_codigo, dia_actual, fecha_actual_str="2025-06-08"):
        """Calcula la fecha real basándose en el código de día y día actual"""
        from datetime import datetime, timedelta

        fecha_actual = datetime.strptime(fecha_actual_str, "%Y-%m-%d")

        # Mapeo de códigos de día a números de semana
        mapeo_dias = {
            "Lun": 0,
            "Mar": 1,
            "Mié": 2,
            "Jue": 3,
            "Vie": 4,
            "Sab": 5,
            "Dom": 6,
        }

        if dia_codigo.endswith("_p"):
            # Día de próxima semana
            dia_base = dia_codigo[:-2]
            dias_a_sumar = mapeo_dias[dia_base] - fecha_actual.weekday() + 7
        else:
            # Día de esta semana
            dias_a_sumar = mapeo_dias[dia_codigo] - fecha_actual.weekday()
            if dias_a_sumar < 0:
                dias_a_sumar += 7

        fecha_resultado = fecha_actual + timedelta(days=dias_a_sumar)
        return fecha_resultado.strftime("%Y-%m-%d")

    def obtener_tiempo_libre_dia(dia_codigo):
        """Obtiene el tiempo libre disponible para un día específico"""
        if dia_codigo.endswith("_p"):
            dia_base = dia_codigo[:-2]
        else:
            dia_base = dia_codigo

        if dia_base == "Sab":
            return tiempo_sabado
        elif dia_base == "Dom":
            return tiempo_domingo
        else:
            return tiempo_total_libre.get(dia_base, 0)

    def verificar_conflicto_horarios(
        fecha, tiempo_requerido_horas, horarios_materias_existentes
    ):
        """Verifica si hay conflicto entre actividad y horarios de materias en una fecha"""
        # Buscar si hay horarios de materias en esa fecha
        dia_codigo = None
        fecha_obj = datetime.strptime(fecha, "%Y-%m-%d")

        # Encontrar el código de día correspondiente a la fecha
        for dia in dias_semana_orden:
            fecha_dia = calcular_fecha_real(dia, dia_actual)
            if fecha_dia == fecha:
                dia_codigo = dia
                break

        if not dia_codigo or dia_codigo not in horarios_materias_existentes:
            return False, 0  # No hay conflicto

        # Calcular tiempo total ocupado por horarios de materias ese día
        tiempo_ocupado = 0
        for materia, horarios_por_dia in horarios_materias_existentes.items():
            if dia_codigo in horarios_por_dia:
                for horario in horarios_por_dia[dia_codigo]:
                    inicio = hora_a_decimal(horario["horaInicio"])
                    fin = hora_a_decimal(horario["horaFin"])
                    tiempo_ocupado += fin - inicio

        tiempo_libre_dia = obtener_tiempo_libre_dia(dia_codigo)
        tiempo_disponible = tiempo_libre_dia - tiempo_ocupado

        # Hay conflicto si no hay suficiente tiempo para la actividad
        return tiempo_disponible < tiempo_requerido_horas, tiempo_ocupado

    def reubicar_horarios_materias(
        fecha_conflicto, tiempo_necesario_liberar, horarios_materias_existentes
    ):
        """Reubica horarios de materias para liberar tiempo en una fecha específica"""
        dia_codigo_conflicto = None
        fecha_obj = datetime.strptime(fecha_conflicto, "%Y-%m-%d")

        # Encontrar el código de día correspondiente a la fecha
        for dia in dias_semana_orden:
            fecha_dia = calcular_fecha_real(dia, dia_actual)
            if fecha_dia == fecha_conflicto:
                dia_codigo_conflicto = dia
                break

        if not dia_codigo_conflicto:
            return False

        tiempo_liberado = 0
        materias_a_reubicar = []

        # Identificar qué horarios de materias mover
        for materia, horarios_por_dia in horarios_materias_existentes.items():
            if dia_codigo_conflicto in horarios_por_dia:
                for horario in horarios_por_dia[dia_codigo_conflicto]:
                    inicio = hora_a_decimal(horario["horaInicio"])
                    fin = hora_a_decimal(horario["horaFin"])
                    tiempo_horario = fin - inicio

                    materias_a_reubicar.append(
                        {
                            "materia": materia,
                            "tiempo": tiempo_horario,
                            "horario": horario,
                        }
                    )
                    tiempo_liberado += tiempo_horario

                    if tiempo_liberado >= tiempo_necesario_liberar:
                        break

            if tiempo_liberado >= tiempo_necesario_liberar:
                break

        # Reubicar las materias en otros días
        for item in materias_a_reubicar:
            if tiempo_liberado < tiempo_necesario_liberar:
                break

            materia = item["materia"]
            tiempo_reubicar = item["tiempo"]

            # Remover el horario original
            horarios_materias_existentes[materia][dia_codigo_conflicto].remove(
                item["horario"]
            )
            if not horarios_materias_existentes[materia][dia_codigo_conflicto]:
                del horarios_materias_existentes[materia][dia_codigo_conflicto]

            # Buscar un día alternativo para reubicar
            reubicado = False
            for dia_alternativo in dias_semana_orden:
                if dia_alternativo == dia_codigo_conflicto:
                    continue

                tiempo_libre_alternativo = obtener_tiempo_libre_dia(dia_alternativo)

                # Calcular tiempo ya ocupado en el día alternativo
                tiempo_ocupado_alternativo = 0
                for mat, horarios in horarios_materias_existentes.items():
                    if dia_alternativo in horarios:
                        for h in horarios[dia_alternativo]:
                            inicio = hora_a_decimal(h["horaInicio"])
                            fin = hora_a_decimal(h["horaFin"])
                            tiempo_ocupado_alternativo += fin - inicio

                if (
                    tiempo_libre_alternativo - tiempo_ocupado_alternativo
                    >= tiempo_reubicar
                ):
                    # Reubicar aquí
                    if materia not in horarios_materias_existentes:
                        horarios_materias_existentes[materia] = {}
                    if dia_alternativo not in horarios_materias_existentes[materia]:
                        horarios_materias_existentes[materia][dia_alternativo] = []

                    # Crear nuevo horario (simplificado, podría mejorarse)
                    nuevo_inicio = "09:00"  # Hora por defecto
                    nuevo_fin = decimal_a_hora(
                        hora_a_decimal(nuevo_inicio) + tiempo_reubicar
                    )

                    horarios_materias_existentes[materia][dia_alternativo].append(
                        {
                            "horaInicio": nuevo_inicio,
                            "horaFin": nuevo_fin,
                            "materia": materia,
                        }
                    )

                    reubicado = True
                    tiempo_liberado -= tiempo_reubicar
                    break

            if not reubicado:
                # Si no se pudo reubicar, mantener el original
                horarios_materias_existentes[materia][dia_codigo_conflicto].append(
                    item["horario"]
                )

        return tiempo_liberado >= tiempo_necesario_liberar

    # Crear estructura para el nuevo horarios_tareas
    horarios_tareas_por_tiempo = {}

    # Crear copia de horarios de materias para manejar reubicaciones
    horarios_materias_copia = {}
    for materia, dias in horarios_materias.items():
        horarios_materias_copia[materia] = {}
        for dia, horarios in dias.items():
            horarios_materias_copia[materia][dia] = horarios.copy()

    # Primero, necesitamos organizar las tareas por materia
    materias_tareas = {}

    for nombre_tarea, datos_tarea in tareas_actividad["tareas"].items():
        # Si no tenemos información de materia directa, crearemos una materia genérica
        materia = "Tareas Generales"

        if materia not in materias_tareas:
            materias_tareas[materia] = []

        materias_tareas[materia].append({"nombre": nombre_tarea, "datos": datos_tarea})

    # Distribuir tiempo por días para cada materia
    for materia, lista_tareas in materias_tareas.items():
        horarios_tareas_por_tiempo[materia] = []

        for tarea_info in lista_tareas:
            nombre_tarea = tarea_info["nombre"]
            datos = tarea_info["datos"]

            # Crear estructura base de la tarea
            tarea_estructura = {
                "descripcion": nombre_tarea,
                "tiempoDuracion": int(
                    (datos["tiempo_horas"] + (datos["tiempo_horas_sig"] or 0)) * 60
                ),
                "fechaEntrega": datos["fecha_entrega"],
                "done": {},
            }

            contador_fecha = 1

            # PASO 1: Distribuir tiempo_horas (próximos 7 días)
            if datos["tiempo_horas"] > 0:
                tiempo_horas_minutos = int(datos["tiempo_horas"] * 60)
                tiempo_restante_distribuir = tiempo_horas_minutos

                if datos["dia_semana"] is not None:
                    # Tarea con fecha de entrega <= 7 días
                    dias_para_trabajar = []
                    for dia in dias_semana_orden:
                        dia_entrega_abrev = dias_completos[datos["dia_semana"]]
                        dia_comparar = dia[:-2] if dia.endswith("_p") else dia
                        if dia_comparar == dia_entrega_abrev:
                            break
                        dias_para_trabajar.append(dia)
                else:
                    # Tarea con fecha de entrega > 7 días, usar todos los próximos 7 días
                    dias_para_trabajar = dias_semana_orden[:7]

                # Distribuir con restricción de 20 minutos mínimos
                for dia in dias_para_trabajar:
                    if tiempo_restante_distribuir <= 0:
                        break

                    fecha_dia = calcular_fecha_real(dia, dia_actual)
                    tiempo_libre_dia = obtener_tiempo_libre_dia(dia)

                    # Calcular tiempo proporcional, pero mínimo 20 minutos
                    tiempo_libre_total = sum(
                        obtener_tiempo_libre_dia(d) for d in dias_para_trabajar
                    )
                    if tiempo_libre_total > 0:
                        proporcion = tiempo_libre_dia / tiempo_libre_total
                        tiempo_propuesto = int(tiempo_horas_minutos * proporcion)
                    else:
                        tiempo_propuesto = tiempo_restante_distribuir // len(
                            dias_para_trabajar
                        )

                    # Aplicar restricción de 20 minutos mínimos
                    if tiempo_propuesto < 20 and tiempo_restante_distribuir >= 20:
                        tiempo_asignado = 20
                    elif tiempo_restante_distribuir < 20:
                        # Excepción: si queda menos de 20 minutos total
                        tiempo_asignado = tiempo_restante_distribuir
                    else:
                        tiempo_asignado = min(
                            tiempo_propuesto, tiempo_restante_distribuir
                        )

                    if tiempo_asignado > 0:
                        # Verificar conflictos con horarios de materias
                        hay_conflicto, tiempo_ocupado = verificar_conflicto_horarios(
                            fecha_dia, tiempo_asignado / 60, horarios_materias_copia
                        )

                        if hay_conflicto:
                            # Intentar reubicar horarios de materias
                            tiempo_necesario = tiempo_asignado / 60
                            if reubicar_horarios_materias(
                                fecha_dia, tiempo_necesario, horarios_materias_copia
                            ):
                                # Reubicación exitosa, asignar tiempo
                                tarea_estructura["done"][f"Fecha{contador_fecha}"] = {
                                    "Duracion": tiempo_asignado,
                                    "fecha": fecha_dia,
                                }
                                tiempo_restante_distribuir -= tiempo_asignado
                                contador_fecha += 1
                            # Si no se puede reubicar, intentar el siguiente día
                        else:
                            # No hay conflicto, asignar directamente
                            tarea_estructura["done"][f"Fecha{contador_fecha}"] = {
                                "Duracion": tiempo_asignado,
                                "fecha": fecha_dia,
                            }
                            tiempo_restante_distribuir -= tiempo_asignado
                            contador_fecha += 1

            # PASO 2: Distribuir tiempo_horas_sig (tiempo futuro, sin considerar horarios de estudio)
            if datos["tiempo_horas_sig"] is not None and datos["tiempo_horas_sig"] > 0:
                tiempo_sig_minutos = int(datos["tiempo_horas_sig"] * 60)

                # Distribuir en fechas futuras (después de 7 días)
                # Calcular fechas futuras basándose en la fecha de entrega
                fecha_entrega = datetime.strptime(datos["fecha_entrega"], "%Y-%m-%d")
                fecha_actual_obj = datetime.strptime(
                    "2025-06-08", "%Y-%m-%d"
                )  # Ajustar según sea necesario

                # Distribuir en días entre el día 8 y la fecha de entrega
                dias_disponibles_futuro = max(
                    1, (fecha_entrega - fecha_actual_obj).days - 7
                )
                tiempo_por_dia_futuro = max(
                    20, tiempo_sig_minutos // max(1, dias_disponibles_futuro)
                )

                fecha_inicio_futuro = fecha_actual_obj + timedelta(days=8)
                tiempo_restante_futuro = tiempo_sig_minutos

                dia_actual_futuro = 0
                while (
                    tiempo_restante_futuro > 0
                    and dia_actual_futuro < dias_disponibles_futuro
                ):
                    fecha_futura = fecha_inicio_futuro + timedelta(
                        days=dia_actual_futuro
                    )

                    if fecha_futura >= fecha_entrega:
                        break

                    tiempo_asignado_futuro = min(
                        tiempo_por_dia_futuro, tiempo_restante_futuro
                    )

                    # Aplicar restricción de 20 minutos mínimos
                    if tiempo_asignado_futuro < 20 and tiempo_restante_futuro >= 20:
                        tiempo_asignado_futuro = 20
                    elif tiempo_restante_futuro < 20:
                        tiempo_asignado_futuro = tiempo_restante_futuro

                    if tiempo_asignado_futuro > 0:
                        tarea_estructura["done"][f"Fecha{contador_fecha}"] = {
                            "Duracion": tiempo_asignado_futuro,
                            "fecha": fecha_futura.strftime("%Y-%m-%d"),
                        }
                        tiempo_restante_futuro -= tiempo_asignado_futuro
                        contador_fecha += 1

                    dia_actual_futuro += 1

            horarios_tareas_por_tiempo[materia].append(tarea_estructura)

    # Actualizar horarios_materias con las reubicaciones realizadas
    horarios_materias_transformado = transformar_horarios_materias(
        horarios_materias_copia
    )

    return {
        "horarios_materias": horarios_materias_transformado,
        "horarios_tareas": horarios_tareas_por_tiempo,
        "tiempo_descanso_reservado": tiempo_descanso_por_dia,
        "orden_dias": dias_semana_orden,  # Para referencia
    }


class KNNModel:
    def __init__(self, k=5):
        self.k = k
        self.models = {
            "Algoritmos Bioinspirados": KNeighborsRegressor(n_neighbors=self.k),
            "Procesamiento de Señales": KNeighborsRegressor(n_neighbors=self.k),
            "Teoría de la Computación": KNeighborsRegressor(n_neighbors=self.k),
            "Tecnologías del Lenguaje Natural": KNeighborsRegressor(n_neighbors=self.k),
            "Aprendizaje de Máquina": KNeighborsRegressor(n_neighbors=self.k),
            "Visión Artificial": KNeighborsRegressor(n_neighbors=self.k),
        }
        self.scaler = StandardScaler()

    def preprocess(self, X, y):
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        X_train, X_test = self.scale(X_train, X_test)
        return X_train, X_test, y_train, y_test

    def scale(self, X_train, X_test):
        # Assuming df is a DataFrame with numerical features

        X_train = pd.DataFrame(
            self.scaler.fit_transform(X_train), columns=X_train.columns
        )
        X_test = pd.DataFrame(self.scaler.fit_transform(X_test), columns=X_test.columns)
        return X_train, X_test

    def fit(self, model, X, y):

        self.models[model].fit(X, y)

    def predict(self, model, X):
        return self.models[model].predict(X)


def tiempo_al_dia(hora):
    if hora == "Menos de 30 min o simplemente no estudio":
        return 0.25
    elif hora == "30 min - 1 hora":
        return 0.75
    elif hora == "1hr - 2hrs":
        return 1.5
    else:
        return 2.5


def frecuencia_individual(x, i, frecuencias, l):
    lst = x[i].split(";")
    for key in frecuencias.keys():
        for j in range(len(lst)):
            if key == lst[j]:
                l[key] = (6 - j) ** 0.8 * frecuencias[key]
    suma = sum(list(l.values()))
    for key in frecuencias.keys():
        l[key] = l[key] / suma
    return l


def calc_horas(hora):
    horas = hora.split("–")
    if len(horas) != 2:
        horas = hora.split("-")
    hora1 = horas[0].split(":")
    hora2 = horas[1].split(":")
    return (int(hora1[0]) + int(hora2[0])) / 2


def nuevo_df(df, frecuencias):
    n_df = pd.DataFrame(
        {
            "Algoritmos Bioinspirados": [],
            "Procesamiento de Señales": [],
            "Teoría de la Computación": [],
            "Tecnologías del Lenguaje Natural": [],
            "Aprendizaje de Máquina": [],
            "Visión Artificial": [],
            "Lunes": [],
            "Martes": [],
            "Miércoles": [],
            "Jueves": [],
            "Viernes": [],
            "Tiempo al día": [],
        }
    )
    for i in range(len(df)):
        l = {
            "Algoritmos Bioinspirados": 0,
            "Procesamiento de Señales": 0,
            "Teoría de la Computación": 0,
            "Tecnologías del Lenguaje Natural": 0,
            "Aprendizaje de Máquina": 0,
            "Visión Artificial": 0,
        }
        l = frecuencia_individual(
            df[
                "Ordena las materias de 5to Semestre por dificultad y dedicación que necesites"
            ].values,
            i,
            frecuencias,
            l,
        )
        registro = list(l.values())
        registro = registro + [
            calc_horas(df["Lunes"].values[i]),
            calc_horas(df["Martes"].values[i]),
            calc_horas(df["Miércoles"].values[i]),
            calc_horas(df["Jueves"].values[i]),
            calc_horas(df["Viernes"].values[i]),
            tiempo_al_dia(
                df[
                    "¿Cuánto tiempo al día dedicas a estudiar fuera del horario escolar?"
                ].values[i]
            ),
        ]

        n_df.loc[i] = registro

    return n_df


def materias_frecuencias(x):
    l = {
        "Algoritmos Bioinspirados": 0,
        "Procesamiento de Señales": 0,
        "Teoría de la Computación": 0,
        "Tecnologías del Lenguaje Natural": 0,
        "Aprendizaje de Máquina": 0,
        "Visión Artificial": 0,
    }
    for i in range(len(x)):
        lst = x[i].split(";")
        for key in l.keys():
            for j in range(len(lst)):
                if key == lst[j]:
                    l[key] += (6 - j) ** 0.8
    return l


def etiquetar(df, tiempo_efectivo):
    n_df = deepcopy(df)

    n_df["Et_Algoritmos Bioinspirados"] = df.apply(
        lambda row: tiempo_efectivo[str(row["Semana"])]
        * row["Algoritmos Bioinspirados"],
        axis=1,
    )

    n_df["Et_Procesamiento de Señales"] = df.apply(
        lambda row: tiempo_efectivo.get(str(row["Semana"]), 0)
        * row["Procesamiento de Señales"],
        axis=1,
    )

    n_df["Et_Teoría de la Computación"] = df.apply(
        lambda row: tiempo_efectivo.get(str(row["Semana"]), 0)
        * row["Teoría de la Computación"],
        axis=1,
    )

    n_df["Et_Tecnologías del Lenguaje Natural"] = df.apply(
        lambda row: tiempo_efectivo.get(str(row["Semana"]), 0)
        * row["Tecnologías del Lenguaje Natural"],
        axis=1,
    )

    n_df["Et_Aprendizaje de Máquina"] = df.apply(
        lambda row: tiempo_efectivo.get(str(row["Semana"]), 0)
        * row["Aprendizaje de Máquina"],
        axis=1,
    )

    n_df["Et_Visión Artificial"] = df.apply(
        lambda row: tiempo_efectivo.get(str(row["Semana"]), 0)
        * row["Visión Artificial"],
        axis=1,
    )

    return n_df


mapeo_dias_2 = {
    "Lun": "Lunes",
    "Mar": "Martes",
    "Mié": "Miércoles",
    "Jue": "Jueves",
    "Vie": "Viernes",
}


def predecir_individuo(
    tiempo: float,
    materias: dict,
    dias: dict,
    modelosKnn: KNNModel,
    modelo: KNeighborsClassifier,
):
    dias_n = {
        nuevo_nombre: dias[clave]
        for clave, nuevo_nombre in mapeo_dias_2.items()
        if clave in dias
    }
    predicciones = {}
    X = np.array(list(materias.values()) + list(dias_n.values()) + [tiempo])
    columnas = (
        list(materias.keys())
        + list(dias_n.keys())
        + [
            "Tiempo al día",
        ]
    )
    X_df = pd.DataFrame([X], columns=columnas)
    X_df["Semana"] = modelo.predict(X_df).astype(float)
    X_df.drop(columns=list(dias_n.keys()), inplace=True)
    X_df = pd.DataFrame(modelosKnn.scaler.transform(X_df), columns=X_df.columns)
    for model in modelosKnn.models.keys():
        predicciones[model] = modelosKnn.predict(model, X_df) * 5
    return predicciones
