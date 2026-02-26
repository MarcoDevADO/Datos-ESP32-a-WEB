from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import os

app = Flask(__name__)
CORS(app)

# async_mode="threading" evita usar eventlet o gevent
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

datos_actuales = {"ax": 0, "ay": 0, "az": 0, "emg": 0}


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/update', methods=['POST'])
def update():
    global datos_actuales
    datos_actuales = request.get_json()

    # Enviar datos en tiempo real
    socketio.emit('nuevos_datos', datos_actuales)

    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port)