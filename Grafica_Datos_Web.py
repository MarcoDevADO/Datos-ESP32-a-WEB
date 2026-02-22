"""APP1 - Servidor Flask con Ngrok

Aplicación de servidor web basada en Flask que:
- Recibe datos de acelerómetro (ax, ay, az) desde MATLAB
- Los almacena en un buffer global
- Los expone mediante una API REST
- Utiliza ngrok para crear un túnel público acceso remoto
- Soporta CORS para peticiones desde distintos origenes

Requisitos:
- Flask
- Flask-CORS
- pyngrok
- python-dotenv
"""

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from pyngrok import ngrok
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Token de autenticación para ngrok (crear en: https://dashboard.ngrok.com/auth)
KEY = os.getenv("KEY")  # Asegúrate de tener un archivo .env con la línea: KEY=tu_token_ngrok_aquí

# Buffer global para almacenar los datos más recientes del acelerómetro
datos_actuales = {"ax": 0, "ay": 0, "az": 0}

# Inicializar aplicación Flask
app = Flask(__name__)
# Habilitar CORS para permitir peticiones desde cualquier origen
CORS(app)

@app.route('/')
def home():
    """Ruta raíz que sirve la interfaz HTML principal."""
    return render_template('index.html')

@app.route('/update', methods=['POST'])
def update():
    """Endpoint para recibir datos del acelerómetro.
    
    Recibe un JSON con las componentes del acelerómetro (ax, ay, az)
    y lo almacena en el buffer global para que esté disponible para otros clientes.
    
    Request: POST /update
    Body: {"ax": float, "ay": float, "az": float}
    Response: {"status": "ok"}
    """
    global datos_actuales
    datos_actuales = request.get_json()
    return jsonify({"status": "ok"})

@app.route('/data')
def data():
    """Endpoint para obtener los datos más recientes del acelerómetro.
    
    Retorna los últimos datos almacenados en el buffer global.
    
    Request: GET /data
    Response: {"ax": float, "ay": float, "az": float}
    """
    return jsonify(datos_actuales)


if __name__ == "__main__":
    """Punto de entrada de la aplicación.
    
    1. Configura ngrok para crear un túnel público
    2. Inicia el servidor Flask en localhost:5000
    """
    
    # PASO 1: Configurar y activar ngrok
    # ====================================
    # ngrok permite acceder al servidor local desde internet
    # sin necesidad de configurar puertos en el router
    try:
        # Autenticar con el token de ngrok
        ngrok.set_auth_token(KEY)

        # Cerrar cualquier túnel previo activo
        ngrok.kill()

        # Crear nuevo túnel que redirija tráfico a puerto 5000 (Flask)
        public_url = ngrok.connect(5000).public_url
        print(f"\nServidor público disponible en: {public_url}\n")
        print("Endpoints disponibles:")
        print(f"  - GET  {public_url}/data")
        print(f"  - POST {public_url}/update")
        print()

    except Exception as e:
        print("Error iniciando ngrok:", e)
        print("   El servidor seguirá ejecutándose en localhost:5000\n")

    # PASO 2: Iniciar servidor Flask
    # ==============================
    # host="0.0.0.0" permite conexiones desde cualquier interfaz de red
    # port=5000 es el puerto donde escucha el servidor
    app.run(host="0.0.0.0", port=5000)
