package com.emplasur.backend_inventario.service;

import com.emplasur.backend_inventario.dto.EntradaDTO;
import com.emplasur.backend_inventario.entity.Entrada;
import com.emplasur.backend_inventario.entity.Lote;
import com.emplasur.backend_inventario.entity.Producto;
import com.emplasur.backend_inventario.repository.EntradaRepository;
import com.emplasur.backend_inventario.repository.ProductoRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EntradaService {

    @Autowired
    private EntradaRepository entradaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Transactional
    public Entrada registrarEntrada(EntradaDTO dto) {
        // 1. Buscar Producto
        Producto producto = productoRepository.findById(dto.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        int totalEntrante = 0;
        String detalleLog = "";

        // 2. Procesar Unidades Sueltas
        if (dto.getUnidadesSueltas() != null && dto.getUnidadesSueltas() > 0) {
            int actuales = producto.getUnidadesSueltas() != null ? producto.getUnidadesSueltas() : 0;
            producto.setUnidadesSueltas(actuales + dto.getUnidadesSueltas());
            totalEntrante += dto.getUnidadesSueltas();
            detalleLog += dto.getUnidadesSueltas() + " sueltas. ";
        }

        // 3. Procesar Pacas (Lotes)
        if (dto.getCantidadPacas() != null && dto.getCantidadPacas() > 0 && dto.getTamanoPaca() != null) {
            // Buscar si ya existe un lote con ese tamaño
            Optional<Lote> loteExistente = producto.getLotes().stream()
                    .filter(l -> l.getTamanoPaca().equals(dto.getTamanoPaca()))
                    .findFirst();

            if (loteExistente.isPresent()) {
                // Si existe, sumamos
                Lote lote = loteExistente.get();
                lote.setCantidadPacas(lote.getCantidadPacas() + dto.getCantidadPacas());
            } else {
                // Si no existe, creamos nuevo lote
                Lote nuevoLote = new Lote();
                nuevoLote.setTamanoPaca(dto.getTamanoPaca());
                nuevoLote.setCantidadPacas(dto.getCantidadPacas());
                nuevoLote.setProducto(producto);
                producto.getLotes().add(nuevoLote);
            }
            
            int unidadesLote = dto.getCantidadPacas() * dto.getTamanoPaca();
            totalEntrante += unidadesLote;
            detalleLog += dto.getCantidadPacas() + " pacas de " + dto.getTamanoPaca() + ". ";
        }

        // 4. Actualizar Costo (Si viene uno nuevo, actualizamos el precio de costo del producto)
        if (dto.getNuevoCosto() != null && dto.getNuevoCosto() > 0) {
            producto.setCosto(dto.getNuevoCosto());
        }

        // 5. Guardar Producto actualizado
        productoRepository.save(producto);

        // 6. Registrar en Historial
        Entrada entrada = new Entrada();
        entrada.setProducto(producto);
        entrada.setCantidadTotalUnidades(totalEntrante);
        entrada.setCostoUnitarioCompra(producto.getCosto());
        entrada.setDetalle(detalleLog.trim());

        return entradaRepository.save(entrada);
    }
}