package com.emplasur.backend_inventario.dto;

import lombok.Data;

@Data
public class EntradaDTO {
    private Long productoId;
    private Integer cantidadPacas; // Cuántas pacas entran
    private Integer tamanoPaca;    // De qué tamaño son (Ej: 100)
    private Integer unidadesSueltas; // Unidades sueltas adicionales
    private Double nuevoCosto;     // Nuevo costo de compra (Opcional)
}