from sklearn.neighbors import KNeighborsRegressor
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import numpy as np
from datetime import datetime, timedelta
import json
from copy import deepcopy
from statistics import mode


def leer_json(ruta: str):
    with open(ruta, "r", encoding="utf-8") as archivo:
        datos = json.load(archivo)
    return datos


def asignar_tareas(json: dict, tiempo_semanal: float, frecuencias: dict):
    from datetime import datetime
    from statistics import mean

    tareas_por_materia = {}
    tareas_por_actividad = {}

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

    # Inicializar tareas por materia y por actividad
    for materia in json["tareas"].keys():
        tareas_por_materia[materia] = 0
        for tarea in json["tareas"][materia]:
            tareas_por_materia[materia] += tarea["tiempoDuracion"] / 60
            descripcion = tarea["descripcion"]
            tiempo_horas = tarea["tiempoDuracion"] / 60
            # Convertir fecha a día de la semana
            fecha = datetime.strptime(tarea["fechaEntrega"], "%Y-%m-%d")
            dia_semana = dias_semana[fecha.weekday()]
            tareas_por_actividad[descripcion] = (tiempo_horas, dia_semana)

    tiempo_restante = tiempo_semanal
    tareas_procesadas = set()  # Para evitar procesar la misma tarea dos veces

    # Aplicar frecuencias
    for key in frecuencias.keys():
        # Si es una actividad específica
        if key in tareas_por_actividad and key not in tareas_procesadas:
            tiempo_original, dia_semana = tareas_por_actividad[key]
            tiempo_ajustado = (tiempo_original * frecuencias[key]) / mean(
                frecuencias.values()
            )
            tareas_por_actividad[key] = (tiempo_ajustado, dia_semana)
            tiempo_restante -= tiempo_ajustado
            tareas_procesadas.add(key)

            # Actualizar también en tareas_por_materia
            for materia in json["tareas"].keys():
                for tarea in json["tareas"][materia]:
                    if tarea["descripcion"] == key:
                        tareas_por_materia[materia] -= tiempo_original
                        tareas_por_materia[materia] += tiempo_ajustado
                        break

        # Si es una materia completa
        elif key in tareas_por_materia:
            tiempo_original_materia = tareas_por_materia[key]
            tiempo_ajustado_materia = (
                tiempo_original_materia * frecuencias[key]
            ) / mean(frecuencias.values())
            tareas_por_materia[key] = tiempo_ajustado_materia

            # Actualizar actividades de esta materia
            for tarea in json["tareas"][key]:
                descripcion = tarea["descripcion"]
                if descripcion not in tareas_procesadas:
                    tiempo_original_actividad, dia_semana = tareas_por_actividad[
                        descripcion
                    ]
                    tiempo_ajustado_actividad = (
                        tiempo_original_actividad * frecuencias[key]
                    ) / mean(frecuencias.values())
                    tareas_por_actividad[descripcion] = (
                        tiempo_ajustado_actividad,
                        dia_semana,
                    )
                    tiempo_restante -= tiempo_ajustado_actividad
                    tareas_procesadas.add(descripcion)

    # Restar el tiempo de las tareas que no fueron ajustadas por frecuencias
    for descripcion, (tiempo_horas, dia_semana) in tareas_por_actividad.items():
        if descripcion not in tareas_procesadas:
            tiempo_restante -= tiempo_horas

    return {
        "por_materia": tareas_por_materia,
        "por_actividad": tareas_por_actividad,
        "tiempo_restante": tiempo_restante,
    }


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


