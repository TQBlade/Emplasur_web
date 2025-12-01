package com.emplasur.backend_inventario.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "ventas")
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fecha;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente; 

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario; 

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "total_venta", nullable = false)
    private Double totalVenta;

    @PrePersist
    public void prePersist() {
        this.fecha = LocalDateTime.now();
    }

    // ... dentro de la clase Venta existente ...
    @Column(name = "costo_total")
    private Double costoTotal;

    private Double ganancia;
    
    private String detalle; // Descripción de qué se vendió
}