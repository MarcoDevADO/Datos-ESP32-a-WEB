const tableBody = document.querySelector("#data-table tbody");

console.log('script.js cargado. tableBody:', tableBody);

const canvas1 = document.getElementById('chartdist1');
const canvas2 = document.getElementById('chartdist2');
if (!canvas1 || !canvas2) console.error('Canvas no encontrado:', canvas1, canvas2);
const ctxdist1 = canvas1.getContext('2d');
const ctxdist2 = canvas2.getContext('2d');

function createLineChart(ctx, label, color){
    return new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: label, data: [], borderColor: color, fill: false }] },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            elements: { point: { radius: 0 } },
            scales: { x: { display: false } }
        }
    });
}

const chartdist1 = createLineChart(ctxdist1, 'dist1', 'red');
const chartdist2 = createLineChart(ctxdist2, 'dist2', 'green');

function addData(chart, value) {
    chart.data.labels.push('');
    chart.data.datasets[0].data.push(value);

    if (chart.data.labels.length > 50) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update('none');
}

function descargarPDF() {
    window.open('/download-pdf', '_blank');
}

async function borrarDatos() {
    if (confirm('¿Estás seguro de que quieres borrar todos los datos?')) {
        try {
            const response = await fetch('/clear-data', { method: 'POST' });
            const result = await response.json();
            if (result.status === 'ok') {
                tableBody.innerHTML = "";
                alert('Datos borrados exitosamente');
            }
        } catch (error) {
            console.error('Error al borrar datos:', error);
            alert('Error al borrar datos');
        }
    }
}

async function updateData() {
    try {
        const response = await fetch('/data');
        const historial = await response.json();

        console.log('/data ->', Array.isArray(historial) ? historial.length : typeof historial, historial?.slice?.(0,3));

        if (!tableBody) { console.error('tableBody no existe'); return; }
        tableBody.innerHTML = "";

        historial.forEach(dato => {
            const row = tableBody.insertRow();
            // Soporte para claves nuevas y antiguas (sin y con _historial)
            row.insertCell(0).innerText = (dato.dist1 ?? dato['dist1'] ?? dato.dist1_historial ?? dato['dist1_historial']) ?? '-';
            row.insertCell(1).innerText = (dato.dist2 ?? dato['dist2'] ?? dato.dist2_historial ?? dato['dist2_historial']) ?? '-';
            row.insertCell(2).innerText = (dato.obs1 ?? dato['obs1'] ?? dato.obs1_historial ?? dato['obs1_historial']) ?? '-';
            row.insertCell(3).innerText = (dato.obs2 ?? dato['obs2'] ?? dato.obs2_historial ?? dato['obs2_historial']) ?? '-';

            // Actualizar gráficas si vienen valores numéricos (priorizar claves nuevas)
            const v1 = Number(dato.dist1 ?? dato['dist1'] ?? dato.dist1_historial ?? dato['dist1_historial']) || 0;
            const v2 = Number(dato.dist2 ?? dato['dist2'] ?? dato.dist2_historial ?? dato['dist2_historial']) || 0;
            addData(chartdist1, v1);
            addData(chartdist2, v2);
        });

    } catch (error) {
        console.error('Error en updateData:', error);
    }
}

// Ejecutar inmediatamente y luego en intervalo
updateData();
setInterval(updateData, 500);