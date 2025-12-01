package com.emplasur.backend_inventario.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository; // <--- IMPORTANTE

import com.emplasur.backend_inventario.entity.Venta;          // <--- IMPORTANTE

public interface VentaRepository extends JpaRepository<Venta, Long> {
    
    // Método mágico de JPA para buscar entre fechas
    List<Venta> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);
}