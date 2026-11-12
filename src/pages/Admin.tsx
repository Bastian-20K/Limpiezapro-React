import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Admin = () => {
    const navigate = useNavigate();
    
    // Estado
    const [totalUsuarios, setTotalUsuarios] = useState(0);

    
    useEffect(() => {
        const claves = Object.keys(localStorage);
        // con @
        const correosRegistrados = claves.filter(clave => clave.includes('@'));
        setTotalUsuarios(correosRegistrados.length);
    }, []);

    
    const handleLogout = () => {
        
        navigate('/');
    };

    return (
        <div className="bg-light min-vh-100">
            {/* NAV BAR */}
            <nav className="navbar navbar-expand-lg navbar-dark custom-navbar shadow-sm">
                <div className="container">
                    <span className="navbar-brand fw-bold text-white shadow-text" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                        <i className="fa-solid fa-user-shield me-2"></i>AdminPro
                    </span>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAdmin">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNavAdmin">
                        <ul className="navbar-nav ms-auto align-items-center">
                            <li className="nav-item"><span className="nav-link text-white active fw-bold" style={{ cursor: 'pointer' }}>Inicio</span></li>
                            <li className="nav-item"><span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-reporte')}>Reporte</span></li>
                            <li className="nav-item"><span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-sucursales')}>Sucursales / RRHH</span></li>
                            <li className="nav-item"><span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-autoriza')}>Autorizar</span></li>
                            <li className="nav-item"><span className="nav-link text-white" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-gestion')}>Gestionar</span></li>
                            <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                                <button onClick={handleLogout} className="btn btn-verde btn-sm text-white fw-bold shadow-sm">Cerrar Sesión</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container py-5">
                {/* BANNER PRINCIPAL CON INDICADOR DINÁMICO */}
                <div className="p-5 mb-5 rounded-4 shadow-sm text-white custom-navbar">
                    <div className="container-fluid py-2">
                        <h1 className="display-5 fw-bold shadow-text"><i className="fa-solid fa-hand-sparkles me-3"></i>Bienvenido al Portal Admin</h1>
                        <p className="col-md-8 fs-5 mt-3">Panel central de administración de <strong>LimpiezaPro</strong>. Desde aquí podrás gestionar a tu personal, autorizar pagos, asignar servicios y visualizar los ingresos en tiempo real.</p>
                        
                        {/* Insignia dinámica que lee los datos del estado */}
                        <div className="mt-4">
                            <span className="badge bg-light text-dark fs-6 p-2 rounded-pill shadow-sm">
                                <i className="fa-solid fa-users me-2 text-primary"></i>
                                Cuentas registradas en el sistema: <span className="fw-bold text-success">{totalUsuarios}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <h4 className="fw-bold text-secondary mb-4">Accesos Rápidos</h4>
                <div className="row g-4">
                    {/* TARJETA 1: GESTIÓN */}
                    <div className="col-md-6 col-lg-3">
                        <div onClick={() => navigate('/admin-gestion')} className="card h-100 border-0 shadow-sm card-hover bg-white" style={{ cursor: 'pointer' }}>
                            <div className="card-body text-center p-4">
                                <div className="icon-box bg-azul-claro color-azul-claro mx-auto mb-3">
                                    <i className="fa-solid fa-list-check"></i>
                                </div>
                                <h5 className="fw-bold color-azul-claro">Gestión Operativa</h5>
                                <p className="text-muted small mb-3">Ver nuevas solicitudes, asignar empleados y cambiar estados.</p>
                                <span className="btn btn-azul btn-sm w-100 text-white fw-bold">Ir a Gestión</span>
                            </div>
                        </div>
                    </div>

                    {/* TARJETA 2: TESORERÍA */}
                    <div className="col-md-6 col-lg-3">
                        <div onClick={() => navigate('/admin-autoriza')} className="card h-100 border-0 shadow-sm card-hover bg-white" style={{ cursor: 'pointer' }}>
                            <div className="card-body text-center p-4">
                                <div className="icon-box bg-verde-claro color-verde mx-auto mb-3">
                                    <i className="fa-solid fa-file-invoice-dollar"></i>
                                </div>
                                <h5 className="fw-bold color-verde">Tesorería</h5>
                                <p className="text-muted small mb-3">Revisa pagos, solicitudes en cuotas y procesa reembolsos.</p>
                                <span className="btn btn-verde btn-sm w-100 text-white fw-bold">Ir a Tesorería</span>
                            </div>
                        </div>
                    </div>

                    {/* TARJETA 3: RRHH */}
                    <div className="col-md-6 col-lg-3">
                        <div onClick={() => navigate('/admin-sucursales')} className="card h-100 border-0 shadow-sm card-hover bg-white" style={{ cursor: 'pointer' }}>
                            <div className="card-body text-center p-4">
                                <div className="icon-box bg-cian-claro color-cian mx-auto mb-3">
                                    <i className="fa-solid fa-users-gear"></i>
                                </div>
                                <h5 className="fw-bold color-cian">RRHH y Zonas</h5>
                                <p className="text-muted small mb-3">Registra empleados y habilita nuevas comunas de cobertura.</p>
                                <span className="btn btn-cian btn-sm w-100 text-white fw-bold">Ir a RRHH</span>
                            </div>
                        </div>
                    </div>

                    {/* TARJETA 4: REPORTES */}
                    <div className="col-md-6 col-lg-3">
                        <div onClick={() => navigate('/admin-reporte')} className="card h-100 border-0 shadow-sm card-hover bg-white" style={{ cursor: 'pointer' }}>
                            <div className="card-body text-center p-4">
                                <div className="icon-box bg-azul-claro color-azul-claro mx-auto mb-3">
                                    <i className="fa-solid fa-chart-pie"></i>
                                </div>
                                <h5 className="fw-bold color-azul-claro">Reportes (KPIs)</h5>
                                <p className="text-muted small mb-3">Visualiza ingresos netos, historial y exporta a PDF.</p>
                                <span className="btn btn-azul btn-sm w-100 text-white fw-bold">Ver Reportes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};