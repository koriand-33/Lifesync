from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
from datetime import datetime
from auxi import (
    KNNModel,
    nuevo_df,
    materias_frecuencias,
    etiquetar,
    obtener_tiempo_libre,
    asignar_tareas,
    predecir_individuo,
    asignar_horarios_estudio,
    mapeo_dias,
)
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
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
n_df["Semana_l"] = n_df.apply(
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

X = n_df.drop(columns=["Semana_l"])
y = n_df["Semana_l"].apply(lambda x: str(x))
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
)

classifier = KNeighborsClassifier(n_neighbors=5)
classifier.fit(X_train, y_train)

n_df["Semana"] = classifier.predict(X)
n_df["Semana"] = n_df["Semana"].astype(float)

n_df.drop(
    columns=["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Semana_l"],
    inplace=True,
)

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
        ahora = datetime.now()
        hora = str(ahora.strftime("%H:%M"))
        dia_semana = str(ahora.strftime("%A"))
        data = request.get_json()
        tiempo_libre_por_dia = obtener_tiempo_libre(data, frecuencias)
        tiempo_total = 0
        for dia in tiempo_libre_por_dia["tiempo_total_libre"].keys():
            tiempo_total += tiempo_libre_por_dia["tiempo_total_libre"][dia]
        tareas = asignar_tareas(data, tiempo_total, frecuencias)
        materias = predecir_individuo(
            tareas["tiempo_restante"] / 5,
            tiempo_libre_por_dia["materias"],
            tiempo_libre_por_dia["momento_mas_libre"],
            modelosKnn,
            modelo=classifier,
        )
        horarios = asignar_horarios_estudio(
            materias,
            tiempo_libre_por_dia["periodos_libres"],
            tareas,
            tiempo_libre_por_dia["tiempo_total_libre"],
            dia_actual=mapeo_dias[dia_semana],
            hora_actual=hora,
            tiempo_sabado=data["tiempo_fines"]["Sabado"],
            tiempo_domingo=data["tiempo_fines"]["Domingo"],
        )

        return jsonify(data | horarios)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
