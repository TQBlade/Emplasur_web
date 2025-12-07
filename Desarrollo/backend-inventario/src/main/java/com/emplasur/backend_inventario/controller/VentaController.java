package com.emplasur.backend_inventario.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    /**
     * @param desde
     * @param hasta
     * @return
     */
    @GetMapping
    public List<Venta> listar(
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta
    ) {
        if (desde != null && hasta != null) {
            // Parsear fechas (yyyy-MM-dd)
            LocalDate fechaDesde = LocalDate.parse(desde);
            LocalDate fechaHasta = LocalDate.parse(hasta);

            // Crear rango: Desde el inicio del día 1 (00:00:00) hasta el final del día 2 (23:59:59)
            LocalDateTime inicio = fechaDesde.atStartOfDay();
            LocalDateTime fin = fechaHasta.atTime(23, 59, 59, 999999999);

            return ventaService.listarVentasPorFecha(inicio, fin);
        }
        // Si no hay filtro, devolver 
        return ventaService.listarVentas();
    }

    @PostMapping("/batch")
    public ResponseEntity<?> registrarLote(@RequestBody List<VentaDTO> ventasDTO) {
        try {
            // Ahora devuelve la lista de ventas (JSON), no un texto
            List<Venta> ventas = ventaService.registrarVentasEnLote(ventasDTO);
            return ResponseEntity.ok(ventas);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}   
