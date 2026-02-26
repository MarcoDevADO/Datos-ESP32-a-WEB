from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Buffer global
datos_actuales = {"ax": 0, "ay": 0, "az": 0, "emg": 0}


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/update', methods=['POST'])
def update():
    global datos_actuales
    datos_actuales = request.get_json()
    return jsonify({"status": "ok"})


@app.route('/data', methods=['GET'])
def data():
    return jsonify(datos_actuales)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)