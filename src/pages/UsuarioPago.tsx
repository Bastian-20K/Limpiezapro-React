import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiOperacion } from '../services/api';

interface SolicitudPago {
    id: number;
    cliente: string;
    tipoServicio: string;
    zona: string;
    montoTotal: number;
    metodoPago: string;
    cuotasSeleccionadas: number;
    piePagado: number;
    fechaCreacion: string;
}

export const UsuarioPago = () => {
    const navigate = useNavigate();
    const [misContratos, setMisContratos] = useState<SolicitudPago[]>([]);
    const [cuotasPagadasMap, setCuotasPagadasMap] = useState<{ [id: number]: number }>({});

    useEffect(() => {
        const cargarContratos = async () => {
            try {
                const clienteActivo = (localStorage.getItem('usuarioActivo') || '').toLowerCase();
                const response = await apiOperacion.get('/solicitudes');
                const lista: SolicitudPago[] = response.data;

                const contratosDelUsuario = clienteActivo
                    ? lista.filter(c => c.cliente && c.cliente.toLowerCase() === clienteActivo)
                    : lista;

                setMisContratos(contratosDelUsuario);

                // Recuperar progreso local de cuotas pagadas por ID de solicitud
                const progresoGuardado = localStorage.getItem('progresoCuotas');
                if (progresoGuardado) {
                    setCuotasPagadasMap(JSON.parse(progresoGuardado));
                }
            } catch (error) {
                console.error("Error al cargar contratos para pagos:", error);
            }
        };

        cargarContratos();
    }, []);

    const handlePagarCuota = (contrato: SolicitudPago, valorCuota: number) => {
        const clienteActivo = localStorage.getItem('usuarioActivo') || contrato.cliente || 'Cliente Particular';
        const actuales = cuotasPagadasMap[contrato.id] || 0;
        const nuevasCuotas = actuales + 1;

        const nuevoMapa = {
            ...cuotasPagadasMap,
            [contrato.id]: nuevasCuotas
        };

        setCuotasPagadasMap(nuevoMapa);
        localStorage.setItem('progresoCuotas', JSON.stringify(nuevoMapa));

        // Registrar el comprobante de abono para tesorería
        const pagosAdminGuardados = localStorage.getItem('pagosAdmin');
        const listaPagosAdmin = pagosAdminGuardados ? JSON.parse(pagosAdminGuardados) : [];
        
        listaPagosAdmin.push({
            id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
            cliente: clienteActivo,
            monto: valorCuota,
            metodo: `Abono Cuota ${nuevasCuotas}/${contrato.cuotasSeleccionadas} (Sol. #${contrato.id})`,
            estado: 'Pendiente'
        });
        localStorage.setItem('pagosAdmin', JSON.stringify(listaPagosAdmin));

        alert('¡Pago de cuota enviado con éxito! Ha quedado en estado "Pendiente" para validación de Tesorería.');
    };

    const formatearFecha = (fechaIso: string) => {
        if (!fechaIso) return '-';
        return new Date(fechaIso).toLocaleDateString('es-CL');
    };

    return (
        <div className="bg-light min-vh-100">
            {/* NAV BAR */}
            <nav className="navbar navbar-expand-lg custom-navbar shadow-sm">
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

            {/* CONTENIDO PRINCIPAL */}
            <div className="container py-5">
                <h2 className="mb-4 color-verde fw-bold text-center">Gestión de Pagos y Financiamiento</h2>

                <div className="row g-4" id="contenedorPagos">
                    {misContratos.length > 0 ? (
                        misContratos.map((contrato) => {
                            const esCuotas = contrato.metodoPago === 'Pie y Cuotas';
                            const saldoInicial = esCuotas ? Math.max(0, contrato.montoTotal - contrato.piePagado) : 0;
                            const totalCuotas = contrato.cuotasSeleccionadas || 1;
                            const cuotasRealizadas = cuotasPagadasMap[contrato.id] || 0;
                            const cuotasRestantes = Math.max(0, totalCuotas - cuotasRealizadas);
                            const valorCuotaMensual = totalCuotas > 0 ? Math.round(saldoInicial / totalCuotas) : 0;
                            const saldoActual = cuotasRestantes === 0 ? 0 : Math.max(0, saldoInicial - (valorCuotaMensual * cuotasRealizadas));
                            const estaAlDia = !esCuotas || saldoActual === 0;

                            return (
                                <div className="col-md-6 col-lg-4" key={contrato.id}>
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom-0 pt-3">
                                            <span className="fw-bold text-success">#{contrato.id}</span>
                                            <span className={`badge ${estaAlDia ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {estaAlDia ? 'Al día / Pagado' : 'Cuotas Pendientes'}
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            <h6 className="card-title fw-bold text-secondary mb-1">
                                                {contrato.tipoServicio} - {contrato.zona}
                                            </h6>
                                            <p className="text-muted small mb-3">Fecha de contratación: {formatearFecha(contrato.fechaCreacion)}</p>

                                            <div className="bg-light p-3 rounded mb-3 border">
                                                <div className="d-flex justify-content-between mb-1 small">
                                                    <span className="text-muted">Monto Total:</span>
                                                    <strong className="text-dark">{contrato.montoTotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</strong>
                                                </div>

                                                {esCuotas && (
                                                    <>
                                                        <div className="d-flex justify-content-between mb-1 small">
                                                            <span className="text-muted">Pie Inicial Abonado:</span>
                                                            <strong className="text-success">{contrato.piePagado.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</strong>
                                                        </div>
                                                        <div className="d-flex justify-content-between mb-1 small">
                                                            <span className="text-muted">Cuotas Realizadas:</span>
                                                            <strong className="text-primary">{cuotasRealizadas} de {totalCuotas}</strong>
                                                        </div>
                                                        <hr className="my-2" />
                                                        <div className="d-flex justify-content-between small">
                                                            <span className="fw-bold text-secondary">Saldo Pendiente:</span>
                                                            <strong className="fw-bold text-danger">{saldoActual.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</strong>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {esCuotas && !estaAlDia && (
                                                <div className="alert alert-success py-2 px-3 mb-0 small">
                                                    <i className="fa-solid fa-calculator me-2"></i>
                                                    <strong>Valor de la siguiente cuota:</strong> {valorCuotaMensual.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                                </div>
                                            )}
                                        </div>

                                        <div className="card-footer bg-white border-top-0 pb-3 text-end">
                                            {esCuotas && !estaAlDia ? (
                                                <button 
                                                    onClick={() => handlePagarCuota(contrato, valorCuotaMensual)} 
                                                    className="btn btn-verde text-white w-100 fw-bold shadow-sm"
                                                >
                                                    Pagar Cuota ({valorCuotaMensual.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })})
                                                </button>
                                            ) : (
                                                <span className="text-success fw-bold small">
                                                    <i className="fa-solid fa-check-circle me-1"></i>Sin deudas pendientes
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-12 text-center py-5">
                            <div className="p-5 bg-white rounded shadow-sm">
                                <i className="fa-solid fa-credit-card fa-3x text-muted mb-3"></i>
                                <h5>No tienes compromisos de pago registrados</h5>
                                <p className="text-muted small">Tus contratos y pagos en cuotas aparecerán reflejados aquí.</p>
                                <button onClick={() => navigate('/usuario-contrata')} className="btn btn-verde text-white fw-bold mt-2">
                                    Contratar Servicio
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};