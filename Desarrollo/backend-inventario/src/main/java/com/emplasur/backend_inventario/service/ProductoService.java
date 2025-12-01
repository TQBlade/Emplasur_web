package com.emplasur.backend_inventario.service;

import com.emplasur.backend_inventario.dto.ProductoDTO;
import com.emplasur.backend_inventario.entity.Lote;
import com.emplasur.backend_inventario.entity.Producto;
import com.emplasur.backend_inventario.repository.ProductoRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    // 1. Listar todos los productos (incluye sus lotes automáticamente gracias a JPA)
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    // 2. Obtener un producto por ID
    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    // 3. Obtener por código (Usado para verificar duplicados o editar)
    public Optional<Producto> obtenerPorCodigo(String codigo) {
        return productoRepository.findByCodigo(codigo);
    }

    // 4. GUARDAR O ACTUALIZAR (La lógica compleja)
    @Transactional
    public Producto guardarDesdeDTO(ProductoDTO dto) {
        // Buscamos si ya existe un producto con ese código
        Producto producto = productoRepository.findByCodigo(dto.getCode())
                .orElse(new Producto()); // Si no existe, creamos uno nuevo en memoria

        // Mapeamos los datos simples
        producto.setCodigo(dto.getCode());
        producto.setNombre(dto.getName());
        producto.setCategoria(dto.getCat());
        producto.setCosto(dto.getCost());
        producto.setPrecioUnitario(dto.getPrice());
        producto.setStockMinimo(dto.getMinUnits());
        producto.setUnidadesSueltas(dto.getLooseUnits());

        // GESTIÓN DE LOTES (PACAS)
        // Limpiamos los lotes anteriores para evitar duplicados o inconsistencias al editar
        producto.getLotes().clear();

        // Si el DTO trae lotes, los convertimos a Entidades y los agregamos
        if (dto.getLots() != null) {
            for (ProductoDTO.LoteDTO loteDto : dto.getLots()) {
                Lote lote = new Lote();
                lote.setTamanoPaca(loteDto.getSize());
                lote.setCantidadPacas(loteDto.getPacks());
                lote.setProducto(producto); // Vinculamos el lote al producto (Relación Bidireccional)
                
                // Agregamos a la lista del producto
                producto.getLotes().add(lote);
            }
        }

        // Guardamos todo en cascada (Producto + Lotes)
        return productoRepository.save(producto);
    }

    // 5. Eliminar producto
    public void eliminarProducto(Long id) {
        productoRepository.deleteById(id);
    }
}