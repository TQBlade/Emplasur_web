package com.emplasur.backend_inventario.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.emplasur.backend_inventario.dto.VentaDTO;
import com.emplasur.backend_inventario.entity.Lote;
import com.emplasur.backend_inventario.entity.Producto;
import com.emplasur.backend_inventario.entity.Venta;
import com.emplasur.backend_inventario.repository.ClienteRepository;
import com.emplasur.backend_inventario.repository.ProductoRepository;
import com.emplasur.backend_inventario.repository.UsuarioRepository;
import com.emplasur.backend_inventario.repository.VentaRepository;

import jakarta.transaction.Transactional; // ¡Importante para consistencia de datos!

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    // LÓGICA CORE: Registrar venta y descontar stock
    @Transactional
    public Venta registrarVenta(VentaDTO ventaDTO) {
        // 1. Buscar Producto
        Producto producto = productoRepository.findById(ventaDTO.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        // 2. Validar Stock Total
        if (producto.getTotalUnidades() < ventaDTO.getCantidad()) {
            throw new RuntimeException("Stock insuficiente");
        }

        // 3. LOGICA FIFO (Replica exacta de tu JS)
        int restante = ventaDTO.getCantidad();
        
        // A. Primero tomar unidades sueltas
        int tomarSueltas = Math.min(restante, producto.getUnidadesSueltas());
        producto.setUnidadesSueltas(producto.getUnidadesSueltas() - tomarSueltas);
        restante -= tomarSueltas;

        // B. Si falta, romper pacas
        if (restante > 0) {
            for (Lote lote : producto.getLotes()) {
                while (restante > 0 && lote.getCantidadPacas() > 0) {
                    if (restante >= lote.getTamanoPaca()) {
                        // Consumir paca entera
                        lote.setCantidadPacas(lote.getCantidadPacas() - 1);
                        restante -= lote.getTamanoPaca();
                    } else {
                        // Romper paca y pasar sobrante a sueltas
                        lote.setCantidadPacas(lote.getCantidadPacas() - 1);
                        int sobrante = lote.getTamanoPaca() - restante;
                        producto.setUnidadesSueltas(producto.getUnidadesSueltas() + sobrante);
                        restante = 0;
                    }
                }
                if (restante == 0) break;
            }
        }
        
        // Eliminar lotes vacíos (packs = 0)
        producto.getLotes().removeIf(l -> l.getCantidadPacas() <= 0);
        productoRepository.save(producto);

        // 4. Registrar Venta con datos financieros
        Venta venta = new Venta();
        venta.setProducto(producto);
        venta.setUsuario(usuarioRepository.findById(ventaDTO.getUsuarioId()).orElse(null));
        venta.setCantidad(ventaDTO.getCantidad());
        venta.setTotalVenta(producto.getPrecioUnitario() * ventaDTO.getCantidad());
        
        // Cálculos financieros
        double costoTotal = producto.getCosto() * ventaDTO.getCantidad();
        venta.setCostoTotal(costoTotal);
        venta.setGanancia(venta.getTotalVenta() - costoTotal);
        
        // Cliente y detalle (que ahora vienen en el DTO)
        // ... setear cliente y detalle ...

        return ventaRepository.save(venta);
    }   
}