import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Definimos la estructura de cómo se verá un reporte de servicio
interface ServicioTerminado {
    id: string;
    fecha: string;
    cliente: string;
    zona: string;
    servicio: string;
    valor: number;
}

export const AdminReporte = () => {
    const navigate = useNavigate();

    // Estados para la fecha, los KPIs y la lista de la tabla
    const [fechaActual, setFechaActual] = useState('');
    const [reportes, setReportes] = useState<ServicioTerminado[]>([]);
    const [kpiIngresos, setKpiIngresos] = useState(0);
    const [kpiEmpleados, setKpiEmpleados] = useState(0);

    useEffect(() => {
        // 1. Mostrar la fecha de hoy automáticamente
        const hoy = new Date();
        setFechaActual(hoy.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }));

        // 2. Leer los servicios terminados (Esto será llenado luego por los usuarios)
        const historialGuardado = localStorage.getItem('historialServicios');
        
        if (historialGuardado) {
            const historialParseado: ServicioTerminado[] = JSON.parse(historialGuardado);
            setReportes(historialParseado);

            // Calcular ingresos sumando el valor de todos los servicios
            const totalIngresos = historialParseado.reduce((acumulador, item) => acumulador + item.valor, 0);
            setKpiIngresos(totalIngresos);
        } else {
            // DATO DE PRUEBA: Si no hay nada, inyectamos uno de ejemplo para ver cómo luce
            const datosPrueba = [
                { id: '1001', fecha: '2026-11-10', cliente: 'Juan Pérez', zona: 'Providencia', servicio: 'Limpieza Profunda', valor: 45000 },
                { id: '1002', fecha: '2026-11-11', cliente: 'Empresa Alfa', zona: 'Las Condes', servicio: 'Mantención Oficina', valor: 120000 }
            ];
            setReportes(datosPrueba);
            setKpiIngresos(165000);
        }

        // 3. Simular empleados activos (o leerlos si tuvieras un módulo de RRHH)
        const empleadosGuardados = localStorage.getItem('empleadosActivos');
        setKpiEmpleados(empleadosGuardados ? parseInt(empleadosGuardados) : 15); // 15 por defecto
    }, []);

    return (
        <div className="bg-light min-vh-100">
            {/* NAV BAR */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm no-print">
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
                            <li className="nav-item"><span className="nav-link text-white active" style={{ cursor: 'pointer' }}>Reporte</span></li>
                            <li className="nav-item"><span className="nav-link text-white-50" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-sucursales')}>Sucursales / RRHH</span></li>
                            <li className="nav-item"><span className="nav-link text-white-50" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-autoriza')}>Autorizar</span></li>
                            <li className="nav-item"><span className="nav-link text-white-50" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-gestion')}>Gestionar</span></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container py-4">
                {/* CABECERA */}
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <div>
                        <h2 className="fw-bold text-primary mb-0"><i className="fa-solid fa-chart-pie me-2"></i>Reporte General de Operaciones</h2>
                        <p className="text-muted mb-0">Fecha de emisión: {fechaActual}</p>
                    </div>
                    <button className="btn btn-outline-danger fw-bold no-print" onClick={() => window.print()}>
                        <i className="fa-solid fa-file-pdf me-2"></i>Exportar a PDF
                    </button>
                </div>

                {/* TARJETAS KPI */}
                <div className="row g-4 mb-4">
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 bg-primary text-white h-100">
                            <div className="card-body text-center py-4">
                                <i className="fa-solid fa-sack-dollar fa-3x mb-3 opacity-75"></i>
                                <h6 className="text-uppercase fw-bold opacity-75">Ingresos Totales Netos</h6>
                                {/* Formateador de moneda */}
                                <h2 className="fw-bold mb-0">
                                    {kpiIngresos.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 bg-success text-white h-100">
                            <div className="card-body text-center py-4">
                                <i className="fa-solid fa-clipboard-check fa-3x mb-3 opacity-75"></i>
                                <h6 className="text-uppercase fw-bold opacity-75">Servicios Terminados</h6>
                                <h2 className="fw-bold mb-0">{reportes.length}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 bg-info text-dark h-100">
                            <div className="card-body text-center py-4">
                                <i className="fa-solid fa-users fa-3x mb-3 opacity-75"></i>
                                <h6 className="text-uppercase fw-bold opacity-75">Personal Activo</h6>
                                <h2 className="fw-bold mb-0">{kpiEmpleados}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLA DE HISTORIAL */}
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white border-bottom py-3">
                        <h5 className="fw-bold text-secondary mb-0">Historial de Servicios Terminados</h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-striped align-middle mb-0">
                                <thead className="bg-light text-secondary">
                                    <tr>
                                        <th className="p-3">ID Solicitud</th>
                                        <th>Fecha Solicitud</th>
                                        <th>Cliente</th>
                                        <th>Zona</th>
                                        <th>Servicio</th>
                                        <th className="text-end p-3">Valor Pagado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Iteramos sobre el estado de reportes para generar filas automáticamente */}
                                    {reportes.length > 0 ? (
                                        reportes.map((reporte, index) => (
                                            <tr key={index}>
                                                <td className="p-3 fw-bold text-primary">#{reporte.id}</td>
                                                <td>{reporte.fecha}</td>
                                                <td>{reporte.cliente}</td>
                                                <td>{reporte.zona}</td>
                                                <td>{reporte.servicio}</td>
                                                <td className="text-end p-3 fw-bold text-success">
                                                    {reporte.valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center p-4 text-muted">
                                                No hay servicios registrados aún. Las operaciones aparecerán aquí.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-4 text-muted small d-none d-print-block">
                    Reporte generado automáticamente por el sistema AdminPro de LimpiezaPro.
                </div>
            </div>
        </div>
    );
};