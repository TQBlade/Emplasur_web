package com.emplasur.backend_inventario.service;

import com.emplasur.backend_inventario.dto.VentaDTO;
import com.emplasur.backend_inventario.entity.Cliente;
import com.emplasur.backend_inventario.entity.Producto;
import com.emplasur.backend_inventario.entity.Usuario;
import com.emplasur.backend_inventario.entity.Venta;
import com.emplasur.backend_inventario.repository.ClienteRepository;
import com.emplasur.backend_inventario.repository.ProductoRepository;
import com.emplasur.backend_inventario.repository.UsuarioRepository;
import com.emplasur.backend_inventario.repository.VentaRepository;
import jakarta.transaction.Transactional; // ¡Importante para consistencia de datos!
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
    @Transactional // Si algo falla en medio, deshace todos los cambios (seguridad de datos)
    public Venta registrarVenta(VentaDTO ventaDTO) {
        
        // 1. Buscar el producto
        Producto producto = productoRepository.findById(ventaDTO.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // 2. Buscar el usuario (vendedor)
        Usuario usuario = usuarioRepository.findById(ventaDTO.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 3. Validar Stock
        if (producto.getStockActual() < ventaDTO.getCantidad()) {
            throw new RuntimeException("Stock insuficiente. Solo quedan " + producto.getStockActual() + " unidades.");
        }

        // 4. Calcular totales
        Double total = producto.getPrecioUnitario() * ventaDTO.getCantidad();

        // 5. Crear la Venta
        Venta venta = new Venta();
        venta.setProducto(producto);
        venta.setUsuario(usuario);
        venta.setCantidad(ventaDTO.getCantidad());
        venta.setTotalVenta(total);

        // 6. Asignar cliente si existe
        if (ventaDTO.getClienteId() != null) {
            Cliente cliente = clienteRepository.findById(ventaDTO.getClienteId()).orElse(null);
            venta.setCliente(cliente);
        }

        // 7. ACTUALIZAR EL STOCK (Aquí restamos)
        producto.setStockActual(producto.getStockActual() - ventaDTO.getCantidad());
        
        // 8. Verificar estado (Opcional: Si llega a 0, marcar como Agotado)
        if (producto.getStockActual() == 0) {
            producto.setEstado("Agotado");
        } else if (producto.getStockActual() <= producto.getStockMinimo()) {
            producto.setEstado("Stock Bajo");
        }

        // 9. Guardar todo
        productoRepository.save(producto); // Guardamos el producto con el nuevo stock
        return ventaRepository.save(venta); // Guardamos la venta y la retornamos
    }

    // Listar historial de ventas
    public List<Venta> listarVentas() {
        return ventaRepository.findAll();
    }
}