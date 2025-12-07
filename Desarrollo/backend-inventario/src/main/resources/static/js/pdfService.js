// ================== GENERADOR DE RECIBOS PDF ==================

window.printSaleReceipt = function(venta) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // Formato tipo Tiquet (80mm ancho)
    });

    // Configuración de fuente
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    
    // 1. ENCABEZADO
    const company = "EMPLANORTE S.A.S";
    const nit = "NIT: 900.695.563-1"; // Pon tu NIT real aquí 9006955631
    const addr = "Cúcuta, Norte de Santander";
    
    // Centrar texto
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.text(company, pageWidth / 2, 10, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(nit, pageWidth / 2, 15, { align: 'center' });
    doc.text(addr, pageWidth / 2, 19, { align: 'center' });
    doc.text("-------------------------------------------", pageWidth / 2, 23, { align: 'center' });

    // 2. DATOS DE LA VENTA
    let y = 28;
    const lineHeight = 4;

    doc.setFont("helvetica", "bold");
    doc.text(`Venta #: ${venta.id}`, 5, y); y += lineHeight;
    
    doc.setFont("helvetica", "normal");
    const fecha = new Date(venta.fecha).toLocaleString();
    doc.text(`Fecha: ${fecha}`, 5, y); y += lineHeight;

    // Cliente
    let clienteNombre = "General";
    if (venta.cliente) {
        clienteNombre = `${venta.cliente.primerNombre} ${venta.cliente.primerApellido}`;
    }
    doc.text(`Cliente: ${clienteNombre}`, 5, y); y += lineHeight + 2;

    doc.text("-------------------------------------------", pageWidth / 2, y, { align: 'center' });
    y += lineHeight;

    // 3. DETALLE DEL PRODUCTO
    doc.setFont("helvetica", "bold");
    doc.text("Producto", 5, y);
    doc.text("Total", pageWidth - 5, y, { align: 'right' });
    y += lineHeight;
    
    doc.setFont("helvetica", "normal");
    
    // Nombre del producto (con salto de línea si es muy largo)
    const prodName = venta.producto ? venta.producto.nombre : "Producto";
    const splitTitle = doc.splitTextToSize(prodName, 50); // Ajustar ancho
    doc.text(splitTitle, 5, y);
    
    // Precio y Cantidad
    // Si el nombre ocupó varias líneas, bajamos 'y'
    const dim = doc.getTextDimensions(splitTitle);
    y += dim.h + 1;

    doc.text(`${venta.cantidad} x ${moneyFmt(venta.totalVenta / venta.cantidad)}`, 5, y);
    doc.text(moneyFmt(venta.totalVenta), pageWidth - 5, y, { align: 'right' });
    y += lineHeight + 2;

    doc.text("-------------------------------------------", pageWidth / 2, y, { align: 'center' });
    y += lineHeight;

    // 4. TOTALES
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL A PAGAR:", 5, y);
    y += lineHeight + 2;
    doc.text(moneyFmt(venta.totalVenta), pageWidth - 5, y, { align: 'right' });

    // 5. PIE DE PÁGINA
    y += 15;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("¡Gracias por su compra!", pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.text("Software: Emplanorte V1.0", pageWidth / 2, y, { align: 'center' });

    // Guardar o Abrir
    // doc.save(`Venta_${venta.id}.pdf`); // Para descargar directo
    doc.autoPrint(); // Preparar para imprimir
    window.open(doc.output('bloburl'), '_blank'); // Abrir en nueva pestaña
};

// Helper simple para moneda dentro del PDF
function moneyFmt(val) {
    return '$' + (val || 0).toLocaleString('es-CO');
}

// ... (código anterior de printSaleReceipt) ...

// ================== REPORTE DE HISTORIAL DE VENTAS ==================
window.printSalesReport = function(ventas, rangoFechas) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF(); // Por defecto A4 vertical

    // 1. TÍTULO Y FECHA
    doc.setFontSize(18);
    doc.text("Reporte de Ventas - Emplanorte", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    const fechaImpresion = new Date().toLocaleString();
    doc.text(`Generado el: ${fechaImpresion}`, 14, 28);
    
    if(rangoFechas) {
        doc.text(`Filtro: ${rangoFechas}`, 14, 33);
    }

    // 2. CÁLCULO DE TOTALES PARA EL ENCABEZADO
    let totalVenta = 0;
    let totalGanancia = 0;
    
    const tableData = ventas.map(v => {
        totalVenta += v.totalVenta;
        totalGanancia += v.ganancia;
        
        // Formatear cliente
        let cliente = "General";
        if (v.cliente) cliente = `${v.cliente.primerNombre} ${v.cliente.primerApellido}`;
        else if (v.clienteId) cliente = "ID: " + v.clienteId;

        // Formatear fecha
        const fechaVenta = new Date(v.fecha).toLocaleDateString() + ' ' + new Date(v.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        return [
            fechaVenta,
            v.producto ? v.producto.nombre : "Borrado",
            v.cantidad,
            moneyFmt(v.totalVenta),
            moneyFmt(v.costoTotal),
            moneyFmt(v.ganancia),
            cliente
        ];
    });

    // 3. TABLA DE DATOS (Usando autoTable)
    doc.autoTable({
        startY: 40,
        head: [['Fecha', 'Producto', 'Cant.', 'Total Venta', 'Costo', 'Ganancia', 'Cliente']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: 25 }, // Fecha
            1: { cellWidth: 'auto' }, // Producto (autoajuste)
            2: { cellWidth: 15, halign: 'center' }, // Cant
            3: { cellWidth: 22, halign: 'right' }, // Venta
            4: { cellWidth: 22, halign: 'right' }, // Costo
            5: { cellWidth: 22, halign: 'right' }, // Ganancia
            6: { cellWidth: 30 }  // Cliente
        }
    });

    // 4. TOTALES FINALES
    let finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    
    doc.text(`TOTAL VENTAS: ${moneyFmt(totalVenta)}`, 14, finalY);
    doc.text(`TOTAL GANANCIA: ${moneyFmt(totalGanancia)}`, 80, finalY);

    // Abrir PDF
    window.open(doc.output('bloburl'), '_blank');
};