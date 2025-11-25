package com.emplasur.backend_inventario.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.emplasur.backend_inventario.entity.Producto;
import com.emplasur.backend_inventario.service.ProductoService;

@RestController
@RequestMapping("/api/productos") // Esta será la URL base
@CrossOrigin(origins = "*") // IMPORTANTE: Permite que tu HTML se conecte sin bloqueos
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    // GET: Traer todos los productos
    // URL: http://localhost:8080/api/productos
    @GetMapping
    public List<Producto> listar() {
        return productoService.listarProductos();
    }

    // POST: Guardar un nuevo producto
    @PostMapping
    public Producto guardar(@RequestBody Producto producto) {
        return productoService.guardarProducto(producto);
    }

    // DELETE: Borrar un producto por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }
}