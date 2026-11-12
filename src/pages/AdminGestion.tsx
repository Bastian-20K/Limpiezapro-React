import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Estructuras de datos
interface Empleado {
    id: string;
    nombre: string;
    ocupado: boolean;
}

interface Solicitud {
    id: string;
    fecha: string;
    cliente: string;
    zona: string;
    estado: 'En proceso de validación' | 'En marcha' | 'Terminada' | 'Rechazada' | 'Cancelada';
    detalles: string[];
    valor: number; // Necesario para enviarlo a los reportes cuando termine
    empleadosAsignados: string[];
}

export const AdminGestion = () => {
    const navigate = useNavigate();

    // Estados principales
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    
    // Estados para el Modal
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
    const [estadoEdit, setEstadoEdit] = useState<Solicitud['estado']>('En proceso de validación');
    const [empleadosEdit, setEmpleadosEdit] = useState<string[]>([]);

    useEffect(() => {
        // 1. Cargar Empleados de prueba
        const empleadosBase: Empleado[] = [
            { id: 'EMP-1', nombre: 'Carlos Ruiz', ocupado: false },
            { id: 'EMP-2', nombre: 'Ana Gómez', ocupado: false },
            { id: 'EMP-3', nombre: 'Luis Soto', ocupado: true },
            { id: 'EMP-4', nombre: 'Marta Pérez', ocupado: false },
        ];
        setEmpleados(empleadosBase);

        // 2. Cargar Solicitudes
        const solicitudesGuardadas = localStorage.getItem('solicitudesAdmin');
        if (solicitudesGuardadas) {
            setSolicitudes(JSON.parse(solicitudesGuardadas));
        } else {
            // DATOS DE PRUEBA: Si está vacío, cargamos estas solicitudes
            const solicitudesPrueba: Solicitud[] = [
                { id: 'SOL-101', fecha: '2026-11-10', cliente: 'Juan Pérez', zona: 'Providencia', estado: 'En proceso de validación', detalles: ['Limpieza Profunda', 'Casa 3 Habitaciones'], valor: 45000, empleadosAsignados: [] },
                { id: 'SOL-102', fecha: '2026-11-11', cliente: 'Empresa Alfa', zona: 'Las Condes', estado: 'En marcha', detalles: ['Mantención Oficina', 'Insumos incluidos'], valor: 120000, empleadosAsignados: ['EMP-1'] }
            ];
            setSolicitudes(solicitudesPrueba);
            localStorage.setItem('solicitudesAdmin', JSON.stringify(solicitudesPrueba));
        }
    }, []);

    // Preparar el modal al hacer clic en "Gestionar"
    const abrirModal = (solicitud: Solicitud) => {
        setSolicitudSeleccionada(solicitud);
        setEstadoEdit(solicitud.estado);
        setEmpleadosEdit([...solicitud.empleadosAsignados]);
    };

    // Manejar checkboxes de empleados
    const toggleEmpleado = (empId: string) => {
        if (empleadosEdit.includes(empId)) {
            setEmpleadosEdit(empleadosEdit.filter(id => id !== empId));
        } else {
            setEmpleadosEdit([...empleadosEdit, empId]);
        }
    };

    // Guardar los cambios del modal
    const guardarCambios = (e: React.FormEvent) => {
        e.preventDefault();
        if (!solicitudSeleccionada) return;

        // 1. Actualizar la lista de solicitudes
        const nuevasSolicitudes = solicitudes.map(sol => 
            sol.id === solicitudSeleccionada.id 
                ? { ...sol, estado: estadoEdit, empleadosAsignados: empleadosEdit }
                : sol
        );
        
        setSolicitudes(nuevasSolicitudes);
        localStorage.setItem('solicitudesAdmin', JSON.stringify(nuevasSolicitudes));

        // 2. MAGIA: Si se marca como "Terminada", lo enviamos a los Reportes KPI
        if (estadoEdit === 'Terminada' && solicitudSeleccionada.estado !== 'Terminada') {
            const historialGuardado = localStorage.getItem('historialServicios');
            const historial = historialGuardado ? JSON.parse(historialGuardado) : [];
            
            historial.push({
                id: solicitudSeleccionada.id.replace('SOL-', ''), // Quitamos el prefijo para la tabla de reportes
                fecha: solicitudSeleccionada.fecha,
                cliente: solicitudSeleccionada.cliente,
                zona: solicitudSeleccionada.zona,
                servicio: solicitudSeleccionada.detalles.join(' + '),
                valor: solicitudSeleccionada.valor
            });
            
            localStorage.setItem('historialServicios', JSON.stringify(historial));
        }

        // 3. Cerrar el modal limpiamente
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        const modal = document.getElementById('modalGestion');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    };

    return (
        <div className="bg-light min-vh-100">
            {/* NAV BAR */}
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
                            <li className="nav-item"><span className="nav-link text-white-50" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-autoriza')}>Autorizar</span></li>
                            <li className="nav-item"><span className="nav-link text-white active" style={{ cursor: 'pointer' }}>Gestionar</span></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container py-4">
                <h2 className="fw-bold text-primary mb-4">Gestión Operativa de Solicitudes</h2>

                {/* TABLA DE SOLICITUDES */}
                <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-primary text-white">
                                    <tr>
                                        <th className="p-3">ID Solicitud</th>
                                        <th>Fecha</th>
                                        <th>Cliente</th>
                                        <th>Zona</th>
                                        <th>Estado</th>
                                        <th className="text-end p-3">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {solicitudes.length > 0 ? (
                                        solicitudes.map((sol) => (
                                            <tr key={sol.id}>
                                                <td className="p-3 fw-bold text-primary">{sol.id}</td>
                                                <td>{sol.fecha}</td>
                                                <td>{sol.cliente}</td>
                                                <td>{sol.zona}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        sol.estado === 'Terminada' ? 'bg-success' :
                                                        sol.estado === 'En marcha' ? 'bg-info text-dark' :
                                                        sol.estado === 'Rechazada' || sol.estado === 'Cancelada' ? 'bg-danger' : 'bg-secondary'
                                                    }`}>
                                                        {sol.estado}
                                                    </span>
                                                </td>
                                                <td className="text-end p-3">
                                                    <button
                                                        onClick={() => abrirModal(sol)}
                                                        className="btn btn-sm btn-outline-primary fw-bold"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#modalGestion"
                                                    >
                                                        {sol.estado === 'Terminada' ? 'Ver Detalles' : 'Gestionar'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center p-4 text-muted">
                                                No hay solicitudes pendientes de gestión.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE GESTIÓN */}
            <div className="modal fade" id="modalGestion" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title fw-bold">Gestionar Solicitud {solicitudSeleccionada?.id}</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <p className="mb-1 text-muted small">Cliente</p>
                                    <h6 className="fw-bold">{solicitudSeleccionada?.cliente}</h6>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1 text-muted small">Zona / Comuna</p>
                                    <h6 className="fw-bold">{solicitudSeleccionada?.zona}</h6>
                                </div>
                            </div>
                            
                            <div className="bg-light p-3 rounded border mb-4">
                                <h6 className="fw-bold text-primary mb-2">Detalle del Servicio</h6>
                                <ul className="list-unstyled mb-0 small">
                                    {solicitudSeleccionada?.detalles.map((detalle, idx) => (
                                        <li key={idx}><i className="fa-solid fa-check text-success me-2"></i>{detalle}</li>
                                    ))}
                                    <li className="mt-2 text-primary fw-bold">Valor Total: {solicitudSeleccionada?.valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</li>
                                </ul>
                            </div>

                            <form onSubmit={guardarCambios}>
                                {/* SECCIÓN DE EMPLEADOS */}
                                <div className="mb-4">
                                    <h6 className="fw-bold text-success border-bottom pb-2">Asignar Empleados Disponibles</h6>
                                    <p className="small text-muted mb-2">Selecciona al personal para esta solicitud. Los ocupados aparecen deshabilitados.</p>
                                    <div className="row g-2">
                                        {empleados.map(emp => {
                                            const isChecked = empleadosEdit.includes(emp.id);
                                            // Deshabilitar si está ocupado y NO está asignado a esta misma solicitud
                                            const isDisabled = emp.ocupado && !isChecked;
                                            
                                            return (
                                                <div className="col-md-6" key={emp.id}>
                                                    <div className={`form-check p-2 border rounded ${isChecked ? 'bg-success text-white border-success' : 'bg-white'}`}>
                                                        <input
                                                            className="form-check-input ms-1"
                                                            type="checkbox"
                                                            id={`emp-${emp.id}`}
                                                            checked={isChecked}
                                                            onChange={() => toggleEmpleado(emp.id)}
                                                            disabled={isDisabled || solicitudSeleccionada?.estado === 'Terminada'}
                                                        />
                                                        <label className="form-check-label ms-2 w-100" htmlFor={`emp-${emp.id}`}>
                                                            {emp.nombre} {isDisabled && '(Ocupado)'}
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* SECCIÓN DE ESTADO */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Cambiar Estado de Solicitud</label>
                                    <select
                                        value={estadoEdit}
                                        onChange={(e) => setEstadoEdit(e.target.value as Solicitud['estado'])}
                                        className="form-select border-primary"
                                        disabled={solicitudSeleccionada?.estado === 'Terminada'}
                                        required
                                    >
                                        <option value="En proceso de validación">En proceso de validación</option>
                                        <option value="En marcha">En marcha (Asignar Empleados)</option>
                                        <option value="Terminada">Terminada (Irreversible)</option>
                                        <option value="Rechazada">Rechazada</option>
                                        <option value="Cancelada">Cancelada</option>
                                    </select>
                                    
                                    {estadoEdit === 'Terminada' && (
                                        <div className="form-text text-danger mt-2 fw-bold">
                                            <i className="fa-solid fa-triangle-exclamation me-1"></i> Al guardar como "Terminada", este servicio se enviará a Reportes y ya no podrá editarse.
                                        </div>
                                    )}
                                </div>

                                <div className="text-end">
                                    <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
                                    {solicitudSeleccionada?.estado !== 'Terminada' && (
                                        <button type="submit" className="btn btn-primary fw-bold">Guardar Cambios</button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};