package com.emplasur.backend_inventario.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public List<Venta> listar(
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta
    ) {
        if (desde != null && hasta != null) {
            // Convertir String "yyyy-MM-dd" a fechas completas
            LocalDate d = LocalDate.parse(desde);
            LocalDate h = LocalDate.parse(hasta);
            return ventaService.listarVentasPorFecha(
                    d.atStartOfDay(), 
                    h.atTime(23, 59, 59)
            );
        }
        return ventaService.listarVentas();
    }
}