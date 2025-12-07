package com.emplasur.backend_inventario.dto;

public interface BalanceFinancieroProjection {
    String getFecha();
    Double getIngresos();
    Double getCostos();
    Double getGanancia();
}