package com.emplasur.backend_inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.emplasur.backend_inventario.entity.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    boolean existsByCodigo(String codigo);
}