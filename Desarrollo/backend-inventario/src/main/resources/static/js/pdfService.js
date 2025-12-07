// ================== SERVICIO DE REPORTES GERENCIALES (BI) ==================

// Helpers
function moneyFmt(val) {
    if (val === undefined || val === null) return "$0";
    return '$' + Number(val).toLocaleString('es-CO', {maximumFractionDigits: 0});
}
function safeText(txt) { return txt ? String(txt) : ""; }

// 1. TIQUET DE VENTA (POS) - Formato pequeño 80mm
window.printSaleReceipt = function(datos) {
    try {
        const { jsPDF } = window.jspdf;
        
        let listaItems = [];
        let cabecera = { fecha: "", cliente: "", total: 0 };

        if (datos.items) { // Desde Carrito
            listaItems = datos.items.map(i => ({
                nombre: safeText(i.nombre),
                cantidad: i.cantidad || 0,
                total: i.subtotal || 0
            }));
            let cName = "General";
            if (datos.cliente) {
                cName = `${safeText(datos.cliente.primerNombre)} ${safeText(datos.cliente.primerApellido)}`.trim();
            }
            cabecera = {
                fecha: new Date().toLocaleString(),
                cliente: cName || "General",
                total: datos.totalVenta || 0
            };
        } else { // Desde Historial
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
            }
            cabecera = {
                fecha: new Date(first.fecha).toLocaleString(),
                cliente: cName,
                total: source.reduce((acc, v) => acc + (v.totalVenta||0), 0)
            };
        }

        const docHeight = 80 + (listaItems.length * 10);
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: [80, docHeight] });

        doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        let y = 8; const center = 40;

        doc.text("EMPLANORTE S.A.S", center, y, { align: 'center' }); y += 5;
        doc.setFontSize(8); doc.setFont("helvetica", "normal");
        doc.text("NIT: 900.123.456-7", center, y, { align: 'center' }); y += 4;
        doc.text("Cúcuta, Norte de Santander", center, y, { align: 'center' }); y += 6;
        
        doc.text(`Fecha: ${cabecera.fecha}`, 2, y); y += 4;
        doc.text(`Cliente: ${cabecera.cliente}`, 2, y); y += 5;
        doc.line(2, y, 78, y); y += 4;

        doc.setFont("helvetica", "bold");
        doc.text("Cant.", 2, y); doc.text("Prod.", 12, y); doc.text("Total", 78, y, { align: 'right' });
        y += 4; doc.setFont("helvetica", "normal");

        listaItems.forEach(item => {
            let nombre = item.nombre.substring(0, 18);
            doc.text(String(item.cantidad), 2, y);
            doc.text(nombre, 12, y);
            doc.text(moneyFmt(item.total), 78, y, { align: 'right' });
            y += 5;
        });

        doc.line(2, y, 78, y); y += 5;
        doc.setFontSize(11); doc.setFont("helvetica", "bold");
        doc.text("TOTAL:", 2, y);
        doc.text(moneyFmt(cabecera.total), 78, y, { align: 'right' });
        
        window.open(doc.output('bloburl'), '_blank');
    } catch (error) { console.error(error); alert("Error al generar tiquet."); }
};

