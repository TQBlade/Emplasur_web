package com.emplasur.backend_inventario.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.emplasur.backend_inventario.dto.ProductoDTO;
import com.emplasur.backend_inventario.entity.Lote;
import com.emplasur.backend_inventario.entity.Producto;
import com.emplasur.backend_inventario.repository.ProductoRepository;

import jakarta.transaction.Transactional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    public void eliminarProducto(Long id) {
        productoRepository.deleteById(id);
    }

    // ESTE ES EL MÉTODO QUE TE FALTA O ESTÁ VACÍO
    @Transactional
    public Producto guardarDesdeDTO(ProductoDTO dto) {
        // 1. Buscar o crear
        Producto producto = productoRepository.findByCodigo(dto.getCode())
                .orElse(new Producto()); 

        // 2. Mapear datos
        producto.setCodigo(dto.getCode());
        producto.setNombre(dto.getName());
        producto.setCategoria(dto.getCat());
        producto.setCosto(dto.getCost());
        producto.setPrecioUnitario(dto.getPrice());
        producto.setStockMinimo(dto.getMinUnits());
        producto.setUnidadesSueltas(dto.getLooseUnits());

        // 3. Gestionar Lotes
        if (producto.getLotes() != null) {
            producto.getLotes().clear(); // Borrar anteriores para reescribir
        }
        
        if (dto.getLots() != null) {
            for (ProductoDTO.LoteDTO lDTO : dto.getLots()) {
                Lote lote = new Lote();
                lote.setTamanoPaca(lDTO.getSize());
                lote.setCantidadPacas(lDTO.getPacks());
                lote.setProducto(producto);
                producto.getLotes().add(lote);
            }
        }

        return productoRepository.save(producto);
    }
}