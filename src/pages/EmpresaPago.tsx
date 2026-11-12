import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ContratoEmpresa {
    id: string;
    fecha: string;
    empresa: string;
    zona: string;
    totalMetros: number;
    total: number;
    metodoPago: 'Total' | 'Pie y Cuotas';
    cuotas: number;
    piePagado: number;
    saldo: number;
    cuotasPagadas?: number;
    estado: string;
}

export const EmpresaPago = () => {
    const navigate = useNavigate();
    const [contratosEmpresa, setContratosEmpresa] = useState<ContratoEmpresa[]>([]);

    useEffect(() => {
        const empresaActiva = (localStorage.getItem('empresaActiva') || localStorage.getItem('usuarioActivo') || '').toLowerCase();
        const contratosGuardados = localStorage.getItem('contratosEmpresa');

        if (contratosGuardados) {
            const lista: ContratoEmpresa[] = JSON.parse(contratosGuardados);
            const deLaEmpresa = lista
                .filter(c => !c.empresa || c.empresa.toLowerCase() === empresaActiva)
                .map(c => ({
                    ...c,
                    cuotasPagadas: c.cuotasPagadas !== undefined ? c.cuotasPagadas : 0
                }));

            setContratosEmpresa(deLaEmpresa);
        }
    }, []);

    const handlePagarCuotaCorporativa = (contratoId: string) => {
        const empresaActiva = localStorage.getItem('empresaActiva') || localStorage.getItem('usuarioActivo') || 'Empresa Corporativa';
        const contratosGuardados = localStorage.getItem('contratosEmpresa');
        const listaCompleta: ContratoEmpresa[] = contratosGuardados ? JSON.parse(contratosGuardados) : [];

        
        const contratosActualizados = listaCompleta.map(contrato => {
            if (contrato.id === contratoId) {
                const cuotasRealizadas = contrato.cuotasPagadas || 0;
                const valorCuota = Math.round(contrato.saldo / (contrato.cuotas - cuotasRealizadas));
                const nuevoSaldo = Math.max(0, contrato.saldo - valorCuota);
                const nuevasCuotasPagadas = cuotasRealizadas + 1;

                
                const pagosAdminGuardados = localStorage.getItem('pagosAdmin');
                const listaPagosAdmin = pagosAdminGuardados ? JSON.parse(pagosAdminGuardados) : [];

                listaPagosAdmin.push({
                    id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
                    cliente: empresaActiva,
                    monto: valorCuota,
                    metodo: `Cuota Corporativa ${nuevasCuotasPagadas}/${contrato.cuotas} (${contrato.id})`,
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

        localStorage.setItem('contratosEmpresa', JSON.stringify(contratosActualizados));

        
        setContratosEmpresa(prev => prev.map(c => {
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

        alert('¡Abono corporativo enviado! El pago quedó en estado "Pendiente" para validación de Tesorería.');
    };

    return (
        <div className="bg-light min-vh-100">
            {/* NAV BAR */}
            <nav className="navbar navbar-expand-lg custom-navbar shadow-sm">
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
                <h2 className="mb-4 color-verde fw-bold text-center">Línea de Pagos y Facturación</h2>
                
                <div className="row g-4" id="contenedorPagosEmpresa">
                    {contratosEmpresa.length > 0 ? (
                        contratosEmpresa.map((contrato) => {
                            const cuotasRestantes = contrato.cuotas - (contrato.cuotasPagadas || 0);
                            const valorCuotaMensual = cuotasRestantes > 0 ? Math.round(contrato.saldo / cuotasRestantes) : 0;
                            const estaAlDia = contrato.saldo === 0 || contrato.metodoPago === 'Total';

                            return (
                                <div className="col-md-6 col-lg-4" key={contrato.id}>
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom-0 pt-3">
                                            <span className="fw-bold text-primary">#{contrato.id}</span>
                                            <span className={`badge ${estaAlDia ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {estaAlDia ? 'Facturado / Al día' : 'Línea de Crédito Activa'}
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            <h6 className="card-title fw-bold text-secondary mb-1">
                                                <i className="fa-solid fa-building me-2 text-info"></i>{contrato.zona} ({contrato.totalMetros} m²)
                                            </h6>
                                            <p className="text-muted small mb-3">Fecha de emisión: {contrato.fecha}</p>

                                            <div className="bg-light p-3 rounded mb-3 border">
                                                <div className="d-flex justify-content-between mb-1 small">
                                                    <span className="text-muted">Total Servicio:</span>
                                                    <strong className="text-dark">{contrato.total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</strong>
                                                </div>

                                                {contrato.metodoPago === 'Pie y Cuotas' && (
                                                    <>
                                                        <div className="d-flex justify-content-between mb-1 small">
                                                            <span className="text-muted">Pie Inicial (30%):</span>
                                                            <strong className="text-success">{contrato.piePagado.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</strong>
                                                        </div>
                                                        <div className="d-flex justify-content-between mb-1 small">
                                                            <span className="text-muted">Cuotas Abonadas:</span>
                                                            <strong className="text-primary">{contrato.cuotasPagadas} de {contrato.cuotas}</strong>
                                                        </div>
                                                        <hr className="my-2" />
                                                        <div className="d-flex justify-content-between small">
                                                            <span className="fw-bold text-secondary">Saldo Corporativo:</span>
                                                            <strong className="fw-bold text-danger">{contrato.saldo.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</strong>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {contrato.metodoPago === 'Pie y Cuotas' && !estaAlDia && (
                                                <div className="alert alert-info py-2 px-3 mb-0 small">
                                                    <i className="fa-solid fa-file-invoice-dollar me-2"></i>
                                                    <strong>Próxima cuota:</strong> {valorCuotaMensual.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                                </div>
                                            )}
                                        </div>

                                        <div className="card-footer bg-white border-top-0 pb-3 text-end">
                                            {contrato.metodoPago === 'Pie y Cuotas' && !estaAlDia ? (
                                                <button 
                                                    onClick={() => handlePagarCuotaCorporativa(contrato.id)} 
                                                    className="btn btn-verde text-white w-100 fw-bold shadow-sm"
                                                >
                                                    Pagar Cuota ({valorCuotaMensual.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })})
                                                </button>
                                            ) : (
                                                <span className="text-success fw-bold small">
                                                    <i className="fa-solid fa-circle-check me-1"></i>Sin saldos pendientes
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
                                <i className="fa-solid fa-file-invoice-dollar fa-3x text-muted mb-3"></i>
                                <h5>No hay facturación ni cuotas pendientes</h5>
                                <p className="text-muted small">Tus solicitudes corporativas y estados de cuenta aparecerán aquí.</p>
                                <button onClick={() => navigate('/empresa-contrata')} className="btn btn-verde text-white fw-bold mt-2">
                                    Cotizar Servicio Corporativo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};