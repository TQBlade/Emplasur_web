package com.emplasur.backend_inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.emplasur.backend_inventario.entity.Entrada;

public interface EntradaRepository extends JpaRepository<Entrada, Long> {
}