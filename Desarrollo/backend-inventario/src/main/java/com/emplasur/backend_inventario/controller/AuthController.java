package com.emplasur.backend_inventario.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.emplasur.backend_inventario.entity.Usuario;
import com.emplasur.backend_inventario.service.UsuarioService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Permite conexión desde tu HTML
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    // Endpoint: POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String username = credenciales.get("username");
        String password = credenciales.get("password");

        Usuario usuarioLogueado = usuarioService.login(username, password);

        if (usuarioLogueado != null) {
            // Si el login es correcto, respondemos con los datos del usuario y estado OK (200)
            return ResponseEntity.ok(usuarioLogueado);
        } else {
            // Si falla, devolvemos un error de "No Autorizado" (401)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas");
        }
    }
    
    // Endpoint auxiliar para crear el primer usuario desde Postman o código si lo necesitas
    @PostMapping("/registro")
    public Usuario registrar(@RequestBody Usuario usuario) {
        return usuarioService.registrar(usuario);
    }
}