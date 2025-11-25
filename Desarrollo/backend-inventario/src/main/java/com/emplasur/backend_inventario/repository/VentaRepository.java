package com.emplasur.backend_inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.emplasur.backend_inventario.entity.Venta;

public interface VentaRepository extends JpaRepository<Venta, Long> {
}