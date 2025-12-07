package com.emplasur.backend_inventario.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.emplasur.backend_inventario.entity.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    Optional<Producto> findByCodigo(String codigo);
    
    // 3. PRODUCTOS HUESO (Sin ventas en X días)
    // Selecciona productos cuyo ID NO esté en la lista de ventas recientes
    @Query("SELECT p FROM Producto p WHERE p.id NOT IN " +
           "(SELECT v.producto.id FROM Venta v WHERE v.fecha >= :fechaLimite)")
    List<Producto> obtenerProductosSinRotacion(@Param("fechaLimite") LocalDateTime fechaLimite);
}