from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
from auxi import (
    KNNModel,
    nuevo_df,
    materias_frecuencias,
    etiquetar,
    obtener_tiempo_libre,
    asignar_tareas,
    predecir_individuo,
    asignar_horarios_estudio,
)
from statistics import mode
import numpy as np
import pandas as pd


app = Flask(__name__)
CORS(app)


modelosKnn = KNNModel(k=5)


df = pd.read_excel("Respuestas.xlsx")

frecuencias = materias_frecuencias(
    df[
        "Ordena las materias de 5to Semestre por dificultad y dedicación que necesites"
    ].values
)
suma = sum(list(frecuencias.values()))
for key in frecuencias.keys():
    frecuencias[key] = frecuencias[key] / suma

n_df = nuevo_df(df, frecuencias)
n_df["Semana"] = n_df.apply(
    lambda x: mode(
        [
            x["Lunes"],
            x["Martes"],
            x["Miércoles"],
            x["Jueves"],
            x["Viernes"],
        ]
    ),
    axis=1,
)

n_df.drop(columns=["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"], inplace=True)

tiempo_efectivo = {
    "8.5": n_df[n_df["Semana"] == 8.5]["Tiempo al día"].mean(),
    "11.5": n_df[n_df["Semana"] == 11.5]["Tiempo al día"].mean(),
    "14.5": n_df[n_df["Semana"] == 14.5]["Tiempo al día"].mean(),
    "17.5": n_df[n_df["Semana"] == 17.5]["Tiempo al día"].mean(),
    "20.5": n_df[n_df["Semana"] == 20.5]["Tiempo al día"].mean(),
}

for key in tiempo_efectivo.keys():
    tiempo_efectivo[key] = (tiempo_efectivo[key] / max(tiempo_efectivo.values())) * 0.9


df_et = etiquetar(n_df, tiempo_efectivo)


X_train, X_test, y_train, y_test = modelosKnn.preprocess(n_df, df_et)
for model in modelosKnn.models.keys():
    modelosKnn.fit(model, X_train, y_train["Et_" + model])


@app.route("/predecir", methods=["POST"])
def predecir():
    try:
        data = request.get_json()
        tiempo_libre_por_dia = obtener_tiempo_libre(
            data.get("tiempo_libre"), frecuencias
        )
        tiempo_total = 0
        for dia in tiempo_libre_por_dia["tiempo_total_libre"].keys():
            tiempo_total += tiempo_libre_por_dia["tiempo_total_libre"][dia]
        tareas = asignar_tareas(data.get("tareas"), tiempo_total, frecuencias)
        materias = predecir_individuo(
            tareas["tiempo_restante"] / 5,
            tiempo_libre_por_dia["materias"],
            tiempo_libre_por_dia["momento_mas_libre"],
            modelosKnn,
        )
        horarios = asignar_horarios_estudio(
            materias,
            tiempo_libre_por_dia["periodos_libres"],
            tareas["por_actividad"],
            tiempo_libre_por_dia["tiempo_total_libre"],
        )

        return jsonify(horarios)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
