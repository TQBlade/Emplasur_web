// ================== VENTAS (CONECTADO AL BACKEND) ==================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('saleForm');
  const selProduct = document.getElementById('saleProduct');
  // Cache de productos para leer precios y lotes sin llamar a la API cada vez
  let productsCache = [];

  if (!form) return;

  // ---------------------------------------------------------
  // 1. CARGAR PRODUCTOS EN EL SELECT
  // ---------------------------------------------------------
  async function loadProductsInSaleSelect() {
    try {
      const res = await fetch('/api/productos');
      productsCache = await res.json();
      
      selProduct.innerHTML = '<option value="">-- Seleccione un producto --</option>';
      
      productsCache.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id; // Enviamos el ID al backend
        opt.dataset.code = p.codigo;
        // Mostrar código y nombre
        opt.textContent = `${p.codigo} — ${p.nombre} (Stock: ${p.totalUnidades})`;
        selProduct.appendChild(opt);
      });
    } catch (err) {
      console.error("Error cargando productos para venta:", err);
    }
  }

  // Obtener producto seleccionado de la memoria caché
  function getSelectedProduct() {
    const id = Number(selProduct.value);
    return productsCache.find(p => p.id === id);
  }

  // Cargar tamaños de paca disponibles para el producto seleccionado
  function loadPackSizesForSelected() {
    const p = getSelectedProduct();
    const s1 = document.getElementById('salePackSize');
    const s2 = document.getElementById('salePackSizeMixed');
    
    if (!p || !p.lotes || p.lotes.length === 0) {
      const html = '<option value="">No tiene pacas</option>';
      s1.innerHTML = html;
      s2.innerHTML = html;
      return;
    }

    // Extraer tamaños únicos de los lotes
    const sizes = [...new Set(p.lotes.map(l => l.tamanoPaca))];
    const html = sizes.map(s => `<option value="${s}">${s}</option>`).join('');
    
    s1.innerHTML = html;
    s2.innerHTML = html;
  }

  function syncPriceFromProduct() {
    const p = getSelectedProduct();
    if (p) document.getElementById('salePrice').value = p.precioUnitario || 0;
  }

  // Eventos al cambiar selección
  selProduct.addEventListener('change', () => {
    loadPackSizesForSelected();
    syncPriceFromProduct();
  });

  // Cargar al inicio
  loadProductsInSaleSelect();


  // ---------------------------------------------------------
  // 2. REGISTRAR VENTA (POST)
  // ---------------------------------------------------------
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const p = getSelectedProduct();
    if (!p) { alert('Seleccione un producto'); return; }

    // Calcular cantidad total a vender
    const modeBtn = document.querySelector('#saleMode .active');
    const mode = modeBtn.dataset.mode;
    let unitsSold = 0;

    if (mode === 'unit') {
      unitsSold = Math.max(1, Number(document.getElementById('saleUnits').value || 0));
    } else if (mode === 'pack') {
      const size = Number(document.getElementById('salePackSize').value || 0);
      const qty  = Math.max(1, Number(document.getElementById('salePackQty').value || 0));
      if (!size) { alert('Seleccione tamaño de paca'); return; }
      unitsSold = size * qty;
    } else { // Mixto
      const size = Number(document.getElementById('salePackSizeMixed').value || 0);
      const qty  = Math.max(0, Number(document.getElementById('salePackQtyMixed').value || 0));
      const u    = Math.max(0, Number(document.getElementById('saleUnitsMixed').value || 0));
      if (!size && qty > 0) { alert('Seleccione tamaño de paca'); return; }
      unitsSold = (size * qty) + u;
    }

    if (unitsSold <= 0) { alert('La cantidad debe ser mayor a 0'); return; }

    // Preparar DTO
    const usuarioSesion = JSON.parse(localStorage.getItem('usuarioSesion'));
    const ventaDTO = {
        productoId: p.id,
        usuarioId: usuarioSesion ? usuarioSesion.id : 1, // Fallback a ID 1 si no hay sesión
        cantidad: unitsSold,
        clienteId: null // Opcional, si implementas clientes después
        // El precio y totales los calcula el Backend para seguridad, 
        // pero si quieres permitir precio personalizado, agrégalo al DTO en Java.
    };

    try {
        const res = await fetch('/api/ventas', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(ventaDTO)
        });

        if (res.ok) {
            alert('Venta registrada con éxito');
            form.reset();
            // Cerrar modal
            document.getElementById('saleModal').style.display = 'none';
            // Recargar datos
            loadProductsInSaleSelect(); // Para actualizar stock visual
            renderSalesToday();
            // Actualizar inventario global si está visible
            if(window.renderInventory) window.renderInventory();
        } else {
            const msg = await res.text();
            alert('Error: ' + msg); // Aquí saldrá "Stock insuficiente" si aplica
        }
    } catch (err) {
        console.error(err);
        alert('Error de conexión');
    }
  });


  // ---------------------------------------------------------
  // 3. RENDER HISTORIAL (GET)
  // ---------------------------------------------------------
  window.renderSales = function() { renderSalesToday(); };

  async function renderSalesToday() {
    // Obtener fecha de hoy para filtrar visualmente o pedir al backend
    // Para simplificar, pedimos TODO y filtramos en JS o pedimos con fechas de hoy al backend
    const hoy = new Date().toISOString().split('T')[0];
    await renderSalesHistory({ desde: hoy, hasta: hoy }, 'salesTodayBody');
  }

  // Función genérica para llenar tablas de ventas
  async function renderSalesHistory(filtro = null, tableId = 'salesHistoryBody') {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8">Cargando...</td></tr>';

    let url = '/api/ventas';
    if (filtro) {
        url += `?desde=${filtro.desde}&hasta=${filtro.hasta}`;
    }

    try {
        const res = await fetch(url);
        const ventas = await res.json();
        tbody.innerHTML = '';

        let sumTotal = 0, sumCost = 0, sumProfit = 0;

        ventas.forEach(s => {
            sumTotal += s.totalVenta;
            sumCost += s.costoTotal || 0;
            sumProfit += s.ganancia || 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(s.fecha).toLocaleString()}</td>
                <td>${s.producto.nombre}</td>
                <td>${s.cantidad} u</td>
                <td>${s.cantidad}</td>
                <td>${money(s.totalVenta)}</td>
                <td>${money(s.costoTotal)}</td>
                <td>${money(s.ganancia)}</td>
                <td>Publico General</td>
            `;
            tbody.appendChild(tr);
        });

        // Actualizar tarjetas de resumen si estamos en la vista de hoy
        if (tableId === 'salesTodayBody') {
            document.getElementById('sumVentasDia').textContent = money(sumTotal);
            document.getElementById('sumCostoDia').textContent = money(sumCost);
            document.getElementById('sumGananciaDia').textContent = money(sumProfit);
        } else {
            // Resumen historial
            document.getElementById('t_total').textContent = money(sumTotal);
            document.getElementById('t_costo').textContent = money(sumCost);
            document.getElementById('t_ganancia').textContent = money(sumProfit);
        }

    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="8" style="color:red">Error cargando ventas</td></tr>';
    }
  }

  // Filtro manual por fechas
  document.getElementById('btnFiltrarVentas')?.addEventListener('click', () => {
    const desde = document.getElementById('f_desde').value;
    const hasta = document.getElementById('f_hasta').value;
    if (!desde || !hasta) { alert('Seleccione fechas'); return; }
    renderSalesHistory({ desde, hasta }, 'salesHistoryBody');
  });

  // Helpers de UI (Tabs, Modales) - Se mantienen igual que tu original
  // ... (Pega aquí la lógica de tabs y modales que ya tenías en tu archivo original si se borró) ...
  // Para ahorrar espacio, asumo que mantienes la lógica de UI (abrir/cerrar modal) del archivo anterior.
  // Si la necesitas, avísame.
  
  // Helpers
  function money(val) {
      return '$' + (val || 0).toLocaleString('es-CO');
  }
  
  // Inicializar
  renderSalesToday();
});