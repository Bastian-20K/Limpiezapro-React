import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


interface Pago {
    id: string;
    cliente: string;
    monto: number;
    metodo: string;
    estado: 'Pagado' | 'Pendiente' | 'Rembolsado';
    motivoReembolso?: string;
    fechaReembolso?: string;
}

export const AdminAutoriza = () => {
    const navigate = useNavigate();

    // Estados
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [filtro, setFiltro] = useState('Todos');
    
    // Estados modales
    const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null);
    const [motivoReembolso, setMotivoReembolso] = useState('');

    
    useEffect(() => {
        const pagosGuardados = localStorage.getItem('pagosAdmin');
        if (pagosGuardados) {
            setPagos(JSON.parse(pagosGuardados));
        } else {
            // DATOS DE PRUEBA
            const pagosPrueba: Pago[] = [
                { id: 'PAY-001', cliente: 'Juan Pérez', monto: 45000, metodo: 'Transferencia', estado: 'Pendiente' },
                { id: 'PAY-002', cliente: 'Empresa Alfa', monto: 120000, metodo: 'Tarjeta de Crédito', estado: 'Pagado' },
                { id: 'PAY-003', cliente: 'María López', monto: 35000, metodo: 'Webpay', estado: 'Rembolsado', motivoReembolso: 'Cliente canceló el servicio con anticipación.', fechaReembolso: '10-11-2026' }
            ];
            setPagos(pagosPrueba);
            localStorage.setItem('pagosAdmin', JSON.stringify(pagosPrueba));
        }
    }, []);

    //guardar pago
    const actualizarPagos = (nuevosPagos: Pago[]) => {
        setPagos(nuevosPagos);
        localStorage.setItem('pagosAdmin', JSON.stringify(nuevosPagos));
    };

    // pendiente a pagado
    const handleAutorizar = (id: string) => {
        if (window.confirm('¿Confirmas que se recibió el dinero de esta solicitud?')) {
            const nuevosPagos = pagos.map(pago => 
                pago.id === id ? { ...pago, estado: 'Pagado' as const } : pago
            );
            actualizarPagos(nuevosPagos);
        }
    };

    // reembolso modal
    const procesarReembolso = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pagoSeleccionado || motivoReembolso.trim() === '') return;

        const fechaHoy = new Date().toLocaleDateString('es-CL');
        const nuevosPagos = pagos.map(pago => 
            pago.id === pagoSeleccionado.id 
                ? { ...pago, estado: 'Rembolsado' as const, motivoReembolso: motivoReembolso, fechaReembolso: fechaHoy } 
                : pago
        );
        
        actualizarPagos(nuevosPagos);
        setMotivoReembolso('');
        
        
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        const modal = document.getElementById('modalReembolso');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    };

    
    const pagosFiltrados = pagos.filter(pago => 
        filtro === 'Todos' ? true : pago.estado === filtro
    );

    return (
        <div className="bg-light min-vh-100">
            {/* NAVBAR (Con useNavigate) */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
                <div className="container">
                    <span className="navbar-brand fw-bold text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                        <i className="fa-solid fa-user-shield me-2 text-info"></i>AdminPro
                    </span>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAdmin">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNavAdmin">
                        <ul className="navbar-nav ms-auto align-items-center">
                            <li className="nav-item"><span className="nav-link text-white-50" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin')}>Inicio</span></li>
                            <li className="nav-item"><span className="nav-link text-white-50" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-reportes')}>Reporte</span></li>
                            <li className="nav-item"><span className="nav-link text-white-50" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-sucursales')}>Sucursales / RRHH</span></li>
                            <li className="nav-item"><span className="nav-link text-white active" style={{ cursor: 'pointer' }}>Autorizar</span></li>
                            <li className="nav-item"><span className="nav-link text-white-50" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-gestion')}>Gestionar</span></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold text-success mb-0">Panel de Autorizaciones y Pagos</h2>
                    
                    {/* FILTRO DINÁMICO */}
                    <div className="d-flex align-items-center">
                        <label className="fw-bold me-2 text-muted">Filtrar:</label>
                        <select 
                            value={filtro} 
                            onChange={(e) => setFiltro(e.target.value)} 
                            className="form-select border-success"
                        >
                            <option value="Todos">Todos los Estados</option>
                            <option value="Pagado">Solo Pagados</option>
                            <option value="Pendiente">Solo Pendientes</option>
                            <option value="Rembolsado">Solo Reembolsados</option>
                        </select>
                    </div>
                </div>

                {/* TABLA */}
                <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-success text-white">
                                    <tr>
                                        <th className="p-3">Solicitud</th>
                                        <th>Cliente</th>
                                        <th>Monto Total</th>
                                        <th>Método</th>
                                        <th>Estado de Pago</th>
                                        <th className="text-end p-3">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagosFiltrados.length > 0 ? (
                                        pagosFiltrados.map((pago) => (
                                            <tr key={pago.id}>
                                                <td className="p-3 fw-bold text-success">#{pago.id}</td>
                                                <td>{pago.cliente}</td>
                                                <td className="fw-bold">{pago.monto.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
                                                <td>{pago.metodo}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        pago.estado === 'Pagado' ? 'bg-success' : 
                                                        pago.estado === 'Pendiente' ? 'bg-warning text-dark' : 'bg-danger'
                                                    }`}>
                                                        {pago.estado}
                                                    </span>
                                                </td>
                                                <td className="text-end p-3">
                                                    {/* Botones dinámicos según el estado */}
                                                    {pago.estado === 'Pendiente' && (
                                                        <button onClick={() => handleAutorizar(pago.id)} className="btn btn-sm btn-outline-success fw-bold">
                                                            Autorizar
                                                        </button>
                                                    )}
                                                    {pago.estado === 'Pagado' && (
                                                        <button 
                                                            onClick={() => setPagoSeleccionado(pago)} 
                                                            className="btn btn-sm btn-outline-danger fw-bold"
                                                            data-bs-toggle="modal" 
                                                            data-bs-target="#modalReembolso"
                                                        >
                                                            Reembolsar
                                                        </button>
                                                    )}
                                                    {pago.estado === 'Rembolsado' && (
                                                        <button 
                                                            onClick={() => setPagoSeleccionado(pago)} 
                                                            className="btn btn-sm btn-secondary fw-bold"
                                                            data-bs-toggle="modal" 
                                                            data-bs-target="#modalDetalleReembolso"
                                                        >
                                                            Ver Detalle
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center p-4 text-muted">
                                                No hay pagos que coincidan con este filtro.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL REEMBOLSO */}
            <div className="modal fade" id="modalReembolso" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title fw-bold">Procesar Reembolso</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={procesarReembolso}>
                                <div className="alert alert-warning mb-3">
                                    <i className="fa-solid fa-circle-exclamation"></i> Estás a punto de reembolsar el dinero de la solicitud <strong>{pagoSeleccionado?.id}</strong>. Esta acción quedará registrada.
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Motivo del Reembolso</label>
                                    <textarea 
                                        value={motivoReembolso} 
                                        onChange={(e) => setMotivoReembolso(e.target.value)} 
                                        className="form-control border-danger" 
                                        rows={3} 
                                        placeholder="Ingresa el motivo detallado (ej: Insatisfacción del cliente, cancelación de servicio, etc.)" 
                                        required
                                    ></textarea>
                                </div>
                                <div className="text-end">
                                    <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
                                    <button type="submit" className="btn btn-danger fw-bold">Confirmar Reembolso</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DETALLE REEMBOLSO */}
            <div className="modal fade" id="modalDetalleReembolso" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header bg-secondary text-white">
                            <h5 className="modal-title fw-bold">Detalle de Reembolso</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item d-flex justify-content-between">
                                    <span className="text-muted">Fecha del Reembolso:</span>
                                    <strong>{pagoSeleccionado?.fechaReembolso}</strong>
                                </li>
                                <li className="list-group-item">
                                    <span className="text-muted d-block mb-1">Motivo Registrado:</span>
                                    <p className="mb-0 fw-bold">{pagoSeleccionado?.motivoReembolso}</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};