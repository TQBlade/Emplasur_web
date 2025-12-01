// ================== VENTAS ==================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('saleForm');
  if (!form) return;

  const selProduct = document.getElementById('saleProduct');

  function loadProductsInSaleSelect() {
    selProduct.innerHTML = '';
    window.db.products.forEach((p, i) => {
      const opt = document.createElement('option');
      opt.value = p.code;
      opt.textContent = `${p.code} — ${p.name}`;
      selProduct.appendChild(opt);
    });
    loadPackSizesForSelected();
    syncPriceFromProduct();
  }

  function getSelectedProduct() {
    const code = selProduct.value;
    return window.db.products.find(p => p.code === code);
  }

  function loadPackSizesForSelected() {
    const p = getSelectedProduct();
    const sizes = [...new Set((p?.lots || []).map(l => l.size))];

    const s1 = document.getElementById('salePackSize');
    const s2 = document.getElementById('salePackSizeMixed');

    const html = sizes.length
      ? sizes.map(s => `<option value="${s}">${s}</option>`).join('')
      : '<option value="">—</option>';

    s1.innerHTML = html;
    s2.innerHTML = html;
  }

  function syncPriceFromProduct() {
    const p = getSelectedProduct();
    if (p) document.getElementById('salePrice').value = p.price || 0;
  }

  selProduct.addEventListener('change', () => {
    loadPackSizesForSelected();
    syncPriceFromProduct();
  });

  loadProductsInSaleSelect();

  // ======= Tabs (Hoy / Historial) + Modal =======
  const btnTabForm = document.getElementById('btnTabSaleForm');
  const btnTabHist = document.getElementById('btnTabSaleHistory');
  const secForm    = document.getElementById('saleFormSection');
  const secHist    = document.getElementById('saleHistorySection');

  const saleModal  = document.getElementById('saleModal');

  function showSectionHoy() {
    if (secForm && secHist) {
      secForm.style.display = 'block';
      secHist.style.display = 'none';
    }
  }
  function showSectionHist() {
    if (secForm && secHist) {
      secForm.style.display = 'none';
      secHist.style.display = 'block';
      renderSalesHistory(); // refresca tabla
    }
  }

  function openSaleModal() {
    showSectionHoy();
    if (saleModal) saleModal.style.display = 'flex';
  }
  function closeSaleModal() {
    if (saleModal) saleModal.style.display = 'none';
  }

  if (btnTabForm) {
    btnTabForm.addEventListener('click', openSaleModal);
  }
  if (btnTabHist) {
    btnTabHist.addEventListener('click', showSectionHist);
  }

  document.querySelectorAll('[data-close="saleModal"]').forEach(btn => {
    btn.addEventListener('click', closeSaleModal);
  });

  // Estado inicial: mostrar ventas de hoy, ocultar historial
  showSectionHoy();

  // ======= Toggle modo de venta =======
  const saleModeButtons = document.getElementById('saleMode');
  const boxUnit  = document.getElementById('saleUnitsBox');
  const boxPack  = document.getElementById('salePacksBox');
  const boxMixed = document.getElementById('saleMixedBox');

  saleModeButtons.addEventListener('click', e => {
    const btn = e.target.closest('button'); if (!btn) return;
    saleModeButtons.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const mode = btn.dataset.mode;
    boxUnit.style.display  = mode === 'unit'  ? 'block' : 'none';
    boxPack.style.display  = mode === 'pack'  ? 'block' : 'none';
    boxMixed.style.display = mode === 'mixed' ? 'block' : 'none';
  });

  // ======= Descontar inventario (FIFO) =======
  function descontarInventario(product, units) {
    let remaining = units;
    const p = product;

    // primero sueltas
    const takeLoose = Math.min(remaining, p.looseUnits || 0);
    p.looseUnits = (p.looseUnits || 0) - takeLoose;
    remaining -= takeLoose;

    // luego pacas
    for (const lot of p.lots) {
      while (remaining > 0 && lot.packs > 0) {
        if (remaining >= lot.size) {
          lot.packs--;
          remaining -= lot.size;
        } else {
          // romper una paca
          lot.packs--;
          const resto = lot.size - remaining;
          p.looseUnits = (p.looseUnits || 0) + resto;
          remaining = 0;
        }
      }
      if (remaining === 0) break;
    }
    // limpiar lotes vacíos
    p.lots = p.lots.filter(l => l.packs > 0);
  }

  // ======= Registrar venta =======
  form.addEventListener('submit', e => {
    e.preventDefault();
    const p = getSelectedProduct();
    if (!p) {
      alert('Seleccione un producto');
      return;
    }

    const modeBtn = document.querySelector('#saleMode .active');
    const mode = modeBtn.dataset.mode;

    let unitsSold = 0;
    let desc = '';

    if (mode === 'unit') {
      const u = Math.max(1, Number(document.getElementById('saleUnits').value || 0));
      unitsSold = u;
      desc = `${u} u`;
    } else if (mode === 'pack') {
      const size = Number(document.getElementById('salePackSize').value || 0);
      const qty  = Math.max(1, Number(document.getElementById('salePackQty').value || 0));
      if (!size) { alert('Seleccione tamaño de paca'); return; }
      unitsSold = size * qty;
      desc = `${qty} paca(s) de ${size} u`;
    } else { // mixto
      const size = Number(document.getElementById('salePackSizeMixed').value || 0);
      const qty  = Math.max(0, Number(document.getElementById('salePackQtyMixed').value || 0));
      const u    = Math.max(0, Number(document.getElementById('saleUnitsMixed').value || 0));
      if (!size && qty > 0) { alert('Seleccione tamaño de paca'); return; }
      unitsSold = (size * qty) + u;
      desc = `${qty} paca(s) de ${size} u + ${u} u`;
      if (unitsSold <= 0) { alert('Indique una cantidad'); return; }
    }

    const priceUnit = Number(document.getElementById('salePrice').value || 0);
    const client    = document.getElementById('saleClient').value.trim();

    const costUnit  = p.cost || 0;
    const totalVenta = priceUnit * unitsSold;
    const costoTotal = costUnit * unitsSold;
    const ganancia   = totalVenta - costoTotal;

    // Descontar del inventario
    descontarInventario(p, unitsSold);

    // Registrar venta en DB
    window.db.sales.push({
      id: Date.now(),
      date: Date.now(),
      productId: p.id,
      product: { code: p.code, name: p.name },
      units: unitsSold,
      desc,
      priceUnit,
      total: totalVenta,
      cost: costoTotal,
      profit: ganancia,
      client
    });

    saveDb();
    form.reset();
    syncPriceFromProduct();
    refreshAll();
    closeSaleModal();   // cerrar el modal después de guardar
  });

  // ======= Render ventas de hoy =======
  function renderSalesToday() {
    const tbody = document.getElementById('salesTodayBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const { start, end } = todayRangeMs();
    const todays = window.db.sales.filter(s => s.date >= start && s.date <= end);

    let sumTotal = 0, sumCost = 0, sumProfit = 0;

    todays.slice().sort((a,b) => a.date - b.date).forEach(s => {
      sumTotal  += s.total;
      sumCost   += s.cost;
      sumProfit += s.profit;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(s.date).toLocaleTimeString()}</td>
        <td>${s.product.name}</td>
        <td>${s.desc}</td>
        <td>${s.units}</td>
        <td>${money(s.total)}</td>
        <td>${money(s.cost)}</td>
        <td>${money(s.profit)}</td>
        <td>${s.client || '—'}</td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('sumVentasDia').textContent   = money(sumTotal);
    document.getElementById('sumCostoDia').textContent    = money(sumCost);
    document.getElementById('sumGananciaDia').textContent = money(sumProfit);
  }

  // ======= Render historial (filtro por fechas) =======
  function renderSalesHistory(filtro = null) {
    const tbody = document.getElementById('salesHistoryBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    let lista = [...window.db.sales];
    if (filtro) {
      lista = lista.filter(v => v.date >= filtro.desde && v.date <= filtro.hasta);
    }

    let total = 0, costo = 0, ganancia = 0;

    lista.sort((a,b) => a.date - b.date).forEach(s => {
      total    += s.total;
      costo    += s.cost;
      ganancia += s.profit;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(s.date).toLocaleString()}</td>
        <td>${s.product.name}</td>
        <td>${s.desc}</td>
        <td>${s.units}</td>
        <td>${money(s.total)}</td>
        <td>${money(s.cost)}</td>
        <td>${money(s.profit)}</td>
        <td>${s.client || '—'}</td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('t_total').textContent    = money(total);
    document.getElementById('t_costo').textContent    = money(costo);
    document.getElementById('t_ganancia').textContent = money(ganancia);
  }

  // Exponer para app.js
  window.renderSales = function () {
    renderSalesToday();
  };

  // Inicial
  renderSalesToday();

  // ======= Filtro por fechas =======
  document.getElementById('btnFiltrarVentas').addEventListener('click', () => {
    const desde = document.getElementById('f_desde').value;
    const hasta = document.getElementById('f_hasta').value;

    if (!desde || !hasta) {
      alert('Seleccione ambas fechas');
      return;
    }

    const filtro = {
      desde: new Date(desde + ' 00:00').getTime(),
      hasta: new Date(hasta + ' 23:59').getTime()
    };
    renderSalesHistory(filtro);
  });

  // ======= Exportar PDF =======
  document.getElementById('btnPDFVentas').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape' });

    pdf.setFontSize(14);
    pdf.text('REPORTE DE VENTAS', 14, 16);

    const desde = document.getElementById('f_desde').value;
    const hasta = document.getElementById('f_hasta').value;
    if (desde && hasta) {
      pdf.setFontSize(10);
      pdf.text(`Periodo: ${desde} a ${hasta}`, 14, 24);
    }

    const rows = [];
    document.querySelectorAll('#salesHistoryBody tr').forEach(tr => {
      const cols = [...tr.children].map(td => td.textContent);
      rows.push(cols);
    });

    let y = 34;
    pdf.setFontSize(8);
    rows.forEach(r => {
      pdf.text(r.join(' | '), 10, y);
      y += 5;
      if (y > 190) {
        pdf.addPage();
        y = 20;
      }
    });

    pdf.save('reporte_ventas.pdf');
  });
});
