/**Script.js - Lógica Frontend del Dashboard ESP32

Funcionalidades:
- Solicita datos del acelerómetro cada 100ms
- Visualiza los datos en gráficas en tiempo real (Chart.js)
- Muestra un historial en tabla (últimas 50 muestras)
- Se adapta automáticamente a cambios de tamaño/orientación
- Funciona óptimamente en dispositivos móviles
*/

// Obtener referencia al cuerpo de la tabla HTML
const tableBody = document.querySelector("#data-table tbody");

// Crear contextos 2D para las gráficas de Chart.js
const ctxAX = document.getElementById('chartAX').getContext('2d');
const ctxAY = document.getElementById('chartAY').getContext('2d');
const ctxAZ = document.getElementById('chartAZ').getContext('2d');

/**
 * Crea una gráfica de línea optimizada para mostrar datos en tiempo real.
 * @param {CanvasRenderingContext2D} ctx - Contexto 2D del canvas
 * @param {string} label - Etiqueta de la serie de datos
 * @param {string} color - Color de la línea (ej: 'red', 'blue')
 * @returns {Chart} Instancia de Chart.js configurada
 */
function createLineChart(ctx, label, color){
    return new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: label, data: [], borderColor: color, fill: false }] },
        options: {
            animation: false,           // Desactivar animaciones para mejor rendimiento
            responsive: true,            // Adaptarse al tamaño del contenedor
            maintainAspectRatio: false,  // Permitir altura personalizada
            plugins: { legend: { display: false } },  // Ocultar leyenda
            elements: { 
                point: { radius: 0 },    // Sin puntos de datos visibles
                line: { tension: 0 }      // Líneas rectas sin suavizado
            },
            scales: { 
                x: { display: false },    // Ocultar eje X
                y: { ticks: { maxTicksLimit: 5 } }  // Máximo 5 marcas en eje Y
            }
        }
    });
}

// Instanciar gráficas para los 3 ejes del acelerómetro
const chartAX = createLineChart(ctxAX, 'AX', 'red');
const chartAY = createLineChart(ctxAY, 'AY', 'green');
const chartAZ = createLineChart(ctxAZ, 'AZ', 'blue');

/**
 * Obtiene datos del servidor y actualiza tabla y gráficas.
 * Se ejecuta cada 100ms (10Hz) para mostrar datos en tiempo real.
 */
async function updateData() {
    try {
        // Obtener datos JSON del servidor
        const response = await fetch('/data');
        const json = await response.json();

        // ===== ACTUALIZAR TABLA ====
        // Insertar nueva fila con los datos más recientes
        const row = tableBody.insertRow();
        row.insertCell(0).innerText = json.ax;   // Columna AX
        row.insertCell(1).innerText = json.ay;   // Columna AY
        row.insertCell(2).innerText = json.az;   // Columna AZ
        row.insertCell(3).innerText = json.emg;  // Columna EMG

        // Mantener solo las últimas 50 muestras en la tabla
        if (tableBody.rows.length > 50) tableBody.deleteRow(0);

        // ===== ACTUALIZAR GRÁFICAS ====
        // Agregar el valor más reciente a cada gráfica
        addData(chartAX, json.ax);
        addData(chartAY, json.ay);
        addData(chartAZ, json.az);

    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

/**
 * Agrega un nuevo punto de datos a una gráfica.
 * Mantiene un máximo de 50 puntos para mejor rendimiento y legibilidad.
 * @param {Chart} chart - Instancia de la gráfica
 * @param {number} value - Valor a adicionar
 */
function addData(chart, value) {
    // Agregar etiqueta vacía (solo es separador visual)
    chart.data.labels.push('');
    // Agregar el nuevo valor a los datos
    chart.data.datasets[0].data.push(value);
    
    // Si se excede el máximo, eliminar el punto más antiguo
    if (chart.data.labels.length > 50) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    
    // Actualizar gráfica sin animación ('none') para mejor rendimiento
    chart.update('none');
}

// ===== CONFIGURAR ACTUALIZACIÓN PERIÓDICA =====
// Actualizar datos cada 100 ms (frecuencia de 10 Hz)
setInterval(updateData, 100);

/**
 * Función auxiliar para limitar la frecuencia de ejecución de una función.
 * Evita que se ejecute demasiadas veces en poco tiempo.
 * @param {Function} fn - Función a ejecutar
 * @param {number} wait - Milisegundos a esperar antes de ejecutar
 * @returns {Function} Función debounced
 */
function debounce(fn, wait) {
    let t = null;
    return function(...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

// ===== MANEJO DE CAMBIOS DE TAMAÑO =====
// Lista de gráficas para redibujar
const charts = [chartAX, chartAY, chartAZ];

// Función debounced para redimensionar gráficas
const resizeCharts = debounce(() => {
    charts.forEach(c => { 
        try { 
            c.resize();  // Recalcular tamaño de gráfica
        } catch(e) {}
    });
}, 150);

// Redibujar gráficas cuando cambia el tamaño de la ventana
window.addEventListener('resize', resizeCharts);
// Redibujar gráficas cuando cambia la orientación del dispositivo (móvil)
window.addEventListener('orientationchange', resizeCharts);
