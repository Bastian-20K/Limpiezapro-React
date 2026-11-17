import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiOperacion } from '../services/api';

interface DetalleArea {
    nombreArea: string;
    cantidad: number;
    subtotal: number;
}

interface SolicitudReporte {
    id: number;
    cliente: string;
    zona: string;
    tipoServicio: string;
    metodoPago: string;
    cuotasSeleccionadas: number;
    montoTotal: number;
    piePagado: number;
    estado: string;
    fechaCreacion: string;
    detallesAreas: DetalleArea[];
}

export const UsuarioReportes = () => {
    const navigate = useNavigate();
    const [misReportes, setMisReportes] = useState<SolicitudReporte[]>([]);
    const [contratoSeleccionado, setContratoSeleccionado] = useState<SolicitudReporte | null>(null);

    useEffect(() => {
        const cargarReportes = async () => {
            try {
                const clienteActivo = (localStorage.getItem('usuarioActivo') || '').toLowerCase();
                const response = await apiOperacion.get('/solicitudes');
                const lista: SolicitudReporte[] = response.data;

                const reportesDelUsuario = clienteActivo
                    ? lista.filter(c => c.cliente && c.cliente.toLowerCase() === clienteActivo)
                    : lista;

                setMisReportes(reportesDelUsuario);
            } catch (error) {
                console.error("Error al cargar reportes:", error);
            }
        };

        cargarReportes();
    }, []);

    const abrirComprobante = (contrato: SolicitudReporte) => {
        setContratoSeleccionado(contrato);
    };

    const formatearFecha = (fechaIso: string) => {
        if (!fechaIso) return '-';
        return new Date(fechaIso).toLocaleDateString('es-CL');
    };

    return (
        <div className="bg-light min-vh-100">
            {/* NAV BAR */}
            <nav className="navbar navbar-expand-lg custom-navbar shadow-sm no-print">
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

            {/* PRINCIPAL */}
            <div className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <h2 className="color-cian fw-bold mb-0">
                        <i className="fa-solid fa-receipt me-2"></i>Historial de Servicios
                    </h2>
                    <button className="btn btn-verde text-white fw-bold no-print shadow-sm" onClick={() => window.print()}>
                        <i className="fa-solid fa-print me-2"></i>Imprimir Reporte General
                    </button>
                </div>

                {/* TABLA DE REPORTES */}
                <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="bg-cian-claro color-cian">
                                    <tr>
                                        <th className="px-4 py-3">ID Solicitud</th>
                                        <th className="py-3">Fecha</th>
                                        <th className="py-3">Propiedad / Comuna</th>
                                        <th className="py-3">Monto Total</th>
                                        <th className="py-3">Estado</th>
                                        <th className="px-4 py-3 text-end no-print">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {misReportes.length > 0 ? (
                                        misReportes.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 fw-bold text-primary">#{item.id}</td>
                                                <td>{formatearFecha(item.fechaCreacion)}</td>
                                                <td>
                                                    <div className="fw-bold text-secondary">{item.tipoServicio}</div>
                                                    <small className="text-muted">{item.zona}</small>
                                                </td>
                                                <td className="fw-bold text-success">
                                                    {item.montoTotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        item.estado === 'Terminada' ? 'bg-success' :
                                                        item.estado === 'En marcha' ? 'bg-info text-dark' :
                                                        item.estado === 'Rechazada' ? 'bg-danger' : 'bg-warning text-dark'
                                                    }`}>
                                                        {item.estado || 'En proceso de validación'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-end no-print">
                                                    <button 
                                                        onClick={() => abrirComprobante(item)}
                                                        className="btn btn-sm btn-outline-primary fw-bold"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#modalComprobante"
                                                    >
                                                        Ver Comprobante
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center p-5 text-muted">
                                                <i className="fa-solid fa-file-circle-xmark fa-2x mb-2 d-block"></i>
                                                No registras servicios contratados aún.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL COMPROBANTE */}
            <div className="modal fade" id="modalComprobante" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header bg-verde-claro">
                            <h5 className="modal-title color-verde fw-bold">Comprobante de Servicio</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {contratoSeleccionado ? (
                                <div className="p-2">
                                    <div className="text-center mb-3">
                                        <h4 className="fw-bold text-success mb-1">LimpiezaPro</h4>
                                        <small className="text-muted">Ticket Oficial de Contratación</small>
                                    </div>
                                    <hr />
                                    <ul className="list-group list-group-flush mb-3">
                                        <li className="list-group-item d-flex justify-content-between px-0">
                                            <span className="text-muted">N° Solicitud:</span>
                                            <strong className="text-primary">#{contratoSeleccionado.id}</strong>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between px-0">
                                            <span className="text-muted">Fecha:</span>
                                            <span>{formatearFecha(contratoSeleccionado.fechaCreacion)}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between px-0">
                                            <span className="text-muted">Servicio / Zona:</span>
                                            <span>{contratoSeleccionado.tipoServicio} ({contratoSeleccionado.zona})</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between px-0">
                                            <span className="text-muted">Modalidad de Pago:</span>
                                            <span>
                                                {contratoSeleccionado.metodoPago}
                                                {contratoSeleccionado.metodoPago === 'Pie y Cuotas' ? ` (${contratoSeleccionado.cuotasSeleccionadas} cuotas)` : ''}
                                            </span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between px-0 bg-light p-2 mt-2 rounded">
                                            <span className="fw-bold">Total del Servicio:</span>
                                            <strong className="text-success fs-5">
                                                {contratoSeleccionado.montoTotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                            </strong>
                                        </li>
                                    </ul>
                                    <div className="alert alert-info py-2 text-center small mb-0">
                                        Estado actual: <strong>{contratoSeleccionado.estado}</strong>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted text-center py-3">Cargando detalles...</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" className="btn btn-azul text-white fw-bold" onClick={() => window.print()}>
                                Imprimir Ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};