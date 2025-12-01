package com.emplasur.backend_inventario.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "lotes")
public class Lote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tamano_paca")
    private Integer tamanoPaca; // size

    @Column(name = "cantidad_pacas")
    private Integer cantidadPacas; // packs

    @ManyToOne
    @JoinColumn(name = "producto_id")
    @JsonBackReference // Evita bucles infinitos al convertir a JSON
    private Producto producto;
}