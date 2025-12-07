package com.emplasur.backend_inventario.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "entradas")
public class Entrada {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fecha;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(name = "cantidad_total_unidades")
    private Integer cantidadTotalUnidades; // Para saber cuánto entró en total

    private String detalle; // Ej: "5 pacas de 100 + 20 sueltas"

    @Column(name = "costo_unitario_compra")
    private Double costoUnitarioCompra; // A cuánto se compró esta vez

    @PrePersist
    public void prePersist() {
        this.fecha = LocalDateTime.now();
    }
}