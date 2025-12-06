package com.emplasur.backend_inventario.dto;

import lombok.Data;

@Data
public class VentaDTO {
    private Long productoId;
    private Long usuarioId;
    private Integer cantidad;
    private Long clienteId; // <--- ¡VERIFICA QUE ESTE CAMPO EXISTA!
    private Double precioVenta;
}