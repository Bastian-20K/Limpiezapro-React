import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiOperacion } from '../services/api';

interface DetalleArea {
    nombreArea: string;
    cantidad: number;
    subtotal: number;
}

interface SolicitudBackend {
    id: number;
    cliente: string;
    zona: string;
    tipoServicio: string;
    metodoPago: string;
    cuotasSeleccionadas: number;
    montoTotal: number;
    piePagado: number;
    observaciones: string;
    estado: string;
    fechaCreacion: string;
    detallesAreas: DetalleArea[];
}

export const UsuarioEstado = () => {
    const navigate = useNavigate();
    const [misSolicitudes, setMisSolicitudes] = useState<SolicitudBackend[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarSolicitudes = async () => {
            try {
                const clienteActivo = (localStorage.getItem('usuarioActivo') || '').toLowerCase();
                const response = await apiOperacion.get('/solicitudes');
                const todas: SolicitudBackend[] = response.data;

                // Filtrar por el usuario logueado (si hay sesión activa)
                const delUsuario = clienteActivo
                    ? todas.filter(sol => sol.cliente && sol.cliente.toLowerCase() === clienteActivo)
                    : todas;

                setMisSolicitudes(delUsuario);
            } catch (error) {
                console.error("Error al cargar el estado de las solicitudes:", error);
            } finally {
                setCargando(false);
            }
        };

        cargarSolicitudes();
    }, []);

    const getBadgeClass = (estado: string) => {
        switch (estado) {
            case 'Terminada':
                return 'bg-success';
            case 'En marcha':
                return 'bg-info text-dark';
            case 'Rechazada':
            case 'Cancelada':
                return 'bg-danger';
            default:
                return 'bg-warning text-dark';
        }
    };

    const formatearFecha = (fechaIso: string) => {
        if (!fechaIso) return 'Fecha no disponible';
        return new Date(fechaIso).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-light min-vh-100">
            {/* NAV BAR */}
            <nav className="navbar navbar-expand-lg custom-navbar shadow-sm">
                <div className="container">
                    <span className="navbar-brand text-white fw-bold" style={{ cursor: 'pointer' }} onClick={() => navigate('/usuario')}>
                        LimpiezaPro - Portal Usuario
                    </span>
                    <div className="ms-auto">
                        <button onClick={() => navigate('/usuario')} className="btn btn-outline-light btn-sm fw-bold">
                            Volver al Panel
                        </button>
                    </div>
                </div>
            </nav>

            {/* CONTENIDO PRINCIPAL */}
            <div className="container py-5">
                <h2 className="mb-4 color-azul-claro fw-bold text-center">Estado de tus Solicitudes</h2>

                {cargando ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="text-muted mt-2">Consultando estado en el servidor...</p>
                    </div>
                ) : (
                    <div className="row g-4" id="contenedorEstados">
                        {misSolicitudes.length > 0 ? (
                            misSolicitudes.map((sol) => (
                                <div className="col-md-6 col-lg-4" key={sol.id}>
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom-0 pt-3">
                                            <span className="fw-bold text-primary">#{sol.id}</span>
                                            <span className={`badge ${getBadgeClass(sol.estado)}`}>
                                                {sol.estado}
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            <h6 className="card-title fw-bold text-secondary mb-1">
                                                <i className="fa-solid fa-location-dot me-2 text-danger"></i>{sol.zona} ({sol.tipoServicio})
                                            </h6>
                                            <p className="text-muted small mb-3">Solicitado el: {formatearFecha(sol.fechaCreacion)}</p>

                                            <div className="bg-light p-3 rounded mb-3 border">
                                                <strong className="d-block mb-2 text-dark small">Áreas Contratadas:</strong>
                                                <ul className="list-unstyled mb-0 small text-muted">
                                                    {sol.detallesAreas && sol.detallesAreas.length > 0 ? (
                                                        sol.detallesAreas.map((det, idx) => (
                                                            <li key={idx}>
                                                                <i className="fa-solid fa-check text-success me-2"></i>
                                                                {det.cantidad}x {det.nombreArea} ({det.subtotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })})
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li>Sin detalle de áreas</li>
                                                    )}
                                                </ul>
                                            </div>

                                            {sol.observaciones && sol.observaciones !== 'Sin observaciones' && (
                                                <p className="small text-muted mb-0">
                                                    <strong>Nota:</strong> {sol.observaciones}
                                                </p>
                                            )}
                                        </div>
                                        <div className="card-footer bg-white border-top-0 pb-3 text-end">
                                            <span className="fw-bold text-success fs-5">
                                                {sol.montoTotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5">
                                <div className="p-5 bg-white rounded shadow-sm">
                                    <i className="fa-solid fa-folder-open fa-3x text-muted mb-3"></i>
                                    <h5>No tienes solicitudes activas en este momento</h5>
                                    <p className="text-muted small">Contrata un servicio para ver el seguimiento del estado aquí.</p>
                                    <button onClick={() => navigate('/usuario-contrata')} className="btn btn-azul text-white fw-bold mt-2">
                                        Contratar Servicio
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};