// 2. REPORTE GERENCIAL (BI) - A4 COMPLETO
window.printSalesReport = function(ventas, rango) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF(); // A4 Vertical

        // --- CÁLCULOS DE KPIs ---
        let tVenta = 0, tCosto = 0, tGanancia = 0;
        const vendedores = {};
        
        // Mapa para agrupar ventas por vendedor
        ventas.forEach(v => {
            tVenta += (v.totalVenta || 0);
            tCosto += (v.costoTotal || 0);
            tGanancia += (v.ganancia || 0);

            // Segmentación Vendedor (Asumiendo que v.usuario viene populado, si no, "Sistema")
            // Nota: Asegúrate que tu backend envíe el objeto usuario en el JSON de Venta
            const vend = (v.usuario && v.usuario.nombreCompleto) ? v.usuario.nombreCompleto : "Administrador";
            
            if (!vendedores[vend]) vendedores[vend] = { total: 0, count: 0 };
            vendedores[vend].total += v.totalVenta;
            vendedores[vend].count += 1;
        });

        const ticketPromedio = ventas.length > 0 ? tVenta / ventas.length : 0;
        // Margen Bruto % = (Utilidad / Ingresos) * 100
        const margenPorcentaje = tVenta > 0 ? ((tGanancia / tVenta) * 100).toFixed(1) : 0;

        // --- DISEÑO DEL PDF ---
        
        // 1. Encabezado Azul
        doc.setFillColor(41, 128, 185); // Azul Emplanorte
        doc.rect(0, 0, 210, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22); doc.setFont("helvetica", "bold");
        doc.text("EMPLANORTE - Reporte Gerencial", 14, 15);
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 22);
        doc.text(`Filtro: ${rango}`, 14, 27);
        
        // 2. Panel de KPIs (Cuadros de Resumen)
        let y = 45;
        const drawCard = (x, title, val, sub, colorVal) => {
            doc.setFillColor(245, 247, 250); doc.setDrawColor(200);
            doc.roundedRect(x, y, 40, 20, 2, 2, 'FD');
            doc.setTextColor(100); doc.setFontSize(8); doc.text(title, x+2, y+5);
            doc.setTextColor(colorVal); doc.setFontSize(11); doc.setFont("helvetica", "bold");
            doc.text(val, x+2, y+12);
            doc.setFontSize(7); doc.setTextColor(100); doc.text(sub, x+2, y+17);
        };

        drawCard(14, "INGRESOS TOTALES", moneyFmt(tVenta), `${ventas.length} ventas`, "#2c3e50");
        drawCard(60, "UTILIDAD (NETA)", moneyFmt(tGanancia), `Margen: ${margenPorcentaje}%`, "#27ae60"); // Verde
        drawCard(106, "COSTO (COGS)", moneyFmt(tCosto), "Costo mercancía", "#c0392b"); // Rojo
        drawCard(152, "TICKET PROMEDIO", moneyFmt(ticketPromedio), "Promedio por venta", "#e67e22"); // Naranja

        y += 30;

        // 3. Tabla Detallada con Datos de Inventario
        const body = ventas.map(v => {
            let cli = "General";
            if (v.cliente) cli = `${safeText(v.cliente.primerNombre)} ${safeText(v.cliente.primerApellido)}`;
            
            // Datos de Inventario (Alerta Reorden)
            // Nota: v.producto.totalUnidades viene del backend si la entidad Producto tiene el getter calculado
            const stockActual = v.producto ? (v.producto.totalUnidades || 0) : 0;
            const stockMin = v.producto ? (v.producto.stockMinimo || 0) : 0;
            
            // Marcar con * si está bajo
            let stockStr = `${stockActual}`;
            if(stockActual < stockMin) stockStr += " (!)";
            
            return [
                new Date(v.fecha).toLocaleDateString(),
                v.producto ? safeText(v.producto.nombre) : "Eliminado",
                v.cantidad,
                moneyFmt(v.totalVenta),
                moneyFmt(v.ganancia),
                stockStr, // Nueva columna de Stock
                cli
            ];
        });

        doc.setTextColor(0);
        doc.setFontSize(12); doc.text("Detalle Operativo & Inventario", 14, y);
        y += 2;

        doc.autoTable({
            startY: y,
            head: [['Fecha', 'Producto', 'Cant', 'Venta', 'Ganancia', 'Stock', 'Cliente']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [52, 73, 94] },
            styles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 18 },
                2: { halign: 'center' },
                3: { halign: 'right' },
                4: { halign: 'right' },
                5: { halign: 'center', fontStyle: 'bold' } // Stock destacado
            }
        });

        // 4. Resumen por Vendedor (Segmentación)
        let finalY = doc.lastAutoTable.finalY + 15;
        
        // Evitar salto de página si no cabe
        if(finalY > 250) { doc.addPage(); finalY = 20; }

        doc.setFontSize(12); doc.text("Rendimiento por Vendedor", 14, finalY);
        
        // Convertir objeto vendedores a array para tabla
        const vendedorData = Object.entries(vendedores).map(([nombre, datos]) => [
            nombre, 
            datos.count, 
            moneyFmt(datos.total)
        ]);
        
        doc.autoTable({
            startY: finalY + 2,
            head: [['Vendedor', '# Ventas', 'Total Ingresos']],
            body: vendedorData,
            theme: 'striped',
            tableWidth: 120, // Tabla más pequeña
            headStyles: { fillColor: [46, 204, 113] }
        });

        // Mensaje final
        finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(8); doc.setTextColor(150);
        doc.text("(!) Indica producto por debajo del stock mínimo. Se recomienda reabastecer.", 14, finalY);

        window.open(doc.output('bloburl'), '_blank');
        
    } catch(err) {
        console.error("Error reporte:", err);
        alert("Error al generar reporte: " + err.message);
    }
}