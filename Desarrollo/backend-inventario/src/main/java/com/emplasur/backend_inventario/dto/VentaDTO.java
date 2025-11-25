package com.emplasur.backend_inventario.dto;

import lombok.Data;

@Data
public class VentaDTO {
    private Long productoId;
    private Long usuarioId; // El empleado que registra la venta
    private Long clienteId; // Opcional (puede ser null)
    private Integer cantidad;
}