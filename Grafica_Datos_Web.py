from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Buffer global
datos_historial = []


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/update', methods=['POST'])
def update():
    global datos_historial

    dato = request.get_json()

    datos_historial.append(dato)

    return jsonify({"status": "ok"})


@app.route('/data', methods=['GET'])
def data():
    return jsonify(datos_historial)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)