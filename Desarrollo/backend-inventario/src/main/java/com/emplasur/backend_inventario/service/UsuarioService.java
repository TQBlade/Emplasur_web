package com.emplasur.backend_inventario.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.emplasur.backend_inventario.entity.Usuario;
import com.emplasur.backend_inventario.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Método para validar credenciales (Login)
    public Usuario login(String username, String password) {
        // 1. Buscamos el usuario por su username
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);

        // 2. Si el usuario existe, verificamos la contraseña
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            // OJO: En un sistema real, aquí usaríamos encriptación (BCrypt). 
            // Por ahora comparamos texto plano para que te funcione rápido.
            if (usuario.getPassword().equals(password)) {
                return usuario; // ¡Login exitoso! Devolvemos el usuario
            }
        }
        return null; // Login fallido
    }
    
    // Método auxiliar para crear usuarios (para pruebas o registro futuro)
    public Usuario registrar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
}