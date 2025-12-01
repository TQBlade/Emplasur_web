// ================== DASHBOARD PRINCIPAL (KPIs REALEAS) ==================

document.addEventListener('DOMContentLoaded', () => {
  // Cargar datos apenas inicia
  refreshDashboard();

  // Configurar botón de Logout
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.onclick = () => {
      localStorage.removeItem('usuarioSesion');
      window.location.href = '/login'; 
    };
  }

  // Navegación lateral (Tabs)
  const nav = document.getElementById('sideNav');
  if (nav) {
    nav.addEventListener('click', e => {
      const a = e.target.closest('a'); if (!a) return;
      e.preventDefault();
      
      // Activar clase visual
      document.querySelectorAll('.nav a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      
      // Mostrar sección correspondiente
      const tab = a.dataset.tab; // inventory, sales, products
      
      // Ocultar todas
      document.getElementById('inventorySection').style.display = 'none';
      document.getElementById('salesSection').style.display = 'none';
      document.getElementById('productsSection').style.display = 'none';
      
      // Mostrar la seleccionada
      const section = document.getElementById(tab + 'Section');
      if(section) section.style.display = 'block';

      // Recargar datos específicos según la pestaña
      if (tab === 'inventory' && window.renderInventory) window.renderInventory();
      if (tab === 'products' && window.renderProducts) window.renderProducts();
      if (tab === 'sales' && window.renderSales) window.renderSales();
    });
  }
});

// Función central para actualizar los cuadritos de arriba (KPIs)
async function refreshDashboard() {
  try {
    // 1. Obtener Productos para contar totales y alertas
    const resProd = await fetch('/api/productos');
    const productos = await resProd.json();

    // KPI 1: Productos Totales
    const kpiProducts = document.getElementById('kpiProducts');
    if (kpiProducts) kpiProducts.textContent = productos.length;

    // KPI 4: Alertas de Stock (Calculado: totalUnidades < stockMinimo)
    const alertas = productos.filter(p => p.totalUnidades < p.stockMinimo).length;
    const kpiAlerts = document.getElementById('kpiAlerts');
    if (kpiAlerts) kpiAlerts.textContent = alertas;


    // 2. Obtener Ventas de HOY para Ingresos
    const hoy = new Date().toISOString().split('T')[0]; // "2023-11-25"
    const resVentas = await fetch(`/api/ventas?desde=${hoy}&hasta=${hoy}`);
    const ventasHoy = await resVentas.json();

    // KPI 2: Cantidad de Ventas hoy
    const kpiSales = document.getElementById('kpiSales');
    if (kpiSales) kpiSales.textContent = ventasHoy.length;

    // KPI 3: Dinero ($) Ingresos hoy
    const totalIngresos = ventasHoy.reduce((sum, v) => sum + v.totalVenta, 0);
    const kpiRevenue = document.getElementById('kpiRevenue');
    if (kpiRevenue) kpiRevenue.textContent = money(totalIngresos);

  } catch (error) {
    console.error("Error actualizando Dashboard:", error);
  }
}

// Helper global de moneda
function money(n) {
  return '$' + (n || 0).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// Función global para que otros scripts pidan actualizar el dashboard
window.refreshAll = function() {
  refreshDashboard();
  if (window.renderInventory) window.renderInventory();
};