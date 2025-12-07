package com.emplasur.backend_inventario.repository;

import java.time.LocalDateTime; // <--- Importante
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.emplasur.backend_inventario.dto.BalanceFinancieroProjection;
import com.emplasur.backend_inventario.dto.TopProductoDTO;
import com.emplasur.backend_inventario.entity.Venta;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    
    // Filtro normal de historial
    List<Venta> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);

    // 1. TOP PRODUCTOS
    @Query("SELECT v.producto.nombre as nombre, SUM(v.cantidad) as cantidad, SUM(v.totalVenta) as total " +
           "FROM Venta v " +
           "GROUP BY v.producto.nombre " +
           "ORDER BY cantidad DESC " +
           "LIMIT 5")
    List<TopProductoDTO> obtenerTopProductos();

    // 2. BALANCE POR DÍAS (CORREGIDO CON NATIVE QUERY)
    @Query(value = "SELECT TO_CHAR(v.fecha, 'YYYY-MM-DD') as fecha, " +
                   "SUM(v.total_venta) as ingresos, " +
                   "SUM(v.costo_total) as costos, " +
                   "SUM(v.ganancia) as ganancia " +
                   "FROM ventas v " +
                   "WHERE v.fecha >= :fechaLimite " +
                   "GROUP BY TO_CHAR(v.fecha, 'YYYY-MM-DD') " +
                   "ORDER BY fecha ASC", 
           nativeQuery = true)
    List<BalanceFinancieroProjection> obtenerBalancePorDias(@Param("fechaLimite") LocalDateTime fechaLimite);
}