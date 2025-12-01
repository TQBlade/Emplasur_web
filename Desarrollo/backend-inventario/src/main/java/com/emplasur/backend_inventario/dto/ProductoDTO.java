package com.emplasur.backend_inventario.dto;

import java.util.List;

import lombok.Data;

@Data
public class ProductoDTO {
    private String code;
    private String name;
    private String cat;
    private Double cost;
    private Double price;
    private Integer minUnits;
    private Integer looseUnits;
    private List<LoteDTO> lots; // Array de lotes

    @Data
    public static class LoteDTO {
        private Integer size;
        private Integer packs;
    }
}