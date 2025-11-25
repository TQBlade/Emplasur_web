package com.emplasur.backend_inventario.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.emplasur.backend_inventario.dto.VentaDTO;
import com.emplasur.backend_inventario.entity.Venta;
import com.emplasur.backend_inventario.service.VentaService;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    // POST: Registrar nueva venta
    @PostMapping
    public ResponseEntity<?> registrar(@RequestBody VentaDTO ventaDTO) {
        try {
            Venta nuevaVenta = ventaService.registrarVenta(ventaDTO);
            return ResponseEntity.ok(nuevaVenta);
        } catch (RuntimeException e) {
            // Si falta stock o producto, devolvemos error 400 (Bad Request)
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET: Ver historial
    @GetMapping
    public List<Venta> listar() {
        return ventaService.listarVentas();
    }
}