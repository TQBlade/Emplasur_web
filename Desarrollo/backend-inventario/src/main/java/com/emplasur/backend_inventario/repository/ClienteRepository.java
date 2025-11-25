package com.emplasur.backend_inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.emplasur.backend_inventario.entity.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}