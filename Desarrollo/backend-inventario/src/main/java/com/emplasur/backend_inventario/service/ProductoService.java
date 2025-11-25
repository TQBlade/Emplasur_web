package com.emplasur.backend_inventario.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.emplasur.backend_inventario.entity.Producto;
import com.emplasur.backend_inventario.repository.ProductoRepository;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    // Obtener todos los productos
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    // Obtener un producto por ID
    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    // Guardar o Actualizar un producto
    public Producto guardarProducto(Producto producto) {
        // Aquí podríamos validar si el código ya existe, etc.
        return productoRepository.save(producto);
    }

    // Eliminar producto
    public void eliminarProducto(Long id) {
        productoRepository.deleteById(id);
    }
}