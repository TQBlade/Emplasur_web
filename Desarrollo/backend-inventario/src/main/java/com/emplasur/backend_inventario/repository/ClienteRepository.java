package com.emplasur.backend_inventario.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.emplasur.backend_inventario.entity.Cliente; // Importar List

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    // Cambiamos Optional<Cliente> por List<Cliente> y agregamos 'Containing'
    // Esto hace: WHERE documento LIKE %termino%
    List<Cliente> findByDocumentoContaining(String documento);
    
    boolean existsByDocumento(String documento);
}