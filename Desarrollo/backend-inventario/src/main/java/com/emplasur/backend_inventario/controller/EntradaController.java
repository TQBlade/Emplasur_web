package com.emplasur.backend_inventario.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.emplasur.backend_inventario.dto.EntradaDTO;
import com.emplasur.backend_inventario.service.EntradaService;

@RestController
@RequestMapping("/api/entradas")
@CrossOrigin(origins = "*")
public class EntradaController {

    @Autowired
    private EntradaService entradaService;

    @PostMapping
    public ResponseEntity<?> registrarEntrada(@RequestBody EntradaDTO dto) {
        try {
            return ResponseEntity.ok(entradaService.registrarEntrada(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}