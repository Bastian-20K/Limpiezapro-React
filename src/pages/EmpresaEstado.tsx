import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Solicitud {
    id: string;
    fecha: string;
    cliente: string;
    zona: string;
    estado: 'En proceso de validación' | 'En marcha' | 'Terminada' | 'Rechazada' | 'Cancelada';
    detalles: string[];
    valor: number;
    empleadosAsignados: string[];
}

export const EmpresaEstado = () => {
    const navigate = useNavigate();
    const [solicitudesEmpresa, setSolicitudesEmpresa] = useState<Solicitud[]>([]);

    useEffect(() => {
        const empresaActiva = (localStorage.getItem('empresaActiva') || localStorage.getItem('usuarioActivo') || '').toLowerCase();
        const solicitudesGuardadas = localStorage.getItem('solicitudesAdmin');

        if (solicitudesGuardadas) {
            const todas: Solicitud[] = JSON.parse(solicitudesGuardadas);
            // Filtrar solo las solicitudes correspondientes a la empresa en sesión
            const deLaEmpresa = todas.filter(sol => sol.cliente.toLowerCase() === empresaActiva);
            setSolicitudesEmpresa(deLaEmpresa);
        }
    }, []);

    const getBadgeClass = (estado: Solicitud['estado']) => {
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

    return (
        <div className="bg-light min-vh-100">
            {/* NAV BAR */}
            <nav className="navbar navbar-expand-lg custom-navbar shadow-sm">
                <div className="container">
                    <span className="navbar-brand text-white fw-bold" style={{ cursor: 'pointer' }} onClick={() => navigate('/empresa')}>
                        LimpiezaPro - Portal Corporativo
                    </span>
                    <div className="ms-auto">
                        <button onClick={() => navigate('/empresa')} className="btn btn-outline-light btn-sm fw-bold">
                            Volver al Panel
                        </button>
                    </div>
                </div>
            </nav>

            {/* CONTENIDO PRINCIPAL */}
            <div className="container py-5">
                <h2 className="mb-4 color-azul-claro fw-bold text-center">Estado de Solicitudes Corporativas</h2>
                
                <div className="row g-4" id="contenedorEstadosEmpresa">
                    {solicitudesEmpresa.length > 0 ? (
                        solicitudesEmpresa.map((sol) => (
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
                                            <i className="fa-solid fa-building me-2 text-info"></i>{sol.zona}
                                        </h6>
                                        <p className="text-muted small mb-3">Fecha de solicitud: {sol.fecha}</p>

                                        <div className="bg-light p-3 rounded mb-3 border">
                                            <strong className="d-block mb-2 text-dark small">Espacios y Metraje:</strong>
                                            <ul className="list-unstyled mb-0 small text-muted">
                                                {sol.detalles.map((det, idx) => (
                                                    <li key={idx}><i className="fa-solid fa-check text-success me-2"></i>{det}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        {sol.empleadosAsignados && sol.empleadosAsignados.length > 0 && (
                                            <div className="alert alert-info py-2 px-3 mb-0 small">
                                                <i className="fa-solid fa-users-gear me-2"></i>
                                                <strong>Equipo asignado:</strong> {sol.empleadosAsignados.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-footer bg-white border-top-0 pb-3 text-end">
                                        <span className="fw-bold text-success fs-5">
                                            {sol.valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <div className="p-5 bg-white rounded shadow-sm">
                                <i className="fa-solid fa-folder-open fa-3x text-muted mb-3"></i>
                                <h5>Tu empresa no tiene solicitudes activas</h5>
                                <p className="text-muted small">Cotiza y solicita un servicio corporativo para hacer seguimiento aquí.</p>
                                <button onClick={() => navigate('/empresa-contrata')} className="btn btn-cian text-white fw-bold mt-2">
                                    Solicitar Servicio Corporativo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};