// ================== DASHBOARD PRINCIPAL (KPIs CORREGIDOS) ==================

document.addEventListener('DOMContentLoaded', () => {
  refreshDashboard();

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.onclick = () => {
      localStorage.removeItem('usuarioSesion');
      window.location.href = '/login'; 
    };
  }

  const nav = document.getElementById('sideNav');
  if (nav) {
    nav.addEventListener('click', e => {
      const a = e.target.closest('a'); if (!a) return;
      e.preventDefault();
      
      document.querySelectorAll('.nav a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      
      const tab = a.dataset.tab; 
      
      // Ocultar todas las secciones
      ['inventory', 'sales', 'products', 'clients'].forEach(s => {
          const el = document.getElementById(s + 'Section');
          if(el) el.style.display = 'none';
      });
      
      // Mostrar la activa
      const activeSection = document.getElementById(tab + 'Section');
      if(activeSection) activeSection.style.display = 'block';

      // Recargar datos específicos
      if (tab === 'inventory' && window.renderInventory) window.renderInventory();
      if (tab === 'products' && window.renderProducts) window.renderProducts();
      if (tab === 'sales' && window.renderSales) window.renderSales();
      if (tab === 'clients' && window.renderClients) window.renderClients();
    });
  }
});

async function refreshDashboard() {
  try {
    // 1. Obtener Productos
    const resProd = await fetch('/api/productos');
    const productos = await resProd.json();

    // KPI 1: Productos Totales
    const kpiProducts = document.getElementById('kpiProducts');
    if (kpiProducts) kpiProducts.textContent = productos.length;

    // KPI 4: Alertas de Stock
    const alertas = productos.filter(p => p.totalUnidades < p.stockMinimo).length;
    const kpiAlerts = document.getElementById('kpiAlerts');
    if (kpiAlerts) kpiAlerts.textContent = alertas;


    // 2. Obtener Ventas de HOY (CORRECCIÓN DE FECHA LOCAL)
    const now = new Date();
    // Forzamos formato YYYY-MM-DD local, no UTC
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hoy = `${year}-${month}-${day}`;

    console.log("Cargando KPIs para fecha:", hoy); // Debug

    const resVentas = await fetch(`/api/ventas?desde=${hoy}&hasta=${hoy}`);
    const ventasHoy = await resVentas.json();

    // KPI 2: Cantidad de Ventas
    const kpiSales = document.getElementById('kpiSales');
    if (kpiSales) kpiSales.textContent = ventasHoy.length;

    // KPI 3: Ingresos
    const totalIngresos = ventasHoy.reduce((sum, v) => sum + v.totalVenta, 0);
    const kpiRevenue = document.getElementById('kpiRevenue');
    if (kpiRevenue) kpiRevenue.textContent = money(totalIngresos);

  } catch (error) {
    console.error("Error actualizando Dashboard:", error);
  }
}

function money(n) {
  return '$' + (n || 0).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

window.refreshAll = function() {
  refreshDashboard();
  if (window.renderInventory) window.renderInventory();
};