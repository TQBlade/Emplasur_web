package com.emplasur.backend_inventario.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String codigo;

    private String nombre;
    private String categoria;
    
    private Double costo;  // Nuevo
    @Column(name = "precio_unitario")
    private Double precioUnitario; // Es el 'price' del JS

    @Column(name = "unidades_sueltas")
    private Integer unidadesSueltas; // looseUnits

    @Column(name = "stock_minimo")
    private Integer stockMinimo;

    // Relación con los lotes (Pacas)
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Lote> lotes = new ArrayList<>();

    // Campo calculado (no se guarda en BD, pero se envía al JSON)
    // Suma: (pacas * tamaño) + sueltas
    public Integer getTotalUnidades() {
        int totalPacas = lotes.stream().mapToInt(l -> l.getCantidadPacas() * l.getTamanoPaca()).sum();
        return totalPacas + (unidadesSueltas != null ? unidadesSueltas : 0);
    }
    
    public String getEstado() {
        int total = getTotalUnidades();
        if (total == 0) return "Agotado";
        if (total < stockMinimo) return "Stock Bajo";
        return "En Stock";
    }
}