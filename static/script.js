const tableBody = document.querySelector("#data-table tbody");

const ctxdist1_historial = document.getElementById('chartAX').getContext('2d');
const ctxdist2_historial = document.getElementById('chartAY').getContext('2d');

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

const chartdist1_historial = createLineChart(ctxdist1_historial, 'dist1', 'red');
const chartdist2_historial = createLineChart(ctxdist2_historial, 'dist2', 'green');

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
            addData(chartdist1_historial, v1);
            addData(chartdist2_historial, v2);
        });

    } catch (error) {
        console.log("Esperando datos...");
    }
}

setInterval(updateData, 500);