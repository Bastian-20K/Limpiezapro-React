import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Contrato {
    id: string;
    fecha: string;
    cliente?: string;
    tipoServicio: string;
    zona: string;
    total: number;
    metodoPago: 'Total' | 'Pie y Cuotas';
    cuotas: number;
    piePagado: number;
    saldo: number;
    cuotasPagadas?: number;
}

export const UsuarioPago = () => {
    const navigate = useNavigate();
    const [misContratos, setMisContratos] = useState<Contrato[]>([]);

    useEffect(() => {
        const clienteActivo = (localStorage.getItem('usuarioActivo') || '').toLowerCase();
        const contratosGuardados = localStorage.getItem('misContratos');

        if (contratosGuardados) {
            const lista: Contrato[] = JSON.parse(contratosGuardados);
            // Filtrar únicamente los contratos que pertenecen al cliente activo
            const contratosDelUsuario = lista
                .filter(c => !c.cliente || c.cliente.toLowerCase() === clienteActivo)
                .map(c => ({
                    ...c,
                    cuotasPagadas: c.cuotasPagadas !== undefined ? c.cuotasPagadas : 0
                }));

            setMisContratos(contratosDelUsuario);
        }
    }, []);

    const handlePagarCuota = (contratoId: string) => {
        const clienteActivo = localStorage.getItem('usuarioActivo') || 'Cliente Particular';
        const contratosGuardados = localStorage.getItem('misContratos');
        const listaCompleta: Contrato[] = contratosGuardados ? JSON.parse(contratosGuardados) : [];

        // 1. Actualizar el contrato específico en la lista global de localStorage
        const contratosActualizados = listaCompleta.map(contrato => {
            if (contrato.id === contratoId) {
                const cuotasRealizadas = contrato.cuotasPagadas || 0;
                const valorCuota = Math.round(contrato.saldo / (contrato.cuotas - cuotasRealizadas));
                const nuevoSaldo = Math.max(0, contrato.saldo - valorCuota);
                const nuevasCuotasPagadas = cuotasRealizadas + 1;

                // 2. Registrar el abono en Tesorería del Administrador (pagosAdmin)
                const pagosAdminGuardados = localStorage.getItem('pagosAdmin');
                const listaPagosAdmin = pagosAdminGuardados ? JSON.parse(pagosAdminGuardados) : [];
                
                listaPagosAdmin.push({
                    id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
                    cliente: clienteActivo,
                    monto: valorCuota,
                    metodo: `Abono Cuota ${nuevasCuotasPagadas}/${contrato.cuotas} (${contrato.id})`,
                    estado: 'Pendiente'
                });
                localStorage.setItem('pagosAdmin', JSON.stringify(listaPagosAdmin));

                return {
                    ...contrato,
                    saldo: nuevoSaldo,
                    cuotasPagadas: nuevasCuotasPagadas
                };
            }
            return contrato;
        });

        localStorage.setItem('misContratos', JSON.stringify(contratosActualizados));

        // 3. Actualizar la vista local filtrada
        setMisContratos(prev => prev.map(c => {
            if (c.id === contratoId) {
                const cuotasRealizadas = c.cuotasPagadas || 0;
                const valorCuota = Math.round(c.saldo / (c.cuotas - cuotasRealizadas));
                return {
                    ...c,
                    saldo: Math.max(0, c.saldo - valorCuota),
                    cuotasPagadas: cuotasRealizadas + 1
                };
            }
            return c;
        }));

        alert('¡Pago de cuota enviado con éxito! Ha quedado en estado "Pendiente" para validación de Tesorería.');
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
                            const cuotasRestantes = contrato.cuotas - (contrato.cuotasPagadas || 0);
                            const valorCuotaMensual = cuotasRestantes > 0 ? Math.round(contrato.saldo / cuotasRestantes) : 0;
                            const estaAlDia = contrato.saldo === 0;

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
                                            <p className="text-muted small mb-3">Fecha de contratación: {contrato.fecha}</p>

                                            <div className="bg-light p-3 rounded mb-3 border">
                                                <div className="d-flex justify-content-between mb-1 small">
                                                    <span className="text-muted">Monto Total:</span>
                                                    <strong className="text-dark">{contrato.total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</strong>
                                                </div>

                                                {contrato.metodoPago === 'Pie y Cuotas' && (
                                                    <>
                                                        <div className="d-flex justify-content-between mb-1 small">
                                                            <span className="text-muted">Pie Inicial Abonado:</span>
                                                            <strong className="text-success">{contrato.piePagado.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</strong>
                                                        </div>
                                                        <div className="d-flex justify-content-between mb-1 small">
                                                            <span className="text-muted">Cuotas Realizadas:</span>
                                                            <strong className="text-primary">{contrato.cuotasPagadas} de {contrato.cuotas}</strong>
                                                        </div>
                                                        <hr className="my-2" />
                                                        <div className="d-flex justify-content-between small">
                                                            <span className="fw-bold text-secondary">Saldo Pendiente:</span>
                                                            <strong className="fw-bold text-danger">{contrato.saldo.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</strong>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {contrato.metodoPago === 'Pie y Cuotas' && !estaAlDia && (
                                                <div className="alert alert-success py-2 px-3 mb-0 small">
                                                    <i className="fa-solid fa-calculator me-2"></i>
                                                    <strong>Valor de la siguiente cuota:</strong> {valorCuotaMensual.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                                </div>
                                            )}
                                        </div>

                                        <div className="card-footer bg-white border-top-0 pb-3 text-end">
                                            {contrato.metodoPago === 'Pie y Cuotas' && !estaAlDia ? (
                                                <button 
                                                    onClick={() => handlePagarCuota(contrato.id)} 
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