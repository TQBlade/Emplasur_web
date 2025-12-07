// ================== VENTAS (CORREGIDO: ASOCIACIÓN DE CLIENTE NUEVO) ==================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('saleForm');
  const selProduct = document.getElementById('saleProduct');
  
  const btnTabForm = document.getElementById('btnTabSaleForm');
  const btnTabHist = document.getElementById('btnTabSaleHistory');
  const secForm    = document.getElementById('saleFormSection');
  const secHist    = document.getElementById('saleHistorySection');
  const saleModal  = document.getElementById('saleModal');

  let productsCache = [];

  if (!form) return;

  // --- UI ---
  function showSectionHoy() {
    if (secForm && secHist) {
      secForm.style.display = 'block';
      secHist.style.display = 'none';
      renderSalesToday();
    }
  }

  function showSectionHist() {
    if (secForm && secHist) {
      secForm.style.display = 'none';
      secHist.style.display = 'block';
      renderSalesHistory();
    }
  }

  function openSaleModal() {
    loadProductsInSaleSelect();
    form.reset();
    resetClientSection(); 
    if (saleModal) saleModal.style.display = 'flex';
  }

  function closeSaleModal() {
    if (saleModal) saleModal.style.display = 'none';
    form.reset();
    resetClientSection();
  }

  if (btnTabForm) btnTabForm.addEventListener('click', openSaleModal);
  if (btnTabHist) btnTabHist.addEventListener('click', showSectionHist);

  document.querySelectorAll('[data-close="saleModal"]').forEach(btn => {
    btn.addEventListener('click', closeSaleModal);
  });

  const saleModeButtons = document.getElementById('saleMode');
  const boxUnit  = document.getElementById('saleUnitsBox');
  const boxPack  = document.getElementById('salePacksBox');
  const boxMixed = document.getElementById('saleMixedBox');

  if (saleModeButtons) {
    saleModeButtons.addEventListener('click', e => {
      const btn = e.target.closest('button'); if (!btn) return;
      saleModeButtons.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.dataset.mode;
      if(boxUnit) boxUnit.style.display  = mode === 'unit'  ? 'block' : 'none';
      if(boxPack) boxPack.style.display  = mode === 'pack'  ? 'block' : 'none';
      if(boxMixed) boxMixed.style.display = mode === 'mixed' ? 'block' : 'none';
    });
  }

  // --- CLIENTES ---
  const inputDoc = document.getElementById('saleClientDoc');
  const infoBox = document.getElementById('clientInfoBox');
  const foundMsg = document.getElementById('foundClientMsg');
  const newClientForm = document.getElementById('newClientForm');
  const selectedClientId = document.getElementById('selectedClientId'); 

  let resultsList = document.getElementById('clientSearchResults');
  if (!resultsList && inputDoc) {
      resultsList = document.createElement('div');
      resultsList.id = 'clientSearchResults';
      resultsList.style.cssText = "position:absolute; background:white; border:1px solid #ccc; width:100%; max-height:150px; overflow-y:auto; z-index:1000; display:none; border-radius: 0 0 5px 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); color: #333;"; 
      inputDoc.parentNode.style.position = 'relative'; 
      inputDoc.parentNode.appendChild(resultsList);
  }

  function resetClientSection() {
      if(inputDoc) inputDoc.value = '';
      if(selectedClientId) selectedClientId.value = '';
      if(infoBox) infoBox.style.display = 'none';
      if(foundMsg) foundMsg.style.display = 'none';
      if(newClientForm) newClientForm.style.display = 'none';
      if(resultsList) resultsList.style.display = 'none';
  }

  let debounceTimer;
  if(inputDoc) {
      inputDoc.addEventListener('input', (e) => {
          clearTimeout(debounceTimer);
          const term = e.target.value.trim();
          if(term.length === 0) { resetClientSection(); return; }
          debounceTimer = setTimeout(() => searchClients(term), 300);
      });
  }

  async function searchClients(term) {
      try {
          const res = await fetch(`/api/clientes/buscar/${term}`);
          
          if (res.ok) {
            // CAPTURAMOS LA RESPUESTA COMPLETA DEL BACKEND (Trae el objeto Venta creado)
            const ventaGuardada = await res.json(); 

            // alert('¡Venta Exitosa!'); // Puedes quitar esto si el confirm es suficiente
            
            // PREGUNTAR SI IMPRIMIR
            if(confirm('Venta registrada exitosamente.\n¿Desea generar el comprobante PDF?')) {
                if(window.printSaleReceipt) {
                    window.printSaleReceipt(ventaGuardada);
                } else {
                    console.error("Falta cargar pdfService.js");
                }
            }

            closeSaleModal();
            renderSalesToday();
            if(window.renderInventory) window.renderInventory();
            if(window.refreshAll) window.refreshAll(); 
        }
      } catch(err) { console.error(err); }
  }

  function mostrarFormularioNuevo() {
      selectedClientId.value = ''; 
      infoBox.style.display = 'block';
      foundMsg.style.display = 'none';
      newClientForm.style.display = 'block';
      
      document.getElementById('nc_name1').value = '';
      document.getElementById('nc_last1').value = '';
  }

  function showSearchResults(clientes) {
      resultsList.innerHTML = '';
      resultsList.style.display = 'block';
      infoBox.style.display = 'none'; 

      clientes.forEach(c => {
          const div = document.createElement('div');
          div.style.padding = '10px';
          div.style.cursor = 'pointer';
          div.style.borderBottom = '1px solid #eee';
          div.onmouseover = () => div.style.backgroundColor = '#f0f4f8';
          div.onmouseout = () => div.style.backgroundColor = 'white';
          
          const nombre = `${c.primerNombre} ${c.primerApellido}`;
          div.innerHTML = `<strong>${c.documento}</strong> - ${nombre}`;
          div.onclick = () => selectClient(c);
          resultsList.appendChild(div);
      });
  }

  function selectClient(c) {
      inputDoc.value = c.documento;
      selectedClientId.value = c.id; 
      if(resultsList) resultsList.style.display = 'none';
      infoBox.style.display = 'block';
      const nombre = `${c.primerNombre} ${c.primerApellido}`;
      document.getElementById('foundClientName').textContent = nombre;
      foundMsg.style.display = 'block';
      newClientForm.style.display = 'none';
  }

  const btnSearch = document.getElementById('btnSearchClient');
  if(btnSearch) {
      btnSearch.addEventListener('click', () => {
          const doc = inputDoc.value.trim();
          if(doc) searchClients(doc);
      });
  }

  // --- PRODUCTOS ---
  async function loadProductsInSaleSelect() {
    try {
      const res = await fetch('/api/productos');
      if(!res.ok) throw new Error("Error API");
      productsCache = await res.json();
      selProduct.innerHTML = '<option value="">-- Seleccione --</option>';
      productsCache.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id; 
        opt.textContent = `${p.codigo} — ${p.nombre} (Stock: ${p.totalUnidades})`;
        selProduct.appendChild(opt);
      });
    } catch (err) { console.error(err); }
  }

  function getSelectedProduct() {
    return productsCache.find(p => p.id == selProduct.value);
  }

  function loadPackSizesForSelected() {
    const p = getSelectedProduct();
    const s1 = document.getElementById('salePackSize');
    const s2 = document.getElementById('salePackSizeMixed');
    const html = (p && p.lotes.length) 
        ? [...new Set(p.lotes.map(l => l.tamanoPaca))].map(s => `<option value="${s}">${s}</option>`).join('')
        : '<option value="">Sin pacas</option>';
    if(s1) s1.innerHTML = html;
    if(s2) s2.innerHTML = html;
  }

  function syncPrice() {
    const p = getSelectedProduct();
    const input = document.getElementById('salePrice');
    if (p && input) input.value = p.precioUnitario || 0;
  }

  if(selProduct) {
      selProduct.addEventListener('change', () => {
        loadPackSizesForSelected();
        syncPrice();
      });
  }

  // =========================================================
  // 4. ENVIAR VENTA (POST) - ¡CORREGIDO!
  // =========================================================
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const p = getSelectedProduct();
    if (!p) { alert('Seleccione un producto'); return; }

    const mode = document.querySelector('#saleMode .active')?.dataset.mode || 'unit';
    let units = 0;

    if (mode === 'unit') {
      units = Number(document.getElementById('saleUnits').value);
    } else if (mode === 'pack') {
      const s = Number(document.getElementById('salePackSize').value);
      const q = Number(document.getElementById('salePackQty').value);
      units = s * q;
    } else { 
      const s = Number(document.getElementById('salePackSizeMixed').value);
      const q = Number(document.getElementById('salePackQtyMixed').value);
      const u = Number(document.getElementById('saleUnitsMixed').value);
      units = (s * q) + u;
    }

    if (units <= 0) { alert('Cantidad inválida'); return; }

    // --- MANEJO DE CLIENTE ---
    let idCliente = selectedClientId.value;

    // Si es nuevo (formulario visible y sin ID)
    if (!idCliente && newClientForm.style.display === 'block') {
        const doc = inputDoc.value.trim();
        const n1 = document.getElementById('nc_name1').value.trim();
        const l1 = document.getElementById('nc_last1').value.trim();
        
        if(!doc || !n1 || !l1) { alert('Datos incompletos para nuevo cliente'); return; }

        try {
            // 1. CREAR CLIENTE
            const resCli = await fetch('/api/clientes', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    documento: doc,
                    primerNombre: n1,
                    segundoNombre: document.getElementById('nc_name2').value,
                    primerApellido: l1,
                    segundoApellido: document.getElementById('nc_last2').value,
                    telefono: document.getElementById('nc_tel').value,
                    email: document.getElementById('nc_email').value,
                    direccion: "Local"
                })
            });
            if(!resCli.ok) throw new Error(await resCli.text());
            
            // 2. RECIBIR EL NUEVO CLIENTE (INCLUYENDO SU ID)
            const nuevo = await resCli.json();
            idCliente = nuevo.id; // <--- AQUÍ CAPTURAMOS EL ID DEL NUEVO
            
            console.log("Cliente nuevo creado con ID:", idCliente); // Debug
        } catch(err) { 
            alert('Error creando cliente: ' + err.message); 
            return; // Detener venta si falló el cliente
        }
    }

    // Enviar Venta
    const usuario = JSON.parse(localStorage.getItem('usuarioSesion'));
    try {
        const res = await fetch('/api/ventas', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                productoId: p.id,
                usuarioId: usuario ? usuario.id : 1,
                cantidad: units,
                clienteId: idCliente ? Number(idCliente) : null // ENVIAMOS EL ID CONFIRMADO
            })
        });

        if (res.ok) {
            alert('¡Venta Exitosa!');
            closeSaleModal();
            renderSalesToday();
            if(window.renderInventory) window.renderInventory();
            if(window.refreshAll) window.refreshAll(); 
        } else {
            alert('Error: ' + await res.text());
        }
    } catch (err) { alert('Error de conexión'); }
  });

  // --- RENDERS ---
  window.renderSales = () => renderSalesToday();

  async function renderSalesToday() {
    const now = new Date();
    // Construir fecha local YYYY-MM-DD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hoy = `${year}-${month}-${day}`;
    
    // Llamar al backend con el filtro de hoy
    await renderSalesHistory({ desde: hoy, hasta: hoy }, 'salesTodayBody');
  }

  async function renderSalesHistory(filtro = null, tableId = 'salesHistoryBody') {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    
    let url = '/api/ventas';
    if(filtro) url += `?desde=${filtro.desde}&hasta=${filtro.hasta}`;

    try {
        const res = await fetch(url);
        const ventas = await res.json();
        tbody.innerHTML = '';

        if(!ventas.length) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">Sin datos</td></tr>';
            return;
        }

        let tVenta=0, tCosto=0, tGanancia=0;

        ventas.forEach(v => {
            tVenta += v.totalVenta;
            tCosto += v.costoTotal || 0;
            tGanancia += v.ganancia || 0;
            
            let cliName = 'General';
            if (v.cliente) {
                cliName = `${v.cliente.primerNombre} ${v.cliente.primerApellido}`;
            } else if (v.clienteId) { 
                cliName = 'ID: ' + v.clienteId;
            }
            
            tbody.innerHTML += `
                <tr>
                    <td>${new Date(v.fecha).toLocaleString()}</td>
                    <td>${v.producto?.nombre || 'Eliminado'}</td>
                    <td>${v.cantidad} un.</td>
                    <td>${v.cantidad}</td>
                    <td>${money(v.totalVenta)}</td>
                    <td>${money(v.costoTotal)}</td>
                    <td>${money(v.ganancia)}</td>
                    <td>${cliName}</td>
                </tr>
            `;
        });

        if(tableId === 'salesTodayBody') {
             updateSum('sumVentasDia', tVenta);
             updateSum('sumCostoDia', tCosto);
             updateSum('sumGananciaDia', tGanancia);
        } else {
             updateSum('t_total', tVenta);
             updateSum('t_costo', tCosto);
             updateSum('t_ganancia', tGanancia);
        }

    } catch(e) { console.error(e); }
  }

  function updateSum(id, val) {
      const el = document.getElementById(id);
      if(el) el.textContent = money(val);
  }

  function money(v) { 
      return '$' + (v||0).toLocaleString('es-CO', {maximumFractionDigits:0}); 
  }

  const btnFiltrar = document.getElementById('btnFiltrarVentas');
  if(btnFiltrar) {
      btnFiltrar.addEventListener('click', () => {
        const desde = document.getElementById('f_desde').value;
        const hasta = document.getElementById('f_hasta').value;
        if (!desde || !hasta) { alert('Seleccione fechas'); return; }
        renderSalesHistory({ desde, hasta }, 'salesHistoryBody');
      });
  }

  renderSalesToday();
});