def asignar_horarios_estudio(
    horas_materias: dict,
    periodos_libres: dict,
    tareas_actividad: dict,
    tiempo_total_libre: dict,
):
    horarios_materias = {}
    horarios_tareas = {}

    # Mapeo de días
    dias_semana_orden = ["Lun", "Mar", "Mié", "Jue", "Vie"]
    dias_completos = {
        "lunes": "Lun",
        "martes": "Mar",
        "miércoles": "Mié",
        "jueves": "Jue",
        "viernes": "Vie",
        "sábado": "Sab",
        "domingo": "Dom",
    }

    def hora_a_decimal(hora_str):
        partes = hora_str.split(":")
        return int(partes[0]) + int(partes[1]) / 60

    def decimal_a_hora(decimal):
        horas = int(decimal)
        minutos = int((decimal - horas) * 60)
        return f"{horas:02d}:{minutos:02d}"

    # PASO 1: Calcular tiempo total necesario
    tiempo_total_materias = sum(
        float(horas[0]) if isinstance(horas, np.ndarray) else float(horas)
        for horas in horas_materias.values()
    )
    tiempo_total_tareas = sum(tiempo for tiempo, _ in tareas_actividad.values())
    tiempo_necesario_total = tiempo_total_materias + tiempo_total_tareas

    # Calcular tiempo libre total disponible
    tiempo_libre_total_semana = sum(
        tiempo_total_libre.get(dia, 0) for dia in dias_semana_orden
    )

    # PASO 2: Reservar tiempo de descanso si es posible
    tiempo_descanso_disponible = max(
        0, tiempo_libre_total_semana - tiempo_necesario_total
    )
    tiempo_descanso_por_dia = {}

    if tiempo_descanso_disponible > 0:
        # Distribuir el descanso proporcionalmente entre los días según su tiempo libre
        for dia in dias_semana_orden:
            if tiempo_total_libre.get(dia, 0) > 0:
                proporcion = tiempo_total_libre[dia] / tiempo_libre_total_semana
                tiempo_descanso_por_dia[dia] = tiempo_descanso_disponible * proporcion
            else:
                tiempo_descanso_por_dia[dia] = 0

    # PASO 3: Crear períodos disponibles después de reservar descanso
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
        if dia in periodos_libres:
            # Reservar descanso antes de usar los períodos
            periodos_con_descanso = reservar_descanso_en_periodo(
                periodos_libres[dia], tiempo_descanso_por_dia.get(dia, 0)
            )
            periodos_disponibles[dia] = periodos_con_descanso
        else:
            periodos_disponibles[dia] = []

    def calcular_prioridad(tarea, tiempo_horas, dia_entrega):
        """Calcula la prioridad de una tarea basada en urgencia y duración"""
        dia_entrega_abrev = dias_completos[dia_entrega]

        # Determinar días disponibles para trabajar
        if dia_entrega_abrev in [
            "Sab",
            "Dom",
            "Lun",
        ]:  # Lunes tratado como fin de semana
            dias_disponibles = 5  # Toda la semana laboral
        elif dia_entrega_abrev in dias_semana_orden[1:]:  # Martes a Viernes
            indice_entrega = dias_semana_orden.index(dia_entrega_abrev)
            dias_disponibles = indice_entrega  # Hasta el día anterior
        else:
            dias_disponibles = 5

        # Si no tiene días disponibles, máxima prioridad
        if dias_disponibles == 0:
            return 1000

        # Factor de urgencia (menos días = más urgente)
        factor_urgencia = (6 - dias_disponibles) / 5  # 0.2 a 1.0

        # Factor de duración (más horas = más prioritario)
        factor_duracion = min(tiempo_horas / 10, 1.0)  # Normalizar a máximo 1.0

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

    # PASO 4: Priorizar y ordenar tareas
    tareas_priorizadas = []
    for tarea, (tiempo_horas, dia_entrega) in tareas_actividad.items():
        prioridad = calcular_prioridad(tarea, tiempo_horas, dia_entrega)
        tareas_priorizadas.append((prioridad, tarea, tiempo_horas, dia_entrega))

    # Ordenar por prioridad (mayor prioridad primero)
    tareas_priorizadas.sort(key=lambda x: x[0], reverse=True)

    # PASO 5: Asignar tareas según prioridad
    for prioridad, tarea, tiempo_horas, dia_entrega in tareas_priorizadas:
        # Determinar qué días están disponibles para esta tarea
        dia_entrega_abrev = dias_completos[dia_entrega]

        if dia_entrega_abrev in ["Sab", "Dom", "Lun"]:  # Lunes como próxima semana
            # Entrega en fin de semana o lunes próximo: puede usar toda la semana laboral
            dias_disponibles = dias_semana_orden.copy()
        elif dia_entrega_abrev in dias_semana_orden[1:]:  # Martes a Viernes
            # Entrega entre martes y viernes: usar hasta el día ANTERIOR
            indice_entrega = dias_semana_orden.index(dia_entrega_abrev)
            dias_disponibles = dias_semana_orden[:indice_entrega]
        else:
            dias_disponibles = dias_semana_orden.copy()

        horarios_tareas[tarea] = {}
        tiempo_restante = tiempo_horas

        # Intentar asignar en los días disponibles
        for dia in dias_disponibles:
            if tiempo_restante <= 0:
                break

            asignaciones, tiempo_restante = asignar_tiempo_en_periodo(
                dia, tiempo_restante, tarea, es_tarea=True
            )

            if asignaciones:
                horarios_tareas[tarea][dia] = asignaciones

        # Si no se pudo asignar todo el tiempo, reportar
        if tiempo_restante > 0:
            print(
                f"Advertencia: No se pudo asignar {tiempo_restante:.2f} horas para {tarea} (entrega {dia_entrega})"
            )

    # PASO 6: Asignar tiempo de estudio de materias
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

    return {
        "horarios_materias": horarios_materias,
        "horarios_tareas": horarios_tareas,
        "tiempo_descanso_reservado": tiempo_descanso_por_dia,
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


def predecir_individuo(tiempo: float, materias: dict, dias: dict, modelosKnn: KNNModel):
    semana = mode(dias.values())
    predicciones = {}
    X = np.array(list(materias.values()) + [tiempo] + [semana])
    columnas = list(materias.keys()) + [
        "Tiempo al día",
        "Semana",
    ]
    X_df = pd.DataFrame([X], columns=columnas)
    X_df = pd.DataFrame(modelosKnn.scaler.transform(X_df), columns=X_df.columns)
    for model in modelosKnn.models.keys():

        predicciones[model] = modelosKnn.predict(model, X_df)
    return predicciones


def asignar_horarios_estudio(
    horas_materias: dict,
    periodos_libres: dict,
    tareas_actividad: dict,
    tiempo_total_libre: dict,
):
    horarios_materias = {}
    horarios_tareas = {}

    # Mapeo de días
    dias_semana_orden = ["Lun", "Mar", "Mié", "Jue", "Vie"]
    dias_completos = {
        "lunes": "Lun",
        "martes": "Mar",
        "miércoles": "Mié",
        "jueves": "Jue",
        "viernes": "Vie",
        "sábado": "Sab",
        "domingo": "Dom",
    }

    def hora_a_decimal(hora_str):
        partes = hora_str.split(":")
        return int(partes[0]) + int(partes[1]) / 60

    def decimal_a_hora(decimal):
        horas = int(decimal)
        minutos = int((decimal - horas) * 60)
        return f"{horas:02d}:{minutos:02d}"

    # PASO 1: Calcular tiempo total necesario
    tiempo_total_materias = sum(
        float(horas[0]) if isinstance(horas, np.ndarray) else float(horas)
        for horas in horas_materias.values()
    )
    tiempo_total_tareas = sum(tiempo for tiempo, _ in tareas_actividad.values())
    tiempo_necesario_total = tiempo_total_materias + tiempo_total_tareas

    # Calcular tiempo libre total disponible
    tiempo_libre_total_semana = sum(
        tiempo_total_libre.get(dia, 0) for dia in dias_semana_orden
    )

    # PASO 2: Reservar tiempo de descanso si es posible
    tiempo_descanso_disponible = max(
        0, tiempo_libre_total_semana - tiempo_necesario_total
    )
    tiempo_descanso_por_dia = {}

    if tiempo_descanso_disponible > 0:
        # Distribuir el descanso proporcionalmente entre los días según su tiempo libre
        for dia in dias_semana_orden:
            if tiempo_total_libre.get(dia, 0) > 0:
                proporcion = tiempo_total_libre[dia] / tiempo_libre_total_semana
                tiempo_descanso_por_dia[dia] = tiempo_descanso_disponible * proporcion
            else:
                tiempo_descanso_por_dia[dia] = 0

    # PASO 3: Crear períodos disponibles después de reservar descanso
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
        if dia in periodos_libres:
            # Reservar descanso antes de usar los períodos
            periodos_con_descanso = reservar_descanso_en_periodo(
                periodos_libres[dia], tiempo_descanso_por_dia.get(dia, 0)
            )
            periodos_disponibles[dia] = periodos_con_descanso
        else:
            periodos_disponibles[dia] = []

    def calcular_prioridad(tarea, tiempo_horas, dia_entrega):
        """Calcula la prioridad de una tarea basada en urgencia y duración"""
        dia_entrega_abrev = dias_completos[dia_entrega]

        # Determinar días disponibles para trabajar
        if dia_entrega_abrev in [
            "Sab",
            "Dom",
            "Lun",
        ]:  # Lunes tratado como fin de semana
            dias_disponibles = 5  # Toda la semana laboral
        elif dia_entrega_abrev in dias_semana_orden[1:]:  # Martes a Viernes
            indice_entrega = dias_semana_orden.index(dia_entrega_abrev)
            dias_disponibles = indice_entrega  # Hasta el día anterior
        else:
            dias_disponibles = 5

        # Si no tiene días disponibles, máxima prioridad
        if dias_disponibles == 0:
            return 1000

        # Factor de urgencia (menos días = más urgente)
        factor_urgencia = (6 - dias_disponibles) / 5  # 0.2 a 1.0

        # Factor de duración (más horas = más prioritario)
        factor_duracion = min(tiempo_horas / 10, 1.0)  # Normalizar a máximo 1.0

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

    # PASO 4: Priorizar y ordenar tareas
    tareas_priorizadas = []
    for tarea, (tiempo_horas, dia_entrega) in tareas_actividad.items():
        prioridad = calcular_prioridad(tarea, tiempo_horas, dia_entrega)
        tareas_priorizadas.append((prioridad, tarea, tiempo_horas, dia_entrega))

    # Ordenar por prioridad (mayor prioridad primero)
    tareas_priorizadas.sort(key=lambda x: x[0], reverse=True)

    # PASO 5: Asignar tareas según prioridad
    for prioridad, tarea, tiempo_horas, dia_entrega in tareas_priorizadas:
        # Determinar qué días están disponibles para esta tarea
        dia_entrega_abrev = dias_completos[dia_entrega]

        if dia_entrega_abrev in ["Sab", "Dom", "Lun"]:  # Lunes como próxima semana
            # Entrega en fin de semana o lunes próximo: puede usar toda la semana laboral
            dias_disponibles = dias_semana_orden.copy()
        elif dia_entrega_abrev in dias_semana_orden[1:]:  # Martes a Viernes
            # Entrega entre martes y viernes: usar hasta el día ANTERIOR
            indice_entrega = dias_semana_orden.index(dia_entrega_abrev)
            dias_disponibles = dias_semana_orden[:indice_entrega]
        else:
            dias_disponibles = dias_semana_orden.copy()

        horarios_tareas[tarea] = {}
        tiempo_restante = tiempo_horas

        # Intentar asignar en los días disponibles
        for dia in dias_disponibles:
            if tiempo_restante <= 0:
                break

            asignaciones, tiempo_restante = asignar_tiempo_en_periodo(
                dia, tiempo_restante, tarea, es_tarea=True
            )

            if asignaciones:
                horarios_tareas[tarea][dia] = asignaciones

        # Si no se pudo asignar todo el tiempo, reportar
        if tiempo_restante > 0:
            print(
                f"Advertencia: No se pudo asignar {tiempo_restante:.2f} horas para {tarea} (entrega {dia_entrega})"
            )

    # PASO 6: Asignar tiempo de estudio de materias
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

    return {
        "horarios_materias": horarios_materias,
        "horarios_tareas": horarios_tareas,
        "tiempo_descanso_reservado": tiempo_descanso_por_dia,
    }
