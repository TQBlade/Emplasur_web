// ================== GENERADOR DE REPORTES Y RECIBOS ==================

// Helper seguro para moneda
function moneyFmt(val) {
    if (val === undefined || val === null) return "$0";
    return '$' + Number(val).toLocaleString('es-CO', {maximumFractionDigits: 0});
}

// Helper para asegurar texto (evita crash por null)
function safeText(txt) {
    return txt ? String(txt) : "";
}

// 1. RECIBO TIPO TIQUET (POS)
window.printSaleReceipt = function(datos) {
    try {
        console.log("Generando PDF con datos:", datos); // Debug

        const { jsPDF } = window.jspdf;
        
        // --- PREPARAR DATOS ---
        let listaItems = [];
        let cabecera = { fecha: "", cliente: "", total: 0 };

        // CASO A: Viene del Carrito (Venta Nueva)
        if (datos.items) {
            listaItems = datos.items.map(i => ({
                nombre: safeText(i.nombre),
                cantidad: i.cantidad || 0,
                total: i.subtotal || 0
            }));
            
            // Construir nombre cliente seguro
            let cName = "General";
            if (datos.cliente) {
                const n = safeText(datos.cliente.primerNombre);
                const a = safeText(datos.cliente.primerApellido);
                cName = `${n} ${a}`.trim();
            }
            if (!cName) cName = "General";

            cabecera = {
                fecha: new Date().toLocaleString(),
                cliente: cName,
                total: datos.totalVenta || 0
            };
        } 
        // CASO B: Viene del Historial (Reimpresión)
        else {
            // (Lógica existente para historial...)
            const source = Array.isArray(datos) ? datos : [datos];
            if (source.length === 0) return;
            
            listaItems = source.map(v => ({
                nombre: v.producto ? safeText(v.producto.nombre) : "Producto borrado",
                cantidad: v.cantidad || 0,
                total: v.totalVenta || 0
            }));

            const first = source[0];
            let cName = "General";
            if (first.cliente) {
                cName = `${safeText(first.cliente.primerNombre)} ${safeText(first.cliente.primerApellido)}`;
            } else if (first.clienteId) {
                cName = "ID: " + first.clienteId;
            }

            cabecera = {
                fecha: new Date(first.fecha).toLocaleString(),
                cliente: cName,
                total: source.reduce((acc, v) => acc + (v.totalVenta||0), 0)
            };
        }

        // --- CONFIGURAR PDF ---
        // Altura dinámica: Base (80) + (Items * 10)
        const docHeight = 80 + (listaItems.length * 10);
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: [80, docHeight] // Ancho 80mm (típico POS)
        });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        
        let y = 8;
        const center = 40; // Mitad de 80mm

        // --- DIBUJAR CONTENIDO ---
        doc.text("EMPLANORTE S.A.S", center, y, { align: 'center' }); y += 5;
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("NIT: 900.123.456-7", center, y, { align: 'center' }); y += 4;
        doc.text("Cúcuta, Norte de Santander", center, y, { align: 'center' }); y += 6;

        doc.text(`Fecha: ${cabecera.fecha}`, 2, y); y += 4;
        doc.text(`Cliente: ${cabecera.cliente}`, 2, y); y += 5;
        
        doc.line(2, y, 78, y); y += 4;

        // Encabezados Tabla
        doc.setFont("helvetica", "bold");
        doc.text("Cant.", 2, y);
        doc.text("Producto", 12, y);
        doc.text("Total", 78, y, { align: 'right' });
        y += 4;
        
        doc.setFont("helvetica", "normal");

        // Items
        listaItems.forEach(item => {
            // Recortar nombre si es muy largo
            let nombreCorto = item.nombre.length > 20 ? item.nombre.substring(0, 20) + ".." : item.nombre;
            
            doc.text(String(item.cantidad), 2, y);
            doc.text(nombreCorto, 12, y);
            doc.text(moneyFmt(item.total), 78, y, { align: 'right' });
            y += 5;
        });

        doc.line(2, y, 78, y); y += 5;

        // Total
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL:", 2, y);
        doc.text(moneyFmt(cabecera.total), 78, y, { align: 'right' });
        y += 8;

        // Pie
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text("¡Gracias por su compra!", center, y, { align: 'center' });

        // Abrir PDF
        window.open(doc.output('bloburl'), '_blank');

    } catch (error) {
        console.error("Error FATAL generando PDF:", error);
        alert("Error interno al generar el PDF. Revise la consola.");
    }
};

// 2. REPORTE HISTORIAL (TABLA GRANDE)
window.printSalesReport = function(ventas, rango) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF(); 

        doc.setFontSize(16);
        doc.text("Reporte de Ventas", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 22);
        if(rango) doc.text(`Filtro: ${rango}`, 14, 27);

        let tVenta = 0, tGanancia = 0;
        
        const body = ventas.map(v => {
            tVenta += (v.totalVenta || 0);
            tGanancia += (v.ganancia || 0);
            
            let cli = "General";
            if (v.cliente) cli = `${safeText(v.cliente.primerNombre)} ${safeText(v.cliente.primerApellido)}`;
            else if (v.clienteId) cli = "ID: " + v.clienteId;
            
            return [
                new Date(v.fecha).toLocaleDateString(),
                v.producto ? safeText(v.producto.nombre) : "Eliminado",
                v.cantidad || 0,
                moneyFmt(v.totalVenta),
                moneyFmt(v.costoTotal),
                moneyFmt(v.ganancia),
                cli
            ];
        });

        doc.autoTable({
            startY: 35,
            head: [['Fecha', 'Producto', 'Cant', 'Venta', 'Costo', 'Ganancia', 'Cliente']],
            body: body,
            theme: 'grid'
        });

        let fy = doc.lastAutoTable.finalY + 10;
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL VENTAS: ${moneyFmt(tVenta)}`, 14, fy);
        doc.text(`TOTAL GANANCIA: ${moneyFmt(tGanancia)}`, 100, fy);

        window.open(doc.output('bloburl'), '_blank');
    } catch(err) {
        console.error("Error generando reporte:", err);
        alert("Error al generar reporte.");
    }
}