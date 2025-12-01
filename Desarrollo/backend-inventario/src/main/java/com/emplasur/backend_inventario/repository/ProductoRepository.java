package com.emplasur.backend_inventario.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.emplasur.backend_inventario.entity.Producto; // <--- Importar esto

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    // Método para buscar por código "PET-001" en lugar de ID
    Optional<Producto> findByCodigo(String codigo);
    
    boolean existsByCodigo(String codigo);
}