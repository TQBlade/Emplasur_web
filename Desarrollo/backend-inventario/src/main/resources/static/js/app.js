// ================== DB GLOBAL + HELPERS ==================

window.db = (() => {
  const saved = localStorage.getItem('emplaDb');
  if (saved) {
    try { return JSON.parse(saved); } catch(e){}
  }
  return {
    products: [
      {
        id: 1,
        code: 'PET-001',
        name: 'Botella 500ml Transparente',
        cat: 'Envases PET',
        cost: 200,
        price: 500,
        minUnits: 500,
        lots: [{ size: 100, packs: 3 }, { size: 80, packs: 2 }],
        looseUnits: 20
      },
      {
        id: 2,
        code: 'CL-001',
        name: 'Envase cloro 1L',
        cat: 'Envases polietileno',
        cost: 300,
        price: 800,
        minUnits: 300,
        lots: [{ size: 60, packs: 5 }],
        looseUnits: 0
      },
      {
        id: 3,
        code: 'HOG-001',
        name: 'Balde 10L',
        cat: 'Artículos hogar',
        cost: 4000,
        price: 7000,
        minUnits: 50,
        lots: [],
        looseUnits: 15
      }
    ],
    sales: []
  };
})();

function saveDb() {
  localStorage.setItem('emplaDb', JSON.stringify(window.db));
}

function money(n) {
  n = n || 0;
  return '$' + n.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function totalPacks(p) {
  return (p.lots || []).reduce((a, l) => a + l.packs, 0);
}
function totalUnitsFromPacks(p) {
  return (p.lots || []).reduce((a, l) => a + l.packs * l.size, 0);
}
function totalUnits(p) {
  return totalUnitsFromPacks(p) + (p.looseUnits || 0);
}

function statusBadge(p) {
  const t = totalUnits(p);
  if (t <= 0) return '<span class="badge out">Agotado</span>';
  if (t < p.minUnits) return '<span class="badge low">Bajo</span>';
  return '<span class="badge ok">En stock</span>';
}

function todayRangeMs() {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  const start = new Date(y, m, d, 0, 0, 0, 0).getTime();
  const end = new Date(y, m, d, 23, 59, 59, 999).getTime();
  return { start, end };
}

function refreshKPIs() {
  const el = document.getElementById('kpiProducts');
  if (!el) return; // página distinta

  const db = window.db;
  el.textContent = db.products.length;

  const { start, end } = todayRangeMs();
  const todays = db.sales.filter(s => s.date >= start && s.date <= end);

  document.getElementById('kpiSales').textContent = todays.length;
  const ingresosDia = todays.reduce((a, s) => a + s.total, 0);
  document.getElementById('kpiRevenue').textContent = money(ingresosDia);

  const alerts = db.products.filter(p => totalUnits(p) < p.minUnits).length;
  document.getElementById('kpiAlerts').textContent = alerts;
}

// llamado desde otros módulos cuando cambie algo
function refreshAll() {
  if (window.renderInventory) window.renderInventory();
  if (window.renderProducts) window.renderProducts();
  if (window.renderSales) window.renderSales();
  refreshKPIs();
}

// Navegación lateral
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('sideNav');
  if (nav) {
    nav.addEventListener('click', e => {
      const a = e.target.closest('a'); if (!a) return;
      e.preventDefault();
      document.querySelectorAll('.nav a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      const tab = a.dataset.tab;
      document.getElementById('inventorySection').style.display = tab === 'inventory' ? 'block' : 'none';
      document.getElementById('salesSection').style.display     = tab === 'sales'     ? 'block' : 'none';
      document.getElementById('productsSection').style.display  = tab === 'products'  ? 'block' : 'none';
    });
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.onclick = () => { window.location.href = 'login.html'; };
  }

  refreshAll();
});
