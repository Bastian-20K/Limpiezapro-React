import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Empresa = () => {
    const navigate = useNavigate();
    const [nombreEmpresa, setNombreEmpresa] = useState('Empresa');

    useEffect(() => {
        
        const sesionActual = localStorage.getItem('empresaActiva') || localStorage.getItem('usuarioActivo');
        if (sesionActual) {
            setNombreEmpresa(sesionActual);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('empresaActiva');
        localStorage.removeItem('usuarioActivo');
        navigate('/');
    };

    return (
        <div className="bg-light min-vh-100">
            {/* NAV BAR */}
            <nav className="navbar navbar-expand-lg custom-navbar shadow-sm">
                <div className="container">
                    <span className="navbar-brand text-white fw-bold" style={{ cursor: 'pointer' }} onClick={() => navigate('/empresa')}>
                        LimpiezaPro - Portal Corporativo
                    </span>
                    <div className="ms-auto d-flex align-items-center">
                        <span className="text-white me-3 fw-bold" id="saludoEmpresa">
                            Bienvenida, {nombreEmpresa}
                        </span>
                        <button onClick={handleLogout} className="btn btn-danger btn-sm fw-bold">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </nav>

            {/* CONTENIDO PRINCIPAL */}
            <div className="container py-5">
                <h2 className="mb-4 color-cian fw-bold">Panel de Gestión Corporativa</h2>
                
                <div className="row g-4">
                    {/* TARJETA 1: COTIZAR / CONTRATAR */}
                    <div className="col-md-6 col-lg-3">
                        <div onClick={() => navigate('/empresa-contrata')} className="card h-100 shadow-sm border-0 card-hover text-center p-4" style={{ cursor: 'pointer' }}>
                            <h1 className="display-4">🏢</h1>
                            <h5 className="color-cian fw-bold mt-3">Descripción del servicio solicitado</h5>
                            <p className="text-muted small">Añade espacios, metros cuadrados y cotiza tu servicio.</p>
                        </div>
                    </div>

                    {/* TARJETA 2: ESTADO DE SOLICITUDES */}
                    <div className="col-md-6 col-lg-3">
                        <div onClick={() => navigate('/empresa-estado')} className="card h-100 shadow-sm border-0 card-hover text-center p-4" style={{ cursor: 'pointer' }}>
                            <h1 className="display-4">📊</h1>
                            <h5 className="color-azul-claro fw-bold mt-3">Estado de Solicitudes</h5>
                            <p className="text-muted small">Revisa servicios en proceso, en curso o terminados.</p>
                        </div>
                    </div>

                    {/* TARJETA 3: GESTIÓN DE PAGOS */}
                    <div className="col-md-6 col-lg-3">
                        <div onClick={() => navigate('/empresa-pago')} className="card h-100 shadow-sm border-0 card-hover text-center p-4" style={{ cursor: 'pointer' }}>
                            <h1 className="display-4">💼</h1>
                            <h5 className="color-verde fw-bold mt-3">Gestión de Pagos</h5>
                            <p className="text-muted small">Paga cuotas corporativas o revisa pagos completos.</p>
                        </div>
                    </div>

                    {/* TARJETA 4: REPORTES GENERALES */}
                    <div className="col-md-6 col-lg-3">
                        <div onClick={() => navigate('/empresa-reportes')} className="card h-100 shadow-sm border-0 card-hover text-center p-4" style={{ cursor: 'pointer' }}>
                            <h1 className="display-4">📑</h1>
                            <h5 className="text-secondary fw-bold mt-3">Reportes Generales</h5>
                            <p className="text-muted small">Descarga comprobantes e historial de tu empresa.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};