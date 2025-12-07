document.addEventListener('DOMContentLoaded', () => {
    // Exponer función global para recargar
    window.loadCharts = loadChartsData;
});

let chartTop = null;
let chartBalance = null;

async function loadChartsData() {
    console.log("Cargando reportes...");
    await loadTopProducts();
    await loadBalance();
    await loadDeadStock();
}

// 1. GRÁFICO TOP PRODUCTOS
async function loadTopProducts() {
    try {
        const res = await fetch('/api/reportes/top-productos');
        const data = await res.json();

        const ctx = document.getElementById('chartTopProducts').getContext('2d');
        
        // Destruir anterior si existe para actualizar
        if(chartTop) chartTop.destroy();

        chartTop = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.nombre),
                datasets: [{
                    label: 'Unidades Vendidas',
                    data: data.map(d => d.cantidad),
                    backgroundColor: ['#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e74c3c'],
                    borderWidth: 1
                }]
            },
            options: { responsive: true }
        });
    } catch(e) { console.error("Error Top Productos:", e); }
}

// 2. GRÁFICO BALANCE
async function loadBalance() {
    try {
        const res = await fetch('/api/reportes/balance-semanal');
        const data = await res.json();

        const ctx = document.getElementById('chartBalance').getContext('2d');
        if(chartBalance) chartBalance.destroy();

        chartBalance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.fecha),
                datasets: [
                    {
                        label: 'Ingresos',
                        data: data.map(d => d.ingresos),
                        borderColor: '#2ecc71',
                        fill: false
                    },
                    {
                        label: 'Ganancia Neta',
                        data: data.map(d => d.ganancia),
                        borderColor: '#3498db',
                        fill: true,
                        backgroundColor: 'rgba(52, 152, 219, 0.1)'
                    }
                ]
            },
            options: { responsive: true }
        });
    } catch(e) { console.error("Error Balance:", e); }
}

// 3. TABLA HUESO
async function loadDeadStock() {
    try {
        const res = await fetch('/api/reportes/sin-rotacion');
        const productos = await res.json();
        
        const tbody = document.getElementById('bodyHueso');
        tbody.innerHTML = '';

        if(productos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">¡Excelente! Todo el inventario se mueve.</td></tr>';
            return;
        }

        productos.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.codigo}</td>
                    <td>${p.nombre}</td>
                    <td>${p.categoria}</td>
                    <td style="color:red; font-weight:bold">${p.totalUnidades || 0}</td>
                </tr>
            `;
        });
    } catch(e) { console.error("Error Hueso:", e); }
}