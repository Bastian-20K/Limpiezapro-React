import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Usuario = () => {
    const navigate = useNavigate();
    const [nombreCliente, setNombreCliente] = useState('Cliente');

    useEffect(() => {
        // correo persona arria
        const sesionActual = localStorage.getItem('usuarioActivo');
        if (sesionActual) {
            setNombreCliente(sesionActual);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('usuarioActivo');
        navigate('/');
    };

    return (
        <div className="bg-light min-vh-100">
            {/* NAV BAR */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-verde shadow-sm" style={{ backgroundColor: '#2e7d32' }}>
                <div className="container">
                    <span className="navbar-brand fw-bold" style={{ cursor: 'pointer' }} onClick={() => navigate('/usuario')}>
                        Mi Portal LimpiezaPro
                    </span>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavUsuario">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNavUsuario">
                        <ul className="navbar-nav ms-auto align-items-center">
                            <li className="nav-item">
                                <span className="nav-link text-white fw-bold">Bienvenido, {nombreCliente}</span>
                            </li>
                            <li className="nav-item">
                                <button onClick={handleLogout} className="btn btn-danger btn-sm mt-1 mt-lg-0 ms-lg-3 fw-bold">
                                    Cerrar Sesión
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* CONTENIDO PRINCIPAL */}
            <div className="container py-5">
                <h2 className="mb-4 color-verde fw-bold">¿Qué deseas hacer hoy?</h2>
                
                <div className="row g-4">
                    {/* TARJETA 1: CONTRATAR */}
                    <div className="col-md-6 col-lg-3">
                        <div onClick={() => navigate('/usuario-contrata')} className="card h-100 shadow-sm border-0 card-hover text-center p-4" style={{ cursor: 'pointer' }}>
                            <h1 className="display-4">✨</h1>
                            <h5 className="color-verde fw-bold mt-3">Contratar Servicio</h5>
                            <p className="text-muted small">Simula tu pago, calcula tu pie y agenda una limpieza.</p>
                        </div>
                    </div>

                    {/* TARJETA 2: ESTADO DEL SERVICIO */}
                    <div className="col-md-6 col-lg-3">
                        <div onClick={() => navigate('/usuario-estado')} className="card h-100 shadow-sm border-0 card-hover text-center p-4" style={{ cursor: 'pointer' }}>
                            <h1 className="display-4">🔍</h1>
                            <h5 className="color-cian fw-bold mt-3">Estado del Servicio</h5>
                            <p className="text-muted small">Revisa si tu servicio está pendiente, en proceso o finalizado.</p>
                        </div>
                    </div>

                    {/* TARJETA 3: REALIZAR PAGOS */}
                    <div className="col-md-6 col-lg-3">
                        <div onClick={() => navigate('/usuario-pago')} className="card h-100 shadow-sm border-0 card-hover text-center p-4" style={{ cursor: 'pointer' }}>
                            <h1 className="display-4">💳</h1>
                            <h5 className="color-azul-claro fw-bold mt-3">Realizar Pagos</h5>
                            <p className="text-muted small">Paga tus cuotas mensuales pendientes o el pie inicial.</p>
                        </div>
                    </div>

                    {/* TARJETA 4: REPORTES E HISTORIAL */}
                    <div className="col-md-6 col-lg-3">
                        <div onClick={() => navigate('/usuario-reportes')} className="card h-100 shadow-sm border-0 card-hover text-center p-4" style={{ cursor: 'pointer' }}>
                            <h1 className="display-4">📄</h1>
                            <h5 className="text-secondary fw-bold mt-3">Reportes e Historial</h5>
                            <p className="text-muted small">Descarga comprobantes y mira tus limpiezas anteriores.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};