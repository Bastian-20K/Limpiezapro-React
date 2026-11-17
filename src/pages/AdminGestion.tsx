import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Empleado {
    id: string;
    nombre: string;
    estado: string;
}

interface Solicitud {
    id: string;
    fecha: string;
    cliente: string;
    zona: string;
    estado: string;
    detalles: string[];
    valor: number;
    observaciones?: string;
    imagenBase64?: string;
    empleadosAsignados: string[];
}

export const AdminGestion = () => {
    const navigate = useNavigate();

    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
    const [estadoEdit, setEstadoEdit] = useState<string>('En proceso de validación');
    const [empleadosEdit, setEmpleadosEdit] = useState<string[]>([]);

    const cargarSolicitudes = async () => {
        try {
            const response = await axios.get('http://localhost:8085/api/v1/solicitudes');
            const solicitudesBackend = response.data.map((sol: any) => ({
                id: sol.id.toString(),
                fecha: sol.fechaCreacion ? new Date(sol.fechaCreacion).toLocaleDateString('es-CL') : 'Sin fecha',
                cliente: sol.cliente || 'Cliente Particular',
                zona: sol.zona || 'Sin zona',
                estado: sol.estado || 'En proceso de validación',
                detalles: sol.detallesAreas ? sol.detallesAreas.map((d: any) => `${d.nombreArea} (x${d.cantidad})`) : [],
                valor: sol.montoTotal || 0,
                observaciones: sol.observaciones,
                imagenBase64: sol.imagenBase64,
                empleadosAsignados: []
            }));
            setSolicitudes(solicitudesBackend);
        } catch (error) {
            console.error("Error al cargar solicitudes desde la BD", error);
        }
    };

    const cargarEmpleados = async () => {
        try {
            const response = await axios.get('http://localhost:8085/api/v1/empleados');
            const empleadosBackend = response.data.map((emp: any) => ({
                ...emp,
                id: emp.id.toString()
            }));
            setEmpleados(empleadosBackend);
        } catch (error) {
            console.error("Error al cargar empleados desde la BD", error);
        }
    };

    useEffect(() => {
        cargarSolicitudes();
        cargarEmpleados();
    }, []);

    const abrirModal = (solicitud: Solicitud) => {
        setSolicitudSeleccionada(solicitud);
        setEstadoEdit(solicitud.estado);
        setEmpleadosEdit([...solicitud.empleadosAsignados]);
    };
    
    const toggleEmpleado = (empId: string) => {
        if (empleadosEdit.includes(empId)) {
            setEmpleadosEdit(empleadosEdit.filter(id => id !== empId));
        } else {
            setEmpleadosEdit([...empleadosEdit, empId]);
        }
    };

    const guardarCambios = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!solicitudSeleccionada) return;

        try {
            await axios.put(`http://localhost:8085/api/v1/solicitudes/${solicitudSeleccionada.id}/estado`, null, {
                params: { estado: estadoEdit }
            });

            let nuevoEstadoEmpleado = 'DISPONIBLE';
            if (estadoEdit === 'En marcha') {
                nuevoEstadoEmpleado = 'OCUPADO';
            }

            if (empleadosEdit.length > 0) {
                const promesasEmpleados = empleadosEdit.map(empId => 
                    axios.put(`http://localhost:8085/api/v1/empleados/${empId}/estado?estado=${nuevoEstadoEmpleado}`)
                );
                await Promise.all(promesasEmpleados);
            }

            await cargarSolicitudes();
            await cargarEmpleados();

            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
            const modal = document.getElementById('modalGestion');
            if (modal) {
                modal.classList.remove('show');
                modal.style.display = 'none';
            }
        } catch (error) {
            console.error("Error al actualizar gestión", error);
            alert("Hubo un error al actualizar la solicitud.");
        }
    };

    return (
        <div className="bg-light min-vh-100">
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
                                                <td className="p-3 fw-bold text-primary">#{sol.id}</td>
                                                <td>{sol.fecha}</td>
                                                <td>{sol.cliente}</td>
                                                <td>{sol.zona}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        sol.estado === 'Terminada' || sol.estado === 'Pagado' ? 'bg-success' :
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
                                                        {sol.estado === 'Terminada' || sol.estado === 'Pagado' ? 'Ver Detalles' : 'Gestionar'}
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

            <div className="modal fade" id="modalGestion" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title fw-bold">Gestionar Solicitud #{solicitudSeleccionada?.id}</h5>
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
                                {solicitudSeleccionada?.observaciones && (
                                    <p className="mt-2 mb-0 small text-muted"><strong>Observaciones:</strong> {solicitudSeleccionada.observaciones}</p>
                                )}
                                {solicitudSeleccionada?.imagenBase64 && (
                                    <div className="mt-3">
                                        <strong className="small d-block mb-1">Fotografía adjunta por el cliente:</strong>
                                        <img src={solicitudSeleccionada.imagenBase64} alt="Adjunto cliente" className="img-fluid rounded border" style={{ maxHeight: '220px' }} />
                                    </div>
                                )}
                            </div>

                            <form onSubmit={guardarCambios}>
                                <div className="mb-4">
                                    <h6 className="fw-bold text-success border-bottom pb-2">Asignar Empleados Disponibles</h6>
                                    <p className="small text-muted mb-2">Selecciona al personal para esta solicitud. Los inactivos u ocupados aparecen deshabilitados.</p>
                                    <div className="row g-2">
                                        {empleados.map(emp => {
                                            const isChecked = empleadosEdit.includes(emp.id);
                                            const isDisabled = (emp.estado !== 'DISPONIBLE') && !isChecked;
                                            
                                            return (
                                                <div className="col-md-6" key={emp.id}>
                                                    <div className={`form-check p-2 border rounded ${isChecked ? 'bg-success text-white border-success' : 'bg-white'}`}>
                                                        <input
                                                            className="form-check-input ms-1"
                                                            type="checkbox"
                                                            id={`emp-${emp.id}`}
                                                            checked={isChecked}
                                                            onChange={() => toggleEmpleado(emp.id)}
                                                            disabled={isDisabled || solicitudSeleccionada?.estado === 'Terminada' || solicitudSeleccionada?.estado === 'Pagado'}
                                                        />
                                                        <label className="form-check-label ms-2 w-100" htmlFor={`emp-${emp.id}`}>
                                                            {emp.nombre} {isDisabled && `(${emp.estado})`}
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {empleados.length === 0 && (
                                            <div className="col-12 text-muted small">No hay empleados registrados en el sistema.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Cambiar Estado de Solicitud</label>
                                    <select
                                        value={estadoEdit}
                                        onChange={(e) => setEstadoEdit(e.target.value)}
                                        className="form-select border-primary"
                                        disabled={solicitudSeleccionada?.estado === 'Terminada' || solicitudSeleccionada?.estado === 'Pagado'}
                                        required
                                    >
                                        <option value="En proceso de validación">En proceso de validación</option>
                                        <option value="En marcha">En marcha (Asignar Empleados)</option>
                                        <option value="Terminada">Terminada</option>
                                        <option value="Rechazada">Rechazada</option>
                                        <option value="Cancelada">Cancelada</option>
                                    </select>
                                </div>

                                <div className="text-end">
                                    <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
                                    {solicitudSeleccionada?.estado !== 'Terminada' && solicitudSeleccionada?.estado !== 'Pagado' && (
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