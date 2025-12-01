// ================== PRODUCTOS + MODAL (CONECTADO AL BACKEND) ==================

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('productModal');
  if (!modal) return;

  const form = document.getElementById('newProductForm');
  const packRowsDiv = document.getElementById('packRows');

  // Variable para saber si estamos editando (guardamos el código original)
  let editingCode = null;

  function showModal() { modal.style.display = 'flex'; }
  function closeModal() { modal.style.display = 'none'; }

  // ---------------------------------------------------------
  // ABRIR MODAL (Mapeo de Entidad Java -> Formulario HTML)
  // ---------------------------------------------------------
  window.openProductModal = function (product) {
    editingCode = product ? product.codigo : null; // Nota: Java devuelve 'codigo', no 'code'
    form.reset();
    packRowsDiv.innerHTML = '';
    document.getElementById('total_preview').value = 0;

    if (product) {
      // Mapear campos de la ENTIDAD Java al Formulario
      document.getElementById('p_code').value  = product.codigo;
      document.getElementById('p_name').value  = product.nombre;
      document.getElementById('p_cat').value   = product.categoria;
      document.getElementById('p_cost').value  = product.costo || 0;
      document.getElementById('p_price').value = product.precioUnitario || 0; // Java: precioUnitario
      document.getElementById('p_min').value   = product.stockMinimo || 0;    // Java: stockMinimo
      document.getElementById('loose_units').value = product.unidadesSueltas || 0; // Java: unidadesSueltas

      // Mapear LOTES (Java: tamanoPaca, cantidadPacas)
      if (product.lotes && product.lotes.length) {
        // El primer lote va en los inputs principales
        document.getElementById('pack_size').value = product.lotes[0].tamanoPaca;
        document.getElementById('pack_qty').value  = product.lotes[0].cantidadPacas;

        // Los demás lotes se agregan como filas extra
        product.lotes.slice(1).forEach(l => addPackRow(l.tamanoPaca, l.cantidadPacas));
      }
    } else {
      // Limpiar si es nuevo producto
      document.getElementById('pack_size').value = 0;
      document.getElementById('pack_qty').value  = 0;
      document.getElementById('loose_units').value = 0;
      document.getElementById('p_cost').value  = 0;
      document.getElementById('p_price').value = 0;
      document.getElementById('p_min').value   = 0;
    }

    calcPreview();
    showModal();
  };

  // Listeners para botones de abrir/cerrar
  document.getElementById('btnAddProductTop')?.addEventListener('click', () => openProductModal(null));
  document.querySelectorAll('[data-close="productModal"]').forEach(btn =>
    btn.addEventListener('click', closeModal)
  );

  // ---------------------------------------------------------
  // LÓGICA VISUAL (Filas dinámicas y cálculos)
  // ---------------------------------------------------------
  window.addPackRow = function (size, qty) {
    const wrap = document.createElement('div');
    wrap.className = 'row pack-extra';
    wrap.style.marginTop = '8px';
    wrap.innerHTML = `
      <div>
        <div class="label">Paca de (u)</div>
        <input class="input row-size" type="number" value="${size || 0}">
      </div>
      <div>
        <div class="label">Cantidad pacas</div>
        <input class="input row-qty" type="number" value="${qty || 0}">
      </div>
    `;
    packRowsDiv.appendChild(wrap);
  };

  document.getElementById('btnAddPackRow')?.addEventListener('click', () => {
    addPackRow(0, 0);
    calcPreview();
  });

  packRowsDiv.addEventListener('input', e => {
    if (e.target.matches('.row-size,.row-qty')) calcPreview();
  });

  function calcPreview() {
    let total = Number(document.getElementById('loose_units').value || 0);
    const size0 = Number(document.getElementById('pack_size').value || 0);
    const qty0  = Number(document.getElementById('pack_qty').value || 0);
    total += size0 * qty0;

    document.querySelectorAll('#packRows .pack-extra').forEach(r => {
      const s = Number(r.querySelector('.row-size').value || 0);
      const q = Number(r.querySelector('.row-qty').value || 0);
      total += s * q;
    });
    document.getElementById('total_preview').value = total;
  }

  ['loose_units', 'pack_size', 'pack_qty'].forEach(id => {
    document.getElementById(id).addEventListener('input', calcPreview);
  });

  // ---------------------------------------------------------
  // ENVIAR FORMULARIO (POST al Backend)
  // ---------------------------------------------------------
  form.addEventListener('submit', async e => {
    e.preventDefault();
    
    // 1. Capturar datos básicos
    const code = document.getElementById('p_code').value.trim();
    const name = document.getElementById('p_name').value.trim();

    if (!code || !name) {
      alert('Código y nombre son obligatorios');
      return;
    }

    const cat   = document.getElementById('p_cat').value.trim();
    const cost  = Number(document.getElementById('p_cost').value || 0);
    const price = Number(document.getElementById('p_price').value || 0);
    const min   = Number(document.getElementById('p_min').value || 0);
    const loose = Number(document.getElementById('loose_units').value || 0);

    // 2. Construir array de lotes (DTO: size, packs)
    const lots = [];
    const size0 = Number(document.getElementById('pack_size').value || 0);
    const qty0  = Number(document.getElementById('pack_qty').value || 0);
    
    if (size0 > 0 && qty0 > 0) lots.push({ size: size0, packs: qty0 });

    document.querySelectorAll('#packRows .pack-extra').forEach(r => {
      const s = Number(r.querySelector('.row-size').value || 0);
      const q = Number(r.querySelector('.row-qty').value || 0);
      if (s > 0 && q > 0) lots.push({ size: s, packs: q });
    });

    // 3. Crear el DTO para enviar a Java (Coincide con ProductoDTO.java)
    const productoDTO = {
        code: code,
        name: name,
        cat: cat,
        cost: cost,
        price: price,
        minUnits: min,
        looseUnits: loose,
        lots: lots
    };

    // 4. Enviar FETCH al Backend
    try {
        const response = await fetch('/api/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoDTO)
        });

        if (response.ok) {
            alert('Producto guardado correctamente');
            closeModal();
            // Actualizar todas las tablas
            if (window.renderProducts) window.renderProducts();
            if (window.renderInventory) window.renderInventory();
        } else {
            const errorMsg = await response.text();
            alert('Error al guardar: ' + errorMsg);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        alert('No se pudo conectar con el servidor');
    }
  });

  // ---------------------------------------------------------
  // RENDER TABLA DE PRODUCTOS (GET desde Backend)
  // ---------------------------------------------------------
  window.renderProducts = async function () {
    const tbody = document.getElementById('prdBody');
    if (!tbody) return;
    
    try {
        const response = await fetch('/api/productos');
        if (!response.ok) return;
        
        const productos = await response.json();
        tbody.innerHTML = '';

        productos.forEach(p => {
          // Nota: 'p' viene de la Entidad Java, usar nombres en español/Java
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${p.codigo}</td>
            <td>${p.nombre}</td>
            <td><span class="badge" style="background:rgba(255,255,255,.08);border:1px solid var(--stroke)">${p.categoria}</span></td>
            <td>${money(p.costo)}</td>
            <td>${money(p.precioUnitario)}</td>
            <td>${p.stockMinimo}</td>
            <td>${p.totalUnidades}</td> `;
          tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error cargando tabla productos:", error);
    }
  };
  
  // Carga inicial
  window.renderProducts();
});