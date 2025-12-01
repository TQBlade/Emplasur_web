// ================== VENTAS (CORREGIDO: MANEJO DE LISTAS EN BÚSQUEDA) ==================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('saleForm');
  const selProduct = document.getElementById('saleProduct');
  
  // Elementos de UI
  const btnTabForm = document.getElementById('btnTabSaleForm');
  const btnTabHist = document.getElementById('btnTabSaleHistory');
  const secForm    = document.getElementById('saleFormSection');
  const secHist    = document.getElementById('saleHistorySection');
  const saleModal  = document.getElementById('saleModal');

  let productsCache = [];

  if (!form) return;

  // --- LÓGICA VISUAL ---
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

  // Toggle Modo Venta
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

  // =========================================================
  // 2. GESTIÓN DE CLIENTES (CORRECCIÓN AQUÍ)
  // =========================================================
  const btnSearchClient = document.getElementById('btnSearchClient');
  const inputDoc = document.getElementById('saleClientDoc');
  const infoBox = document.getElementById('clientInfoBox');
  const foundMsg = document.getElementById('foundClientMsg');
  const newClientForm = document.getElementById('newClientForm');
  const selectedClientId = document.getElementById('selectedClientId'); 

  let resultsList = document.getElementById('clientSearchResults');
  if (!resultsList && inputDoc) {
      resultsList = document.createElement('div');
      resultsList.id = 'clientSearchResults';
      resultsList.style.cssText = "position:absolute; background:white; border:1px solid #ccc; width:100%; max-height:150px; overflow-y:auto; z-index:1000; display:none; border-radius: 0 0 5px 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); color: #333;"; // Agregué color negro para asegurar visibilidad
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

  // --- BOTÓN DE LUPA (CORREGIDO PARA LEER LISTAS) ---
  if(btnSearchClient) {
      btnSearchClient.addEventListener('click', async () => {
          const doc = inputDoc.value.trim();
          if(!doc) { alert('Ingrese un documento'); return; }

          try {
              const res = await fetch(`/api/clientes/buscar/${doc}`);
              infoBox.style.display = 'block';
              
              if(res.ok) {
                  // CORRECCIÓN: El backend devuelve una LISTA (Array), no un objeto único
                  const listaClientes = await res.json();
                  
                  if (listaClientes.length > 0) {
                      // Tomamos el primer resultado de la lista
                      const c = listaClientes[0];
                      selectClient(c); // Reusamos la función de seleccionar
                  } else {
                      // Lista vacía (caso raro si res.ok, pero posible)
                      mostrarFormularioNuevo();
                  }
              } else {
                  // 404 No encontrado
                  mostrarFormularioNuevo();
              }
          } catch(err) { console.error(err); }
      });
  }

  function mostrarFormularioNuevo() {
      if(resultsList) resultsList.style.display = 'none';
      selectedClientId.value = ''; 
      infoBox.style.display = 'block';
      foundMsg.style.display = 'none';
      newClientForm.style.display = 'block';
      
      // Limpiar campos
      document.getElementById('nc_name1').value = '';
      document.getElementById('nc_name2').value = '';
      document.getElementById('nc_last1').value = '';
      document.getElementById('nc_last2').value = '';
      document.getElementById('nc_tel').value = '';
      document.getElementById('nc_email').value = '';
  }

  // --- BÚSQUEDA MIENTRAS ESCRIBES ---
  let debounceTimer;
  if(inputDoc) {
      inputDoc.addEventListener('input', (e) => {
          clearTimeout(debounceTimer);
          const term = e.target.value.trim();
          
          if(term.length === 0) {
              resetClientSection();
              return;
          }
          debounceTimer = setTimeout(() => searchClients(term), 300);
      });
  }

  async function searchClients(term) {
      try {
          const res = await fetch(`/api/clientes/buscar/${term}`);
          if(res.ok) {
              const clientes = await res.json();
              showSearchResults(clientes);
          } else {
              // Si no encuentra nada mientras escribes, no hacemos nada intrusivo aún
              if(resultsList) resultsList.style.display = 'none';
          }
      } catch(err) { console.error(err); }
  }

  function showSearchResults(clientes) {
      resultsList.innerHTML = '';
      resultsList.style.display = 'block';
      infoBox.style.display = 'none'; // Ocultamos el cuadro de "No encontrado" si estábamos ahí

      clientes.forEach(c => {
          const div = document.createElement('div');
          div.style.padding = '10px';
          div.style.cursor = 'pointer';
          div.style.borderBottom = '1px solid #eee';
          
          div.onmouseover = () => div.style.backgroundColor = '#f0f4f8';
          div.onmouseout = () => div.style.backgroundColor = 'white';
          
          // Renderizar info
          div.innerHTML = `<strong>${c.documento}</strong> - ${c.primerNombre} ${c.primerApellido}`;
          
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

  // =========================================================
  // 3. CARGAR PRODUCTOS Y CÁLCULOS
  // =========================================================

  async function loadProductsInSaleSelect() {
    try {
      const res = await fetch('/api/productos');
      if(!res.ok) throw new Error("Error al traer productos");
      
      productsCache = await res.json();
      
      selProduct.innerHTML = '<option value="">-- Seleccione un producto --</option>';
      
      productsCache.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id; 
        opt.textContent = `${p.codigo} — ${p.nombre} (Stock: ${p.totalUnidades})`;
        selProduct.appendChild(opt);
      });
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  }

  function getSelectedProduct() {
    const id = Number(selProduct.value);
    return productsCache.find(p => p.id === id);
  }

  function loadPackSizesForSelected() {
    const p = getSelectedProduct();
    const s1 = document.getElementById('salePackSize');
    const s2 = document.getElementById('salePackSizeMixed');
    
    if (!p || !p.lotes || p.lotes.length === 0) {
      const html = '<option value="">Sin pacas</option>';
      if(s1) s1.innerHTML = html;
      if(s2) s2.innerHTML = html;
      return;
    }

    const sizes = [...new Set(p.lotes.map(l => l.tamanoPaca))];
    const html = sizes.map(s => `<option value="${s}">${s}</option>`).join('');
    
    if(s1) s1.innerHTML = html;
    if(s2) s2.innerHTML = html;
  }

  function syncPriceFromProduct() {
    const p = getSelectedProduct();
    const inputPrice = document.getElementById('salePrice');
    if (p && inputPrice) inputPrice.value = p.precioUnitario || 0;
  }

  if(selProduct) {
      selProduct.addEventListener('change', () => {
        loadPackSizesForSelected();
        syncPriceFromProduct();
      });
  }

  // =========================================================
  // 4. ENVIAR VENTA (POST)
  // =========================================================
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const p = getSelectedProduct();
    if (!p) { alert('Seleccione un producto'); return; }

    // Calcular cantidad
    const modeBtn = document.querySelector('#saleMode .active');
    const mode = modeBtn ? modeBtn.dataset.mode : 'unit';
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

    // GESTIÓN DEL CLIENTE FINAL (Nuevo o Existente)
    let clienteFinalId = selectedClientId.value; 

    // Si NO hay ID seleccionado pero el formulario de NUEVO cliente está visible
    if (!clienteFinalId && newClientForm.style.display === 'block') {
        const doc = inputDoc.value.trim();
        const n1 = document.getElementById('nc_name1').value.trim();
        const l1 = document.getElementById('nc_last1').value.trim();
        
        if(!doc || !n1 || !l1) {
            alert('Para clientes nuevos: Documento, 1er Nombre y 1er Apellido son obligatorios');
            return;
        }

        const newClientData = {
            documento: doc,
            primerNombre: n1,
            segundoNombre: document.getElementById('nc_name2').value.trim(),
            primerApellido: l1,
            segundoApellido: document.getElementById('nc_last2').value.trim(),
            telefono: document.getElementById('nc_tel').value.trim(),
            email: document.getElementById('nc_email').value.trim(),
            direccion: "No especificada" 
        };

        try {
            const resCli = await fetch('/api/clientes', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newClientData)
            });
            
            if(resCli.ok) {
                const savedCli = await resCli.json();
                clienteFinalId = savedCli.id; 
            } else {
                const errMsg = await resCli.text();
                alert('Error al registrar cliente: ' + errMsg);
                return; 
            }
        } catch(err) { 
            console.error(err);
            alert('Error de conexión al crear cliente');
            return; 
        }
    }

    // Preparar DTO de Venta
    const usuarioSesion = JSON.parse(localStorage.getItem('usuarioSesion'));
    const idCliParaEnviar = (clienteFinalId && clienteFinalId !== "") ? Number(clienteFinalId) : null;

    const ventaDTO = {
        productoId: p.id,
        usuarioId: usuarioSesion ? usuarioSesion.id : 1, 
        cantidad: unitsSold,
        clienteId: idCliParaEnviar
    };

    // Enviar Venta
    try {
        const res = await fetch('/api/ventas', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(ventaDTO)
        });

        if (res.ok) {
            alert('Venta registrada con éxito');
            closeSaleModal();
            renderSalesToday();
            if(window.renderInventory) window.renderInventory();
            if(window.refreshAll) window.refreshAll();
        } else {
            const msg = await res.text();
            alert('Error: ' + msg); 
        }
    } catch (err) {
        console.error(err);
        alert('Error de conexión');
    }
  });

  // =========================================================
  // 5. HISTORIAL DE VENTAS
  // =========================================================
  window.renderSales = function() { renderSalesToday(); };

  async function renderSalesToday() {
    const hoy = new Date().toISOString().split('T')[0];
    await renderSalesHistory({ desde: hoy, hasta: hoy }, 'salesTodayBody');
  }

  async function renderSalesHistory(filtro = null, tableId = 'salesHistoryBody') {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center">Cargando...</td></tr>';

    let url = '/api/ventas';
    if (filtro) {
        url += `?desde=${filtro.desde}&hasta=${filtro.hasta}`;
    }

    try {
        const res = await fetch(url);
        if(!res.ok) throw new Error("Error al obtener ventas");
        
        const ventas = await res.json();
        tbody.innerHTML = '';

        if(ventas.length === 0) {
             tbody.innerHTML = '<tr><td colspan="8" style="text-align:center">No hay ventas registradas</td></tr>';
             return;
        }

        let sumTotal = 0, sumCost = 0, sumProfit = 0;

        ventas.forEach(s => {
            sumTotal += s.totalVenta || 0;
            sumCost += s.costoTotal || 0;
            sumProfit += s.ganancia || 0;

            let nombreCliente = 'General';
            if (s.cliente) {
                nombreCliente = `${s.cliente.primerNombre} ${s.cliente.primerApellido}`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(s.fecha).toLocaleString()}</td>
                <td>${s.producto ? s.producto.nombre : 'Producto eliminado'}</td>
                <td>${s.cantidad} un.</td>
                <td>${money(s.totalVenta)}</td>
                <td>${money(s.costoTotal)}</td>
                <td>${money(s.ganancia)}</td>
                <td>${nombreCliente}</td>
            `;
            tbody.appendChild(tr);
        });

        if (tableId === 'salesTodayBody') {
            updateSummary('sumVentasDia', 'sumCostoDia', 'sumGananciaDia', sumTotal, sumCost, sumProfit);
        } else {
            updateSummary('t_total', 't_costo', 't_ganancia', sumTotal, sumCost, sumProfit);
        }

    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="8" style="color:red; text-align:center">Error de conexión</td></tr>';
    }
  }

  function updateSummary(idTotal, idCosto, idGanancia, vTotal, vCosto, vGanancia) {
      const elTotal = document.getElementById(idTotal);
      const elCosto = document.getElementById(idCosto);
      const elGanancia = document.getElementById(idGanancia);
      
      if(elTotal) elTotal.textContent = money(vTotal);
      if(elCosto) elCosto.textContent = money(vCosto);
      if(elGanancia) elGanancia.textContent = money(vGanancia);
  }

  const btnFiltrar = document.getElementById('btnFiltrarVentas');
  if(btnFiltrar) {
      btnFiltrar.addEventListener('click', () => {
        const desde = document.getElementById('f_desde').value;
        const hasta = document.getElementById('f_hasta').value;
        
        if (!desde || !hasta) { alert('Seleccione ambas fechas'); return; }
        renderSalesHistory({ desde, hasta }, 'salesHistoryBody');
      });
  }

  function money(val) {
      return '$' + (val || 0).toLocaleString('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
  }
  
  renderSalesToday();
});