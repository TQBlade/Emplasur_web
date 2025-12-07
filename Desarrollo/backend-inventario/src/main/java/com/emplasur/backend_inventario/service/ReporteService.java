package com.emplasur.backend_inventario.service;

import java.time.LocalDateTime; // <--- Cambio aquí
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.emplasur.backend_inventario.dto.BalanceFinancieroProjection;
import com.emplasur.backend_inventario.dto.TopProductoDTO;
import com.emplasur.backend_inventario.entity.Producto;
import com.emplasur.backend_inventario.repository.ProductoRepository;
import com.emplasur.backend_inventario.repository.VentaRepository;

@Service
public class ReporteService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    public List<TopProductoDTO> getTopProductos() {
        return ventaRepository.obtenerTopProductos();
    }

    public List<Producto> getProductosSinRotacion() {
        LocalDateTime hace30Dias = LocalDateTime.now().minusDays(30);
        return productoRepository.obtenerProductosSinRotacion(hace30Dias);
    }

    // CAMBIO DE TIPO DE RETORNO
    public List<BalanceFinancieroProjection> getBalanceSemanal() {
        LocalDateTime hace7Dias = LocalDateTime.now().minusDays(7);
        return ventaRepository.obtenerBalancePorDias(hace7Dias);
    }
}