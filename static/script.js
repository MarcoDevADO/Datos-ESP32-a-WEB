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
            elements: { point: { radius: 0 } },
            scales: { x: { display: false } }
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

async function updateData() {
    try {
        const response = await fetch('/data');
        const json = await response.json();

        const row = tableBody.insertRow();
        row.insertCell(0).innerText = json.ax;
        row.insertCell(1).innerText = json.ay;
        row.insertCell(2).innerText = json.az;

        if (tableBody.rows.length > 50) tableBody.deleteRow(0);

        addData(chartAX, json.ax);
        addData(chartAY, json.ay);
        addData(chartAZ, json.az);

    } catch (error) {
        console.log("Esperando datos...");
    }
}

// 🔥 Polling estable cada 500ms
setInterval(updateData, 500);