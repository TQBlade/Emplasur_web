package com.emplasur.backend_inventario;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class BackendInventarioApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendInventarioApplication.class, args);
	}

	@PostConstruct
    public void init(){
        // Configurar la zona horaria por defecto a Colombia
        TimeZone.setDefault(TimeZone.getTimeZone("America/Bogota"));
    }

}

