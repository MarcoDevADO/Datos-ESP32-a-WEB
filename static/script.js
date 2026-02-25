
const tableBody = document.querySelector("#data-table tbody");

const ctxAX = document.getElementById('chartAX').getContext('2d');
const ctxAY = document.getElementById('chartAY').getContext('2d');
const ctxAZ = document.getElementById('chartAZ').getContext('2d');

function createLineChart(ctx, label, color){
    return new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: label, data: [], borderColor: color, fill: false }] },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            elements: { 
                point: { radius: 0 },
                line: { tension: 0 }
            },
            scales: { 
                x: { display: false },
                y: { ticks: { maxTicksLimit: 5 } }
            }
        }
    });
}

const chartAX = createLineChart(ctxAX, 'AX', 'red');
const chartAY = createLineChart(ctxAY, 'AY', 'green');
const chartAZ = createLineChart(ctxAZ, 'AZ', 'blue');

function addData(chart, value) {
    chart.data.labels.push('');
    chart.data.datasets[0].data.push(value);

    if (chart.data.labels.length > 50) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update('none');
}

function actualizarDashboard(json) {

    // ===== TABLA =====
    const row = tableBody.insertRow();
    row.insertCell(0).innerText = json.ax;
    row.insertCell(1).innerText = json.ay;
    row.insertCell(2).innerText = json.az;
    row.insertCell(3).innerText = json.emg ?? 0;

    if (tableBody.rows.length > 50) tableBody.deleteRow(0);

    // ===== GRÁFICAS =====
    addData(chartAX, json.ax);
    addData(chartAY, json.ay);
    addData(chartAZ, json.az);
}

const socket = io();

socket.on('connect', () => {
    console.log("Conectado al servidor");
});

socket.on('nuevos_datos', (data) => {
    actualizarDashboard(data);
});

socket.on('disconnect', () => {
    console.log("Desconectado del servidor");
});


function debounce(fn, wait) {
    let t = null;
    return function(...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

const charts = [chartAX, chartAY, chartAZ];

const resizeCharts = debounce(() => {
    charts.forEach(c => { 
        try { c.resize(); } catch(e) {}
    });
}, 150);

window.addEventListener('resize', resizeCharts);
window.addEventListener('orientationchange', resizeCharts);