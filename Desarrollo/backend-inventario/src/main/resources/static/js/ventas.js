// ================== VENTAS (VERSIÓN FINAL CARRITO) ==================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('saleForm');
  const selProduct = document.getElementById('saleProduct');
  const btnFinalize = document.getElementById('btnFinalizeSale');
  
  // UI Elements
  const btnTabForm = document.getElementById('btnTabSaleForm');
  const btnTabHist = document.getElementById('btnTabSaleHistory');
  const secForm    = document.getElementById('saleFormSection');
  const secHist    = document.getElementById('saleHistorySection');
  const saleModal  = document.getElementById('saleModal');
  
  // Tabla Carrito
  const cartBody = document.getElementById('cartBody');
  const cartTotalDisplay = document.getElementById('cartTotalDisplay');

  // Estado
  let productsCache = [];
  let currentClientId = null; 
  let shoppingCart = []; // Carrito
  window.currentSalesList = []; // Historial para PDF

  if (!form) return;

  // --- UI FUNCTIONS ---
  function showSectionHoy() {
    secForm.style.display = 'block'; secHist.style.display = 'none';
    renderSalesToday();
  }
  function showSectionHist() {
    secForm.style.display = 'none'; secHist.style.display = 'block';
    renderSalesHistory();
  }

  function openSaleModal() {
    loadProductsInSaleSelect();
    form.reset();
    resetClientSection();
    shoppingCart = [];
    renderCart();
    if (saleModal) saleModal.style.display = 'flex';
  }

  function closeSaleModal() {
    if (saleModal) saleModal.style.display = 'none';
  }

  if(btnTabForm) btnTabForm.addEventListener('click', openSaleModal);
  if(btnTabHist) btnTabHist.addEventListener('click', showSectionHist);
  document.querySelectorAll('[data-close="saleModal"]').forEach(b => b.addEventListener('click', closeSaleModal));

  // --- TOGGLE MODE (CORREGIDO Y SEGURO) ---
  const saleModeButtons = document.getElementById('saleMode');
  if (saleModeButtons) {
    saleModeButtons.addEventListener('click', e => {
      const btn = e.target.closest('button'); if (!btn) return;
      
      // Actualizar visualmente los botones
      saleModeButtons.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.dataset.mode;
      
      // Mostrar/Ocultar cajas de forma segura
      const uBox = document.getElementById('saleUnitsBox');
      const pBox = document.getElementById('salePacksBox');
      const mBox = document.getElementById('saleMixedBox');

      if (uBox) uBox.style.display = (mode === 'unit') ? 'block' : 'none';
      if (pBox) pBox.style.display = (mode === 'pack') ? 'block' : 'none';
      if (mBox) mBox.style.display = (mode === 'mixed') ? 'block' : 'none';
    });
  }

  // =========================================================
  // 1. GESTIÓN DE CLIENTES
  // =========================================================
  const inputDoc = document.getElementById('saleClientDoc');
  const btnSearch = document.getElementById('btnSearchClient'); 
  const infoBox = document.getElementById('clientInfoBox');
  const foundMsg = document.getElementById('foundClientMsg');
  const newClientForm = document.getElementById('newClientForm');
  
  let resultsList = document.getElementById('clientSearchResults');
  if (!resultsList && inputDoc) {
      resultsList = document.createElement('div');
      resultsList.id = 'clientSearchResults';
      resultsList.style.cssText = "position:absolute; background:white; border:1px solid #ccc; width:100%; max-height:150px; overflow-y:auto; z-index:1000; display:none; color:#333;"; 
      inputDoc.parentNode.style.position = 'relative'; 
      inputDoc.parentNode.appendChild(resultsList);
  }

  function resetClientSection() {
      if(inputDoc) inputDoc.value = '';
      currentClientId = null;
      if(infoBox) infoBox.style.display = 'none';
      if(resultsList) resultsList.style.display = 'none';
  }

  let debounceTimer;
  if(inputDoc) {
      inputDoc.addEventListener('input', (e) => {
          clearTimeout(debounceTimer);
          const term = e.target.value.trim();
          if(!term) { resetClientSection(); return; }
          debounceTimer = setTimeout(() => searchClients(term), 300);
      });
      inputDoc.addEventListener('keydown', (e) => { 
          if(e.key==='Enter') { e.preventDefault(); searchClients(e.target.value.trim()); } 
      });
  }

  if(btnSearch) {
      btnSearch.addEventListener('click', (e) => {
          e.preventDefault();
          const doc = inputDoc.value.trim();
          if(!doc) { alert('Ingrese documento'); return; }
          searchClients(doc);
      });
  }

  async function searchClients(term) {
      try {
          const res = await fetch(`/api/clientes/buscar/${term}`);
          if(res.ok) {
              const clientes = await res.json();
              if(clientes.length) showSearchResults(clientes);
              else showNewClientForm();
          } else showNewClientForm();
      } catch(e){}
  }

  function showSearchResults(clientes) {
      resultsList.innerHTML = '';
      resultsList.style.display = 'block';
      infoBox.style.display = 'none';
      clientes.forEach(c => {
          const d = document.createElement('div');
          d.style.padding = '8px'; d.style.cursor='pointer'; d.style.borderBottom='1px solid #eee';
          d.onmouseover=()=>d.style.background='#f0f0f0'; d.onmouseout=()=>d.style.background='white';
          d.innerHTML = `<strong>${c.documento}</strong> - ${c.primerNombre} ${c.primerApellido}`;
          d.onclick = () => selectClient(c);
          resultsList.appendChild(d);
      });
  }

  function selectClient(c) {
      inputDoc.value = c.documento;
      currentClientId = c.id;
      resultsList.style.display = 'none';
      infoBox.style.display = 'block';
      newClientForm.style.display = 'none';
      foundMsg.textContent = `${c.primerNombre} ${c.primerApellido}`;
      foundMsg.style.display = 'block';
  }

  function showNewClientForm() {
      resultsList.style.display = 'none';
      currentClientId = null;
      infoBox.style.display = 'block';
      foundMsg.style.display = 'none';
      newClientForm.style.display = 'block';
  }

  // =========================================================
  // 2. PRODUCTOS Y AGREGAR AL CARRITO
  // =========================================================
  async function loadProductsInSaleSelect() {
    try {
      const res = await fetch('/api/productos');
      productsCache = await res.json();
      selProduct.innerHTML = '<option value="">-- Seleccione --</option>';
      productsCache.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id; 
        opt.textContent = `${p.codigo} — ${p.nombre}`;
        selProduct.appendChild(opt);
      });
    } catch (e){}
  }

  function getSelectedProduct() { return productsCache.find(p => p.id == selProduct.value); }

  selProduct.addEventListener('change', () => {
      const p = getSelectedProduct();
      const s1 = document.getElementById('salePackSize');
      const s2 = document.getElementById('salePackSizeMixed');
      const html = (p?.lotes?.length) 
          ? [...new Set(p.lotes.map(l => l.tamanoPaca))].map(s => `<option value="${s}">${s}</option>`).join('')
          : '<option value="">-</option>';
      if(s1) s1.innerHTML = html;
      if(s2) s2.innerHTML = html;
      
      if(p) document.getElementById('salePrice').value = p.precioUnitario;
  });

  // --- ACCIÓN: AGREGAR AL CARRITO ---
  form.addEventListener('submit', e => {
      e.preventDefault(); 
      const p = getSelectedProduct();
      if(!p) { alert('Seleccione producto'); return; }

      const modeBtn = document.querySelector('#saleMode .active');
      const mode = modeBtn ? modeBtn.dataset.mode : 'unit';
      
      let qty = 0;
      if(mode === 'unit') qty = Number(document.getElementById('saleUnits').value);
      else if(mode === 'pack') qty = Number(document.getElementById('salePackSize').value) * Number(document.getElementById('salePackQty').value);
      else qty = (Number(document.getElementById('salePackSizeMixed').value) * Number(document.getElementById('salePackQtyMixed').value)) + Number(document.getElementById('saleUnitsMixed').value);

      if(qty <= 0) { alert('Cantidad inválida'); return; }

      const price = Number(document.getElementById('salePrice').value);

      shoppingCart.push({
          tempId: Date.now(),
          productoId: p.id,
          nombre: p.nombre,
          cantidad: qty,
          precioVenta: price,
          subtotal: qty * price
      });

      renderCart();
      document.getElementById('saleUnits').value = 1;
  });

  function renderCart() {
      cartBody.innerHTML = '';
      let total = 0;
      shoppingCart.forEach((item, index) => {
          total += item.subtotal;
          cartBody.innerHTML += `
            <tr>
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>${money(item.subtotal)}</td>
                <td><button type="button" onclick="window.removeItemFromCart(${index})" style="color:red;border:none;cursor:pointer"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
          `;
      });
      cartTotalDisplay.textContent = money(total);
  }

  window.removeItemFromCart = function(index) {
      shoppingCart.splice(index, 1);
      renderCart();
  }

  // =========================================================
  // 3. FINALIZAR VENTA (BATCH)
  // =========================================================
  
