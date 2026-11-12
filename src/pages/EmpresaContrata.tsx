import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Zona {
    id: string;
    nombre: string;
}

interface EspacioCorporativo {
    id: string;
    nombre: string;
    metros: number;
    observaciones: string;
}

const PRECIO_POR_M2 = 1500;

export const EmpresaContrata = () => {
    const navigate = useNavigate();

    // Estados del formulario
    const [zonas, setZonas] = useState<Zona[]>([]);
    const [zonaSeleccionada, setZonaSeleccionada] = useState('');
    const [espacios, setEspacios] = useState<EspacioCorporativo[]>([
        { id: Date.now().toString(), nombre: 'Oficinas Administrativas', metros: 0, observaciones: '' }
    ]);
    const [metodoPago, setMetodoPago] = useState<'Total' | 'Pie y Cuotas'>('Total');
    const [cuotas, setCuotas] = useState('3');

    // Cargar Zonas desde localStorage
    useEffect(() => {
        const zonasGuardadas = localStorage.getItem('zonasAdmin');
        if (zonasGuardadas) {
            setZonas(JSON.parse(zonasGuardadas));
        } else {
            setZonas([
                { id: '1', nombre: 'Santiago Centro' },
                { id: '2', nombre: 'Providencia' },
                { id: '3', nombre: 'Las Condes' }
            ]);
        }
    }, []);

    // Agregar nuevo espacio corporativo
    const handleAgregarEspacio = () => {
        setEspacios(prev => [
            ...prev,
            { id: Date.now().toString(), nombre: '', metros: 0, observaciones: '' }
        ]);
    };

    // Eliminar espacio corporativo
    const handleEliminarEspacio = (id: string) => {
        if (espacios.length === 1) {
            alert('Debes mantener al menos un espacio configurado.');
            return;
        }
        setEspacios(prev => prev.filter(esp => esp.id !== id));
    };

    // Actualizar campos de un espacio
    const handleActualizarEspacio = (id: string, campo: keyof EspacioCorporativo, valor: string | number) => {
        setEspacios(prev => prev.map(esp => {
            if (esp.id === id) {
                return { ...esp, [campo]: valor };
            }
            return esp;
        }));
    };

    // Cálculos totales
    const totalMetros = espacios.reduce((acc, esp) => acc + (Number(esp.metros) || 0), 0);
    const totalPrecio = totalMetros * PRECIO_POR_M2;
    const valorPie = Math.round(totalPrecio * 0.3);
    const valorSaldo = totalPrecio - valorPie;

    // Enviar solicitud corporativa
    const handleConfirmarContrato = (e: React.FormEvent) => {
        e.preventDefault();

        if (totalMetros <= 0) {
            alert('Por favor, ingresa una cantidad válida de metros cuadrados (mayor a 0).');
            return;
        }

        const empresaActiva = localStorage.getItem('empresaActiva') || localStorage.getItem('usuarioActivo') || 'Empresa Corporativa';
        const idSolicitud = `EMP-${Math.floor(100 + Math.random() * 900)}`;
        const fechaHoy = new Date().toISOString().split('T')[0];

        const detallesArray = espacios.map(
            esp => `${esp.nombre || 'Área Corporativa'}: ${esp.metros} m² ${esp.observaciones ? `(${esp.observaciones})` : ''}`
        );

        // 1. Guardar en SOLICITUDES ADMIN (Para AdminGestion)
        const solicitudesGuardadas = localStorage.getItem('solicitudesAdmin');
        const listaSolicitudes = solicitudesGuardadas ? JSON.parse(solicitudesGuardadas) : [];
        
        listaSolicitudes.push({
            id: idSolicitud,
            fecha: fechaHoy,
            cliente: empresaActiva,
            zona: zonaSeleccionada || 'No especificada',
            estado: 'En proceso de validación',
            detalles: [`Corporativo (${totalMetros} m² totales)`, ...detallesArray],
            valor: totalPrecio,
            empleadosAsignados: []
        });
        localStorage.setItem('solicitudesAdmin', JSON.stringify(listaSolicitudes));

        // 2. Guardar en PAGOS ADMIN (Para AdminAutoriza)
        const pagosGuardados = localStorage.getItem('pagosAdmin');
        const listaPagos = pagosGuardados ? JSON.parse(pagosGuardados) : [];

        const montoInicial = metodoPago === 'Total' ? totalPrecio : valorPie;

        listaPagos.push({
            id: `PAY-${Math.floor(100 + Math.random() * 900)}`,
            cliente: empresaActiva,
            monto: montoInicial,
            metodo: metodoPago === 'Total' ? 'Pago Completo Corporativo' : `Línea Crédito Pie (30%) + ${cuotas} cuotas`,
            estado: 'Pendiente'
        });
        localStorage.setItem('pagosAdmin', JSON.stringify(listaPagos));

        // 3. Guardar en CONTRATOS EMPRESA (Para EmpresaEstado, EmpresaPago y EmpresaReportes)
        const contratosEmpresaGuardados = localStorage.getItem('contratosEmpresa');
        const listaContratosEmp = contratosEmpresaGuardados ? JSON.parse(contratosEmpresaGuardados) : [];

        listaContratosEmp.push({
            id: idSolicitud,
            fecha: fechaHoy,
            empresa: empresaActiva,
            zona: zonaSeleccionada,
            totalMetros,
            espacios,
            total: totalPrecio,
            metodoPago,
            cuotas: metodoPago === 'Pie y Cuotas' ? parseInt(cuotas) : 1,
            piePagado: valorPie,
            saldo: valorSaldo,
            cuotasPagadas: 0,
            estado: 'En proceso de validación'
        });
        localStorage.setItem('contratosEmpresa', JSON.stringify(listaContratosEmp));

        // Mostrar Modal de Éxito
        const modalElement = document.getElementById('modalExito');
        if (modalElement) {
            modalElement.classList.add('show');
            modalElement.style.display = 'block';
            document.body.classList.add('modal-open');
        }
    };

    const handleIrAReportes = () => {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        navigate('/empresa-reportes');
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

            <div className="container py-4">
                <h2 className="mb-4 color-azul-claro fw-bold text-center">Descripción del Servicio Solicitado</h2>
                
                <form onSubmit={handleConfirmarContrato}>
                    {/* ZONA DE COBERTURA */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Zona / Comuna del Servicio</label>
                        <select 
                            value={zonaSeleccionada} 
                            onChange={(e) => setZonaSeleccionada(e.target.value)} 
                            className="form-select" 
                            required
                        >
                            <option value="">Selecciona la comuna de las instalaciones...</option>
                            {zonas.map(z => (
                                <option key={z.id} value={z.nombre}>{z.nombre}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* PASO 1: CONFIGURAR ESPACIOS */}
                    <div className="card shadow-sm mb-4 border-0">
                        <div className="card-header bg-cian-claro color-cian fw-bold d-flex justify-content-between align-items-center">
                            <span>1. Configurar Espacios y Zonas</span>
                            <button type="button" onClick={handleAgregarEspacio} className="btn btn-sm btn-cian text-white fw-bold">
                                + Agregar Espacio
                            </button>
                        </div>
                        <div className="card-body">
                            <p className="text-muted small mb-3">
                                Añade cada zona a limpiar, especifica los metros cuadrados y adjunta fotografías referenciales por área.
                            </p>

                            {espacios.map((esp, index) => (
                                <div key={esp.id} className="p-3 mb-3 bg-white border rounded shadow-sm">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold text-primary">Espacio #{index + 1}</span>
                                        {espacios.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => handleEliminarEspacio(esp.id)} 
                                                className="btn btn-sm btn-outline-danger"
                                            >
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold">Nombre del Área</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="Ej: Bodega Central, Piso 2..."
                                                value={esp.nombre}
                                                onChange={(e) => handleActualizarEspacio(esp.id, 'nombre', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label small fw-bold">Metros Cuadrados (m²)</label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                className="form-control" 
                                                placeholder="Ej: 120"
                                                value={esp.metros || ''}
                                                onChange={(e) => handleActualizarEspacio(esp.id, 'metros', parseInt(e.target.value) || 0)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-5">
                                            <label className="form-label small fw-bold">Fotografías del Área</label>
                                            <input type="file" className="form-control" multiple accept="image/*" />
                                        </div>
                                        <div className="col-12">
                                            <input 
                                                type="text" 
                                                className="form-control form-control-sm" 
                                                placeholder="Observaciones específicas del área (opcional)..."
                                                value={esp.observaciones}
                                                onChange={(e) => handleActualizarEspacio(esp.id, 'observaciones', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PASO 2: RESUMEN Y PAGO */}
                    <div className="card shadow-sm mb-4 border-0">
                        <div className="card-header bg-verde-claro color-verde fw-bold">2. Resumen de Solicitud y Pago</div>
                        <div className="card-body">
                            <div className="bg-light p-3 mb-4 rounded border">
                                <h5 className="fw-bold">Resumen Calculado</h5>
                                <p className="small text-muted mb-2">Tarifa corporativa: $1.500 CLP por metro cuadrado.</p>
                                <ul className="list-unstyled mb-2">
                                    {espacios.filter(e => e.metros > 0).length === 0 ? (
                                        <li className="text-muted">Ingresa los metros cuadrados de tus espacios para ver el desglose.</li>
                                    ) : (
                                        espacios.filter(e => e.metros > 0).map(e => (
                                            <li key={e.id}>
                                                • <strong>{e.nombre || 'Espacio'}:</strong> {e.metros} m² — {(e.metros * PRECIO_POR_M2).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                            </li>
                                        ))
                                    )}
                                </ul>
                                <hr/>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold">Total Metros: <span className="text-primary">{totalMetros}</span> m²</span>
                                    <h4 className="fw-bold color-verde mb-0">
                                        Total: {totalPrecio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                    </h4>
                                </div>
                            </div>

                            {/* OPCIONES DE FINANCIAMIENTO */}
                            <h5 className="fw-bold color-azul-claro mb-3">Opciones de Financiamiento</h5>
                            <div className="form-check mb-2">
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name="metodoPago" 
                                    id="pagoTotal" 
                                    checked={metodoPago === 'Total'}
                                    onChange={() => setMetodoPago('Total')}
                                />
                                <label className="form-check-label fw-bold" htmlFor="pagoTotal">Pago Completo Inmediato</label>
                            </div>
                            <div className="form-check mb-3">
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name="metodoPago" 
                                    id="pagoCuotas" 
                                    checked={metodoPago === 'Pie y Cuotas'}
                                    onChange={() => setMetodoPago('Pie y Cuotas')}
                                />
                                <label className="form-check-label fw-bold" htmlFor="pagoCuotas">Línea de Crédito: Pie (30%) y Cuotas Mensuales</label>
                            </div>

                            {metodoPago === 'Pie y Cuotas' && (
                                <div className="mb-4 p-3 bg-white border border-info rounded shadow-sm">
                                    <p className="mb-2">
                                        <strong>Pie Inicial a Facturar (30%):</strong>{' '}
                                        <span className="text-success fw-bold">{valorPie.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span>
                                    </p>
                                    <p className="mb-2">
                                        <strong>Saldo Corporativo a Financiar:</strong>{' '}
                                        <span className="text-primary fw-bold">{valorSaldo.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span>
                                    </p>
                                    <label className="form-label fw-bold">Selecciona las cuotas mensuales:</label>
                                    <select value={cuotas} onChange={(e) => setCuotas(e.target.value)} className="form-select border-info">
                                        <option value="3">3 Cuotas Corporativas de {Math.round(valorSaldo / 3).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })} (Sin Interés)</option>
                                        <option value="6">6 Cuotas Corporativas de {Math.round(valorSaldo / 6).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })} (Sin Interés)</option>
                                        <option value="12">12 Cuotas Corporativas de {Math.round(valorSaldo / 12).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })} (Sin Interés)</option>
                                    </select>
                                </div>
                            )}

                            <button type="submit" className="btn btn-verde btn-lg w-100 text-white fw-bold shadow-sm">
                                Generar Solicitud y Pagar
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* MODAL ÉXITO */}
            <div className="modal fade" id="modalExito" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content text-center p-4">
                        <div className="modal-body">
                            <h1 className="display-1 text-success">✅</h1>
                            <h3 className="color-verde fw-bold mt-3">Solicitud Corporativa Creada</h3>
                            <p>Su requerimiento se encuentra <strong>En proceso de validación</strong>.</p>
                            <button onClick={handleIrAReportes} className="btn btn-azul text-white mt-3 w-100 rounded-pill fw-bold">
                                Ir a Reportes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};