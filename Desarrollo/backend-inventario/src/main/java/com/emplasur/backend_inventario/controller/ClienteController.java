package com.emplasur.backend_inventario.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.emplasur.backend_inventario.entity.Cliente;
import com.emplasur.backend_inventario.repository.ClienteRepository;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    // Listar todos
    @GetMapping
    public List<Cliente> listar() {
        return clienteRepository.findAll();
    }

    // Buscar por documento (Para el formulario de ventas)
   // Buscar por documento (Coincidencias parciales)
    @GetMapping("/buscar/{documento}")
    public ResponseEntity<List<Cliente>> buscarPorDocumento(@PathVariable String documento) {
        List<Cliente> clientes = clienteRepository.findByDocumentoContaining(documento);
        if (clientes.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(clientes);
    }

    // Guardar nuevo cliente
    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Cliente cliente) {
        if (clienteRepository.existsByDocumento(cliente.getDocumento())) {
            return ResponseEntity.badRequest().body("Ya existe un cliente con ese documento.");
        }
        return ResponseEntity.ok(clienteRepository.save(cliente));
    }
    
    // Editar cliente
    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @RequestBody Cliente clienteDetails) {
        return clienteRepository.findById(id).map(cliente -> {
            cliente.setDocumento(clienteDetails.getDocumento());
            cliente.setPrimerNombre(clienteDetails.getPrimerNombre());
            cliente.setSegundoNombre(clienteDetails.getSegundoNombre());
            cliente.setPrimerApellido(clienteDetails.getPrimerApellido());
            cliente.setSegundoApellido(clienteDetails.getSegundoApellido());
            cliente.setTelefono(clienteDetails.getTelefono());
            cliente.setEmail(clienteDetails.getEmail());
            cliente.setDireccion(clienteDetails.getDireccion());
            return ResponseEntity.ok(clienteRepository.save(cliente));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Eliminar cliente
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        clienteRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}