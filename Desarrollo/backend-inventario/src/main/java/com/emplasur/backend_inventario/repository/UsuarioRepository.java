package com.emplasur.backend_inventario.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.emplasur.backend_inventario.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
}