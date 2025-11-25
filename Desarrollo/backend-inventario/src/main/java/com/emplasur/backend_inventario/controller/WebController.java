package com.emplasur.backend_inventario.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller // OJO: Usa @Controller, NO @RestController
public class WebController {

    // Cuando entren a "localhost:8080/", mostramos el home
    @GetMapping("/")
    public String mostrarHome() {
        return "home"; // Busca "home.html" en templates
    }

    // Cuando entren a "localhost:8080/login"
    @GetMapping("/login")
    public String mostrarLogin() {
        return "login"; // Busca "login.html" en templates
    }

    // Cuando entren a "localhost:8080/inventario"
    @GetMapping("/inventario")
    public String mostrarInventario() {
        return "inventario"; // Busca "inventario.html" en templates
    }
    
    // Agrega aquí mappings para "nosotros", "contactanos", etc.
    @GetMapping("/nosotros")
    public String mostrarNosotros() {
        return "nosotros";
    }

    @GetMapping("/contactanos")
    public String mostrarContactanos() {
        return "contactanos";
    }
}