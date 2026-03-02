from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
from flask import send_file
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import pagesizes
import io

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

@app.route('/download-pdf', methods=['GET'])
def download_pdf():
    global datos_historial

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=pagesizes.letter)
    elements = []

    styles = getSampleStyleSheet()
    elements.append(Paragraph("Reporte de Datos ESP32", styles['Title']))
    elements.append(Spacer(1, 12))

    # Crear tabla
    data = [["AX", "AY", "AZ"]]

    for dato in datos_historial:
        data.append([dato["ax"], dato["ay"], dato["az"]])

    table = Table(data)
    table.setStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ])

    elements.append(table)

    doc.build(elements)

    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="reporte_esp32.pdf",
        mimetype='application/pdf'
    )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)