// =========================================================
  // 3. FINALIZAR VENTA (BATCH) - CORREGIDO
  // =========================================================
  
  btnFinalize.addEventListener('click', async () => {
      if(shoppingCart.length === 0) { alert("El carrito está vacío"); return; }

      let idCliente = currentClientId;
      const docVal = inputDoc.value.trim();
      
      // Capturamos los valores del formulario de nuevo cliente
      const n1 = document.getElementById('nc_name1').value.trim();
      const l1 = document.getElementById('nc_last1').value.trim();

      // LÓGICA CORREGIDA: ¿Es un cliente nuevo?
      // Si NO tengo un ID seleccionado PERO tengo un Documento y un Nombre escrito...
      if (!idCliente && docVal && n1) {
          
          if(!l1) { alert('Falta el Apellido del nuevo cliente'); return; }

          try {
             // 1. CREAR EL CLIENTE PRIMERO
             const resCli = await fetch('/api/clientes', {
                 method:'POST', 
                 headers:{'Content-Type':'application/json'},
                 body: JSON.stringify({
                     documento: docVal, 
                     primerNombre: n1,
                     primerApellido: l1,
                     segundoNombre: document.getElementById('nc_name2').value.trim(),
                     segundoApellido: document.getElementById('nc_last2').value.trim(),
                     telefono: document.getElementById('nc_tel').value.trim(),
                     email: document.getElementById('nc_email').value.trim(),
                     direccion: "Local"
                 })
             });

             if(resCli.ok) { 
                 const nuevoCliente = await resCli.json(); 
                 idCliente = nuevoCliente.id; // ¡CAPTURA EL ID DEL NUEVO!
                 console.log("Cliente creado con ID:", idCliente);
             } else { 
                 const errorTxt = await resCli.text();
                 alert('Error creando cliente: ' + errorTxt); 
                 return; // Detener venta
             }
          } catch(e) { 
              console.error(e); 
              alert('Error de conexión al crear cliente'); 
              return; 
          }
      } 
      
      // VALIDACIÓN FINAL: Si después de intentar crear, seguimos sin ID...
      if (!idCliente) {
          alert('Debes seleccionar un cliente existente o llenar los datos del nuevo (Documento, Nombre, Apellido).');
          return;
      }

      // Preparar LOTE de ventas
      const usuario = JSON.parse(localStorage.getItem('usuarioSesion'));
      const batchList = shoppingCart.map(item => ({
          productoId: item.productoId,
          usuarioId: usuario ? usuario.id : 1,
          cantidad: item.cantidad,
          clienteId: Number(idCliente), // Enviamos el ID seguro
          precioVenta: item.precioVenta
      }));

          // ENVIAR LOTE
          try {
              const res = await fetch('/api/ventas/batch', {
                  method: 'POST',
                  headers: {'Content-Type':'application/json'},
                  body: JSON.stringify(batchList)
              });
    
              if(res.ok) {
                  const ventasGuardadas = await res.json();
                  
                  alert('¡Venta registrada con éxito!');
                  
                  // --- INICIO BLOQUE PDF SEGURO ---
                  try {
                      if(window.printSaleReceipt) {
                          // Construimos el objeto seguro para el PDF
                          const foundClientNameEl = document.getElementById('foundClientName');
                          const nombreClienteVisual = (foundClientNameEl ? foundClientNameEl.textContent : '') 
                                                      || document.getElementById('nc_name1').value 
                                                      || "Cliente";
                          
                          const datosPDF = {
                              fecha: new Date().toISOString(),
                              cliente: { 
                                  primerNombre: nombreClienteVisual,
                                  primerApellido: "" 
                              },
                              items: shoppingCart, // Enviamos el carrito
                              totalVenta: shoppingCart.reduce((sum, i) => sum + i.subtotal, 0)
                          };
    
                          // Generar
                          window.printSaleReceipt(datosPDF);
                      }
                  } catch (pdfError) {
                      console.error("Error generando PDF:", pdfError);
                      alert("La venta se guardó, pero hubo un error generando el recibo PDF.");
                  }
                  // --- FIN BLOQUE PDF SEGURO ---
    
                  closeSaleModal();
                  renderSalesToday();
                  if(window.renderInventory) window.renderInventory();
                  if(window.refreshAll) window.refreshAll();
              } else {
                  alert('Error del servidor: ' + await res.text());
              }
          } catch (e) {
              console.error('Error enviando lote de ventas:', e);
              alert('Ocurrió un error al procesar la venta. Intente nuevamente.');
          }
      });

  // --- RENDERS ---
  window.renderSales = () => renderSalesToday();

  async function renderSalesToday() {
      const now = new Date();
      const hoy = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      await renderSalesHistory({desde:hoy, hasta:hoy}, 'salesTodayBody');
  }

  async function renderSalesHistory(filtro, tableId) {
      const tbody = document.getElementById(tableId);
      if(!tbody) return;
      let url = `/api/ventas?desde=${filtro.desde}&hasta=${filtro.hasta}`;
      try {
          const res = await fetch(url);
          const ventas = await res.json();
          window.currentSalesList = ventas;
          tbody.innerHTML = '';
          let t=0, c=0, g=0;
          ventas.forEach(v => {
              t+=v.totalVenta; c+=v.costoTotal; g+=v.ganancia;
              let cli = v.cliente ? `${v.cliente.primerNombre} ${v.cliente.primerApellido}` : 'General';
              tbody.innerHTML += `<tr><td>${new Date(v.fecha).toLocaleString()}</td><td>${v.producto.nombre}</td><td>${v.cantidad}</td><td>${v.cantidad}</td><td>${money(v.totalVenta)}</td><td>${money(v.costoTotal)}</td><td>${money(v.ganancia)}</td><td>${cli}</td></tr>`;
          });
          updateSum(tableId, t, c, g);
      } catch(e){}
  }
  
  function updateSum(tid, v, c, g) {
      const idV = tid==='salesTodayBody' ? 'sumVentasDia' : 't_total';
      const idC = tid==='salesTodayBody' ? 'sumCostoDia' : 't_costo';
      const idG = tid==='salesTodayBody' ? 'sumGananciaDia' : 't_ganancia';
      
      const elV = document.getElementById(idV); if(elV) elV.textContent=money(v);
      const elC = document.getElementById(idC); if(elC) elC.textContent=money(c);
      const elG = document.getElementById(idG); if(elG) { elG.textContent=money(g); elG.style.color = g<0?'#ff4d4f':'#2ecc71'; }
  }

  function money(v) { return '$'+(v||0).toLocaleString('es-CO',{maximumFractionDigits:0}); }

  const btnFiltrar = document.getElementById('btnFiltrarVentas');
  if(btnFiltrar) {
      btnFiltrar.addEventListener('click', () => {
          const d = document.getElementById('f_desde').value;
          const h = document.getElementById('f_hasta').value;
          if(!d || !h) { alert('Fechas requeridas'); return; }
          renderSalesHistory({desde:d, hasta:h}, 'salesHistoryBody');
      });
  }
  
  const btnPdf = document.getElementById('btnPDFVentas');
  if (btnPdf) {
      btnPdf.addEventListener('click', () => {
          if (!window.currentSalesList || window.currentSalesList.length === 0) {
              alert("No hay datos."); return;
          }
          const d = document.getElementById('f_desde').value;
          const h = document.getElementById('f_hasta').value;
          const rango = (d && h) ? `${d} a ${h}` : "Histórico Completo";
          if (window.printSalesReport) window.printSalesReport(window.currentSalesList, rango);
      });
  }

  renderSalesToday();
});