package com.emplasur.backend_inventario.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "clientes")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String documento;

    @Column(name = "primer_nombre", nullable = false)
    private String primerNombre;

    @Column(name = "segundo_nombre")
    private String segundoNombre;

    @Column(name = "primer_apellido", nullable = false)
    private String primerApellido;

    @Column(name = "segundo_apellido")
    private String segundoApellido;

    private String telefono;
    private String email;
    private String direccion;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @PrePersist
    public void prePersist() {
        this.fechaRegistro = LocalDateTime.now();
    }

    // Helper para mostrar nombre completo en reportes
    public String getNombreCompleto() {
        return primerNombre + " " + 
               (segundoNombre != null ? segundoNombre + " " : "") + 
               primerApellido + " " + 
               (segundoApellido != null ? segundoApellido : "");
    }
}