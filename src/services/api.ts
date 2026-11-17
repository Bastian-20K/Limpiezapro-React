// src/services/api.ts
import axios from 'axios';

// Conexión al microservicio Catálogo (puerto 8086)
export const apiCatalogo = axios.create({
    baseURL: 'http://localhost:8086/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Conexión al microservicio Operación (puerto 8085)
export const apiOperacion = axios.create({
    baseURL: 'http://localhost:8085/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});