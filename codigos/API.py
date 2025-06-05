from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
from auxi import KNNModel, nuevo_df, materias_frecuencias, etiquetar
from statistics import mode
from sklearn.neighbors import KNeighborsRegressor
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


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
predicciones = {}
for model in modelosKnn.models.keys():
    modelosKnn.fit(model, X_train, y_train["Et_" + model])


@app.route("/predecir", methods=["POST"])
def predecir():
    data = request.get_json()
    modelo = data.get("modelo")
    features = data.get("features")

    if modelo not in modelosKnn.models:
        return jsonify({"error": "Modelo no válido"}), 400

    X = pd.DataFrame([features])
    X_scaled = pd.DataFrame(modelosKnn.scaler.transform(X), columns=X.columns)

    try:
        pred = modelosKnn.predict(modelo, X_scaled)
        return jsonify({"prediccion": pred.tolist()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
