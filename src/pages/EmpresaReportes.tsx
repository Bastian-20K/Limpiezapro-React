import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface EspacioCorporativo {
    id: string;
    nombre: string;
    metros: number;
    observaciones?: string;
}

interface ContratoEmpresa {
    id: string;
    fecha: string;
    empresa: string;
    zona: string;
    totalMetros: number;
    espacios?: EspacioCorporativo[];
    total: number;
    metodoPago: 'Total' | 'Pie y Cuotas';
    cuotas: number;
    piePagado: number;
    saldo: number;
    cuotasPagadas?: number;
    estado: string;
}

interface SolicitudAdmin {
    id: string;
    estado: string;
}

export const EmpresaReportes = () => {
    const navigate = useNavigate();
    const [reportesEmpresa, setReportesEmpresa] = useState<ContratoEmpresa[]>([]);
    const [facturaSeleccionada, setFacturaSeleccionada] = useState<ContratoEmpresa | null>(null);

    useEffect(() => {
        const empresaActiva = (localStorage.getItem('empresaActiva') || localStorage.getItem('usuarioActivo') || '').toLowerCase();
        const contratosGuardados = localStorage.getItem('contratosEmpresa');
        const solicitudesAdminGuardadas = localStorage.getItem('solicitudesAdmin');

        const listaAdmin: SolicitudAdmin[] = solicitudesAdminGuardadas ? JSON.parse(solicitudesAdminGuardadas) : [];

        if (contratosGuardados) {
            const lista: ContratoEmpresa[] = JSON.parse(contratosGuardados);
            
            
            const deLaEmpresa = lista
                .filter(c => !c.empresa || c.empresa.toLowerCase() === empresaActiva)
                .map(c => {
                    const enAdmin = listaAdmin.find(s => s.id === c.id);
                    return {
                        ...c,
                        estado: enAdmin ? enAdmin.estado : c.estado
                    };
                });

            setReportesEmpresa(deLaEmpresa);
        }
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

    return (
        <div className="bg-light min-vh-100">
            {/* NAV BAR */}
            <nav className="navbar navbar-expand-lg custom-navbar shadow-sm no-print">
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
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <h2 className="color-cian fw-bold mb-0">
                        <i className="fa-solid fa-file-invoice me-2"></i>Historial y Facturación
                    </h2>
                    <button onClick={() => window.print()} className="btn btn-cian text-white fw-bold no-print shadow-sm">
                        🖨️ Exportar Balance General
                    </button>
                </div>

                {/* TABLA DE ÓRDENES DE TRABAJO */}
                <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="bg-cian-claro color-cian">
                                    <tr>
                                        <th className="px-4 py-3">Orden (OT)</th>
                                        <th className="py-3">Emisión</th>
                                        <th className="py-3">Detalle</th>
                                        <th className="py-3">Monto Neto</th>
                                        <th className="py-3">Estado</th>
                                        <th className="px-4 py-3 text-end no-print">Comprobante</th>
                                    </tr>
                                </thead>
                                <tbody id="tablaReportesEmpresa">
                                    {reportesEmpresa.length > 0 ? (
                                        reportesEmpresa.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 fw-bold text-primary">#{item.id}</td>
                                                <td>{item.fecha}</td>
                                                <td>
                                                    <div className="fw-bold text-secondary">{item.zona}</div>
                                                    <small className="text-muted">Superficie total: {item.totalMetros} m²</small>
                                                </td>
                                                <td className="fw-bold text-success">
                                                    {item.total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                                </td>
                                                <td>
                                                    <span className={`badge ${getBadgeClass(item.estado)}`}>
                                                        {item.estado || 'En proceso de validación'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-end no-print">
                                                    <button
                                                        onClick={() => setFacturaSeleccionada(item)}
                                                        className="btn btn-sm btn-outline-info fw-bold"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#modalFactura"
                                                    >
                                                        Ver Factura / OT
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center p-5 text-muted">
                                                <i className="fa-solid fa-folder-open fa-2x mb-2 d-block"></i>
                                                Tu empresa aún no registra órdenes de trabajo ni facturación.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL FACTURA / COMPROBANTE CORPORATIVO */}
            <div className="modal fade" id="modalFactura" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header bg-cian-claro">
                            <h5 className="modal-title color-cian fw-bold">Comprobante de Servicio</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body" id="cuerpoFactura">
                            {facturaSeleccionada ? (
                                <div className="p-2">
                                    <div className="text-center mb-3">
                                        <h4 className="fw-bold color-cian mb-1">LimpiezaPro Corporativo</h4>
                                        <small className="text-muted">Orden de Trabajo y Resumen Tributario</small>
                                    </div>
                                    <hr />
                                    <ul className="list-group list-group-flush mb-3 small">
                                        <li className="list-group-item d-flex justify-content-between px-0">
                                            <span className="text-muted">Orden de Trabajo (OT):</span>
                                            <strong className="text-primary">#{facturaSeleccionada.id}</strong>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between px-0">
                                            <span className="text-muted">Fecha de Emisión:</span>
                                            <span>{facturaSeleccionada.fecha}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between px-0">
                                            <span className="text-muted">Comuna / Instalaciones:</span>
                                            <span>{facturaSeleccionada.zona} ({facturaSeleccionada.totalMetros} m²)</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between px-0">
                                            <span className="text-muted">Modalidad de Pago:</span>
                                            <span>
                                                {facturaSeleccionada.metodoPago === 'Pie y Cuotas'
                                                    ? `Línea de Crédito (${facturaSeleccionada.cuotas} cuotas)`
                                                    : 'Pago Completo Inmediato'}
                                            </span>
                                        </li>
                                    </ul>

                                    {facturaSeleccionada.espacios && facturaSeleccionada.espacios.length > 0 && (
                                        <div className="bg-light p-2 rounded border mb-3 small">
                                            <strong className="d-block mb-1 text-secondary">Áreas Incluidas:</strong>
                                            <ul className="list-unstyled mb-0 text-muted">
                                                {facturaSeleccionada.espacios.map((esp, idx) => (
                                                    <li key={idx}>• {esp.nombre || 'Espacio'}: {esp.metros} m²</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded border mb-3">
                                        <span className="fw-bold">Total Servicio:</span>
                                        <strong className="text-success fs-5">
                                            {facturaSeleccionada.total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                        </strong>
                                    </div>

                                    <div className="alert alert-info py-2 text-center small mb-0">
                                        Estado operativo: <strong>{facturaSeleccionada.estado || 'En proceso de validación'}</strong>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted text-center py-3">Cargando detalle de factura...</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" onClick={() => window.print()} className="btn btn-azul text-white fw-bold">
                                Imprimir Factura
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};