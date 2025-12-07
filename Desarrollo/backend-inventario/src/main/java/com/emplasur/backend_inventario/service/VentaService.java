package com.emplasur.backend_inventario.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.emplasur.backend_inventario.dto.VentaDTO;
import com.emplasur.backend_inventario.entity.Cliente;
import com.emplasur.backend_inventario.entity.Lote;
import com.emplasur.backend_inventario.entity.Producto;
import com.emplasur.backend_inventario.entity.Venta;
import com.emplasur.backend_inventario.repository.ClienteRepository;
import com.emplasur.backend_inventario.repository.ProductoRepository;
import com.emplasur.backend_inventario.repository.UsuarioRepository;
import com.emplasur.backend_inventario.repository.VentaRepository;

import jakarta.transaction.Transactional;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private ClienteRepository clienteRepository; // Asegúrate de tener esto

@Transactional
    public Venta registrarVenta(VentaDTO ventaDTO) {
        // 1. Buscar Producto
        Producto producto = productoRepository.findById(ventaDTO.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        // 2. Validar Stock
        if (producto.getTotalUnidades() < ventaDTO.getCantidad()) {
            throw new RuntimeException("Stock insuficiente");
        }

        // 3. FIFO (Descontar inventario)
        int restante = ventaDTO.getCantidad();
        int tomarSueltas = Math.min(restante, producto.getUnidadesSueltas());
        producto.setUnidadesSueltas(producto.getUnidadesSueltas() - tomarSueltas);
        restante -= tomarSueltas;

        if (restante > 0) {
            for (Lote lote : producto.getLotes()) {
                while (restante > 0 && lote.getCantidadPacas() > 0) {
                    if (restante >= lote.getTamanoPaca()) {
                        lote.setCantidadPacas(lote.getCantidadPacas() - 1);
                        restante -= lote.getTamanoPaca();
                    } else {
                        lote.setCantidadPacas(lote.getCantidadPacas() - 1);
                        int sobrante = lote.getTamanoPaca() - restante;
                        producto.setUnidadesSueltas(producto.getUnidadesSueltas() + sobrante);
                        restante = 0;
                    }
                }
                if (restante == 0) break;
            }
        }
        
        producto.getLotes().removeIf(l -> l.getCantidadPacas() <= 0);
        productoRepository.save(producto);

        // 4. Crear Venta
        Venta venta = new Venta();
        venta.setProducto(producto);
        venta.setUsuario(usuarioRepository.findById(ventaDTO.getUsuarioId()).orElse(null));
        venta.setCantidad(ventaDTO.getCantidad());
        
        // --- CÁLCULOS FINANCIEROS (ESTO ES LO QUE FALLABA) ---
        
        // A. Precio de Venta (Usar el personalizado o el base)
        double precioVentaFinal = producto.getPrecioUnitario();
        if (ventaDTO.getPrecioVenta() != null && ventaDTO.getPrecioVenta() > 0) {
            precioVentaFinal = ventaDTO.getPrecioVenta();
        }
        venta.setTotalVenta(precioVentaFinal * ventaDTO.getCantidad());
        
        // B. Costo Total (CRÍTICO: Validar nulos)
        double costoUnitario = (producto.getCosto() != null) ? producto.getCosto() : 0.0;
        double costoTotalCalculado = costoUnitario * ventaDTO.getCantidad();
        venta.setCostoTotal(costoTotalCalculado); // <--- Guardamos explícitamente

        // C. Ganancia (CRÍTICO: Venta - Costo)
        double gananciaCalculada = venta.getTotalVenta() - costoTotalCalculado;
        venta.setGanancia(gananciaCalculada); // <--- Guardamos explícitamente
        
        // -----------------------------------------------------
        
        // Cliente
        if (ventaDTO.getClienteId() != null) {
            Cliente cliente = clienteRepository.findById(ventaDTO.getClienteId()).orElse(null);
            venta.setCliente(cliente);
        }

        return ventaRepository.save(venta);
    }

    public List<Venta> listarVentasPorFecha(LocalDateTime inicio, LocalDateTime fin) {
        if (inicio == null || fin == null) return ventaRepository.findAll();
        return ventaRepository.findByFechaBetween(inicio, fin);
    }

    public List<Venta> listarVentas() {
        return ventaRepository.findAll();
    }
}