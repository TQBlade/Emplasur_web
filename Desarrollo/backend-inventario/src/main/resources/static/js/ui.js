// ================== GESTOR DE INTERFAZ (UI) ==================

const UI = {
    // Mostrar/Ocultar Cargando
    loading: (show) => {
        const el = document.getElementById('preloader');
        if (el) el.style.display = show ? 'flex' : 'none';
    },

    // Alerta bonita (Reemplaza alert)
    alert: (msg, type = 'success') => {
        return new Promise((resolve) => {
            const overlay = document.getElementById('customAlert');
            const icon = document.getElementById('alertIcon');
            const txt = document.getElementById('alertMessage');
            const actions = document.getElementById('alertActions');

            // Icono según tipo
            if (type === 'success') icon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
            else if (type === 'error') icon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
            
            icon.className = `custom-alert-icon ${type}`;
            txt.textContent = msg;

            // Botón Aceptar
            actions.innerHTML = `
                <button class="btn-primary" id="btnAlertOk">Aceptar</button>
            `;

            overlay.style.display = 'flex';

            document.getElementById('btnAlertOk').onclick = () => {
                overlay.style.display = 'none';
                resolve();
            };
        });
    },

    // Confirmación bonita (Reemplaza confirm)
    confirm: (msg) => {
        return new Promise((resolve) => {
            const overlay = document.getElementById('customAlert');
            const icon = document.getElementById('alertIcon');
            const txt = document.getElementById('alertMessage');
            const actions = document.getElementById('alertActions');

            icon.innerHTML = '<i class="fa-solid fa-circle-question"></i>';
            icon.className = 'custom-alert-icon question';
            txt.textContent = msg;

            actions.innerHTML = `
                <button class="btn-secondary" id="btnConfirmNo" style="background:#374151; color:white">Cancelar</button>
                <button class="btn-primary" id="btnConfirmYes">Aceptar</button>
            `;

            overlay.style.display = 'flex';

            document.getElementById('btnConfirmYes').onclick = () => {
                overlay.style.display = 'none';
                resolve(true);
            };

            document.getElementById('btnConfirmNo').onclick = () => {
                overlay.style.display = 'none';
                resolve(false);
            };
        });
    }
};