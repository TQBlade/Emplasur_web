// ================== INVENTARIO (CONECTADO AL BACKEND) ==================

document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('invBody');
  const searchInput = document.getElementById('invSearch');
  
  // Variable global para almacenar productos y filtrar sin recargar la API cada vez
  let productsCache = [];

  if (!tbody) return;

  // ---------------------------------------------------------
  // 1. OBTENER DATOS (FETCH GET)
  // ---------------------------------------------------------
  window.renderInventory = async function () {
    try {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center">Cargando inventario...</td></tr>';
      
      const response = await fetch('/api/productos');
      if (!response.ok) throw new Error('Error al cargar productos');
      
      productsCache = await response.json(); // Guardamos en memoria
      filterAndRenderTable(); // Renderizamos la tabla
      
    } catch (error) {
      console.error(error);
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:red">Error al cargar datos</td></tr>';
    }
  };

  // ---------------------------------------------------------
  // 2. FILTRAR Y DIBUJAR TABLA
  // ---------------------------------------------------------
  function filterAndRenderTable() {
    const filterText = (searchInput?.value || '').toLowerCase();
    tbody.innerHTML = '';

    const filtered = productsCache.filter(p => 
      (p.codigo + ' ' + p.nombre + ' ' + p.categoria).toLowerCase().includes(filterText)
    );

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center">No se encontraron productos</td></tr>';
      return;
    }

    filtered.forEach(p => {
      const tr = document.createElement('tr');
      
      // Lógica visual para mostrar los lotes (Ej: "3×100, 2×50")
      // Nota: En Java la entidad se llama 'lotes', con 'cantidadPacas' y 'tamanoPaca'
      const lotsTxt = p.lotes && p.lotes.length > 0
        ? p.lotes.map(l => `${l.cantidadPacas}×${l.tamanoPaca}`).join(', ')
        : '—';

      // Cálculo de total de pacas visual
      const totalPacas = p.lotes ? p.lotes.reduce((acc, l) => acc + l.cantidadPacas, 0) : 0;

      // Badge de estado (Re-implementado aquí para usar los campos nuevos de Java)
      let badgeHtml = '<span class="badge ok">En stock</span>';
      if (p.totalUnidades <= 0) badgeHtml = '<span class="badge out">Agotado</span>';
      else if (p.totalUnidades < p.stockMinimo) badgeHtml = '<span class="badge low">Bajo</span>';

      tr.innerHTML = `
        <td><span class="badge" style="background:rgba(255,255,255,.08);border:1px solid var(--stroke)">${p.categoria}</span></td>
        <td style="font-weight:600">${p.codigo}</td>
        <td>${p.nombre}</td>
        <td style="font-size:0.9em; color:#d7e4ff">${lotsTxt}${p.unidadesSueltas ? ` <small style="color:#9fb0cc">| Sueltas: ${p.unidadesSueltas}</small>` : ''}</td>
        <td style="text-align:center">${totalPacas}</td>
        <td style="text-align:center; font-weight:bold">${p.totalUnidades}</td>
        <td style="text-align:center; color:#9fb0cc">${p.stockMinimo}</td>
        <td>${badgeHtml}</td>
        <td class="actions">
          <button class="icon-btn btn-edit" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn btn-delete" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;

      // Eventos de botones (Edit / Delete)
      const btnEdit = tr.querySelector('.btn-edit');
      const btnDelete = tr.querySelector('.btn-delete');

      // EDITAR
      btnEdit.addEventListener('click', () => {
        if (window.openProductModal) {
          window.openProductModal(p); // Pasamos el objeto 'p' completo que vino de Java
        }
      });

      // ELIMINAR
      btnDelete.addEventListener('click', () => deleteProduct(p.id));

      tbody.appendChild(tr);
    });
  }

  // ---------------------------------------------------------
  // 3. ELIMINAR PRODUCTO (DELETE al Backend)
  // ---------------------------------------------------------
  async function deleteProduct(id) {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) return;

    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Recargar la tabla
        window.renderInventory();
        // También actualizar reportes si existen
        if(window.renderSales) window.renderSales(); 
      } else {
        alert('Error al eliminar el producto');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión al eliminar');
    }
  }

  // Listener para el buscador
  searchInput?.addEventListener('input', filterAndRenderTable);

  // Carga inicial
  window.renderInventory();
});

// ================== LOGICA DE ABASTECIMIENTO ==================

const supplyModal = document.getElementById('supplyModal');
const supplyForm = document.getElementById('supplyForm');
const supplyProductSelect = document.getElementById('supplyProduct');

// Abrir Modal
window.openSupplyModal = async function() {
    supplyForm.reset();
    
    // Cargar productos en el select
    try {
        const res = await fetch('/api/productos');
        const productos = await res.json();
        
        supplyProductSelect.innerHTML = '<option value="">-- Seleccione Producto --</option>';
        productos.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.codigo} - ${p.nombre}`;
            supplyProductSelect.appendChild(opt);
        });
        
        supplyModal.style.display = 'flex';
    } catch(err) { console.error(err); }
}

window.closeSupplyModal = function() {
    supplyModal.style.display = 'none';
}

// Enviar Formulario
if(supplyForm) {
    supplyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const prodId = supplyProductSelect.value;
        if(!prodId) { alert('Seleccione un producto'); return; }

        const dto = {
            productoId: prodId,
            cantidadPacas: Number(document.getElementById('supplyPackQty').value || 0),
            tamanoPaca: Number(document.getElementById('supplyPackSize').value || 0),
            unidadesSueltas: Number(document.getElementById('supplyLoose').value || 0),
            nuevoCosto: Number(document.getElementById('supplyCost').value || 0)
        };

        if(dto.cantidadPacas === 0 && dto.unidadesSueltas === 0) {
            alert('Debe ingresar al menos una cantidad (paca o suelta)');
            return;
        }

        try {
            const res = await fetch('/api/entradas', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(dto)
            });

            if(res.ok) {
                alert('Entrada registrada correctamente');
                closeSupplyModal();
                window.renderInventory(); // Recargar tabla
            } else {
                alert('Error: ' + await res.text());
            }
        } catch(err) { console.error(err); alert('Error de conexión'); }
    });
}