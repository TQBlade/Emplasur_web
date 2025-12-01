document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('cliBody');
    const modal = document.getElementById('clientModal');
    const form = document.getElementById('clientForm');
    
    if(!tableBody) return;

    // Abrir Modal
    window.openClientModal = function(client = null) {
        form.reset();
        document.getElementById('c_id').value = '';
        
        if (client) {
            document.getElementById('c_id').value = client.id;
            document.getElementById('c_doc').value = client.documento;
            document.getElementById('c_name1').value = client.primerNombre;
            document.getElementById('c_name2').value = client.segundoNombre;
            document.getElementById('c_last1').value = client.primerApellido;
            document.getElementById('c_last2').value = client.segundoApellido;
            document.getElementById('c_tel').value = client.telefono;
            document.getElementById('c_email').value = client.email;
            document.getElementById('c_dir').value = client.direccion;
        }
        modal.style.display = 'flex';
    }

    // Cerrar Modal
    document.querySelectorAll('[data-close="clientModal"]').forEach(b => {
        b.addEventListener('click', () => modal.style.display = 'none');
    });
    
    document.getElementById('btnAddClientTop')?.addEventListener('click', () => window.openClientModal());

    // GUARDAR CLIENTE
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('c_id').value;
        const data = {
            documento: document.getElementById('c_doc').value,
            primerNombre: document.getElementById('c_name1').value,
            segundoNombre: document.getElementById('c_name2').value,
            primerApellido: document.getElementById('c_last1').value,
            segundoApellido: document.getElementById('c_last2').value,
            telefono: document.getElementById('c_tel').value,
            email: document.getElementById('c_email').value,
            direccion: document.getElementById('c_dir').value
        };

        const url = id ? `/api/clientes/${id}` : '/api/clientes';
        const method = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });

            if(res.ok) {
                alert('Cliente guardado con éxito');
                modal.style.display = 'none';
                window.renderClients();
            } else {
                alert('Error al guardar cliente');
            }
        } catch(err) { console.error(err); }
    });

    // RENDERIZAR TABLA
    window.renderClients = async function() {
        try {
            const res = await fetch('/api/clientes');
            const clientes = await res.json();
            
            tableBody.innerHTML = '';
            clientes.forEach(c => {
                const nombreCompleto = `${c.primerNombre} ${c.segundoNombre||''} ${c.primerApellido} ${c.segundoApellido||''}`;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${c.documento}</td>
                    <td>${nombreCompleto}</td>
                    <td>${c.telefono || '-'}</td>
                    <td>${c.email || '-'}</td>
                    <td class="actions">
                        <button class="icon-btn btn-edit-cli"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn btn-del-cli"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                
                // Botones acciones
                tr.querySelector('.btn-edit-cli').onclick = () => window.openClientModal(c);
                tr.querySelector('.btn-del-cli').onclick = async () => {
                    if(confirm('¿Eliminar cliente?')) {
                        await fetch(`/api/clientes/${c.id}`, {method: 'DELETE'});
                        window.renderClients();
                    }
                };
                
                tableBody.appendChild(tr);
            });
        } catch(err) { console.error(err); }

        
    }
    if(document.getElementById('clientsSection').style.display !== 'none') {
        window.renderClients();
    }
});