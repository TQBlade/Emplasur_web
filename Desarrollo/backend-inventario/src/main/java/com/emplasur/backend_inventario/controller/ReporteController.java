package com.emplasur.backend_inventario.controller;

import java.util.List; // <--- Cambio aquí

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.emplasur.backend_inventario.dto.BalanceFinancieroProjection;
import com.emplasur.backend_inventario.dto.TopProductoDTO;
import com.emplasur.backend_inventario.entity.Producto;
import com.emplasur.backend_inventario.service.ReporteService;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    @GetMapping("/top-productos")
    public List<TopProductoDTO> getTop() {
        return reporteService.getTopProductos();
    }

    @GetMapping("/sin-rotacion")
    public List<Producto> getSinRotacion() {
        return reporteService.getProductosSinRotacion();
    }

    @GetMapping("/balance-semanal")
    public List<BalanceFinancieroProjection> getBalance() { // <--- Cambio aquí
        return reporteService.getBalanceSemanal();
    }
}