import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Zona {
    id: string;
    nombre: string;
}

interface AreaPrecios {
    [key: string]: number;
}

const PRECIOS_AREAS: AreaPrecios = {
    'Habitaciones': 12000,
    'Baños': 15000,
    'Cocina': 20000,
    'Living / Comedor': 18000,
    'Balcón / Terraza': 10000
};

export const UsuarioContrata = () => {
    const navigate = useNavigate();

    // Estados 
    const [zonas, setZonas] = useState<Zona[]>([]);
    const [zonaSeleccionada, setZonaSeleccionada] = useState('');
    const [tipoServicio, setTipoServicio] = useState('Casa');
    const [cantidades, setCantidades] = useState<{ [key: string]: number }>({
        'Habitaciones': 0,
        'Baños': 0,
        'Cocina': 0,
        'Living / Comedor': 0,
        'Balcón / Terraza': 0
    });
    const [comentarios, setComentarios] = useState('');
    const [metodoPago, setMetodoPago] = useState<'Total' | 'Pie y Cuotas'>('Total');
    const [cuotas, setCuotas] = useState('3');

    // Zonas localStorage
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

    
    const handleCantidadChange = (area: string, valor: number) => {
        setCantidades(prev => ({
            ...prev,
            [area]: Math.max(0, valor)
        }));
    };

    // calcula
    const totalPrecio = Object.keys(cantidades).reduce((total, area) => {
        return total + (cantidades[area] * PRECIOS_AREAS[area]);
    }, 0);

    const valorPie = Math.round(totalPrecio * 0.3);
    const valorSaldo = totalPrecio - valorPie;

    
    const handleConfirmarServicio = (e: React.FormEvent) => {
        e.preventDefault();

        if (totalPrecio === 0) {
            alert('Por favor, selecciona al menos un área para limpiar.');
            return;
        }

        const clienteActivo = localStorage.getItem('usuarioActivo') || 'Cliente Particular';
        const idSolicitud = `SOL-${Math.floor(100 + Math.random() * 900)}`;
        const fechaHoy = new Date().toISOString().split('T')[0];

        
        const detallesArray = Object.keys(cantidades)
            .filter(area => cantidades[area] > 0)
            .map(area => `${cantidades[area]}x ${area}`);

        
        const solicitudesGuardadas = localStorage.getItem('solicitudesAdmin');
        const listaSolicitudes = solicitudesGuardadas ? JSON.parse(solicitudesGuardadas) : [];
        
        listaSolicitudes.push({
            id: idSolicitud,
            fecha: fechaHoy,
            cliente: clienteActivo,
            zona: zonaSeleccionada || 'No especificada',
            estado: 'En proceso de validación',
            detalles: [`Tipo: ${tipoServicio}`, ...detallesArray, `Obs: ${comentarios || 'Sin observaciones'}`],
            valor: totalPrecio,
            empleadosAsignados: []
        });
        localStorage.setItem('solicitudesAdmin', JSON.stringify(listaSolicitudes));

        
        const pagosGuardados = localStorage.getItem('pagosAdmin');
        const listaPagos = pagosGuardados ? JSON.parse(pagosGuardados) : [];

        const montoAPagarEnAdmin = metodoPago === 'Total' ? totalPrecio : valorPie;

        listaPagos.push({
            id: `PAY-${Math.floor(100 + Math.random() * 900)}`,
            cliente: clienteActivo,
            monto: montoAPagarEnAdmin,
            metodo: metodoPago === 'Total' ? 'Pago Completo' : `Pie (30%) + ${cuotas} cuotas`,
            estado: 'Pendiente'
        });
        localStorage.setItem('pagosAdmin', JSON.stringify(listaPagos));

        
        const contratosGuardados = localStorage.getItem('misContratos');
        const listaContratos = contratosGuardados ? JSON.parse(contratosGuardados) : [];

        listaContratos.push({
            id: idSolicitud,
            fecha: fechaHoy,
            cliente: clienteActivo,
            tipoServicio,
            zona: zonaSeleccionada,
            total: totalPrecio,
            metodoPago,
            cuotas: metodoPago === 'Pie y Cuotas' ? parseInt(cuotas) : 1,
            piePagado: valorPie,
            saldo: valorSaldo,
            estado: 'En proceso de validación'
        });
        localStorage.setItem('misContratos', JSON.stringify(listaContratos));

        
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
        navigate('/usuario-reportes');
    };

    return (
        <div className="bg-light min-vh-100">
            {/* NAVBAR */}
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

            <div className="container py-4">
                <h2 className="mb-4 color-cian fw-bold text-center">Configura tu Servicio de Limpieza</h2>
                
                <form onSubmit={handleConfirmarServicio}>
                    {/* ZONA DE COBERTURA */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Zona / Comuna del Servicio</label>
                        <select 
                            value={zonaSeleccionada} 
                            onChange={(e) => setZonaSeleccionada(e.target.value)} 
                            className="form-select" 
                            required
                        >
                            <option value="">Selecciona tu comuna...</option>
                            {zonas.map(z => (
                                <option key={z.id} value={z.nombre}>{z.nombre}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* TIPO DE PROPIEDAD */}
                    <div className="card shadow-sm mb-4 border-0">
                        <div className="card-header card-header-custom fw-bold">1. Tipo de Propiedad / Servicio</div>
                        <div className="card-body">
                            <select 
                                value={tipoServicio} 
                                onChange={(e) => setTipoServicio(e.target.value)} 
                                className="form-select" 
                                required
                            >
                                <option value="Casa">Casa</option>
                                <option value="Departamento">Departamento</option>
                                <option value="Aditivos">Aditivos Especiales</option>
                                <option value="Otros">Otros (Bodegas, Locales)</option>
                            </select>
                        </div>
                    </div>

                    {/*  AREAS A LIMPIAR */}
                    <div className="card shadow-sm mb-4 border-0">
                        <div className="card-header card-header-custom fw-bold">2. Seleccionar Áreas a Limpiar</div>
                        <div className="card-body">
                            <p className="text-muted small">Añade la cantidad de áreas que necesitas limpiar. El precio se calculará automáticamente.</p>
                            <div className="row g-3">
                                {Object.keys(PRECIOS_AREAS).map(area => (
                                    <div className="col-md-6 col-lg-4" key={area}>
                                        <div className="p-3 border rounded bg-white shadow-sm d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-bold">{area}</div>
                                                <small className="text-muted">{PRECIOS_AREAS[area].toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })} / u</small>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => handleCantidadChange(area, cantidades[area] - 1)}
                                                >-</button>
                                                <span className="fw-bold px-2">{cantidades[area]}</span>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleCantidadChange(area, cantidades[area] + 1)}
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/*  DETALLES Y FOTOS */}
                    <div className="card shadow-sm mb-4 border-0">
                        <div className="card-header card-header-custom fw-bold">3. Detalles y Fotografías</div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label fw-bold color-azul-claro">Comentarios Adicionales</label>
                                <textarea 
                                    value={comentarios} 
                                    onChange={(e) => setComentarios(e.target.value)} 
                                    className="form-control" 
                                    rows={3} 
                                    placeholder="Ej: Hay manchas de pintura en el piso, cuidado con la mascota, etc."
                                ></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold color-azul-claro">Adjuntar Fotografías</label>
                                <p className="small text-muted mb-2">Por favor, sube fotografías para evaluar el nivel de suciedad.</p>
                                <input type="file" className="form-control" multiple accept="image/*" />
                            </div>
                        </div>
                    </div>

                    {/*  RESUMEN Y PAGO */}
                    <div className="card shadow-sm mb-4 border-0">
                        <div className="card-header bg-cian-claro color-cian fw-bold">4. Resumen y Pago</div>
                        <div className="card-body">
                            <div className="resumen-box p-3 mb-4 rounded bg-light border">
                                <h5 className="fw-bold">Resumen de Solicitud</h5>
                                <ul className="list-unstyled mb-2">
                                    {Object.keys(cantidades).filter(a => cantidades[a] > 0).length === 0 ? (
                                        <li className="text-muted">Aún no has seleccionado áreas.</li>
                                    ) : (
                                        Object.keys(cantidades).filter(a => cantidades[a] > 0).map(a => (
                                            <li key={a}>• {cantidades[a]}x {a} ({ (cantidades[a] * PRECIOS_AREAS[a]).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) })</li>
                                        ))
                                    )}
                                </ul>
                                <hr/>
                                <h4 className="fw-bold text-end color-verde">
                                    Total: {totalPrecio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                </h4>
                            </div>

                            {/* METODO DE PAGO */}
                            <h5 className="fw-bold color-verde mb-3">Método de Pago</h5>
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
                                <label className="form-check-label fw-bold" htmlFor="pagoCuotas">Pago con Pie Inicial (30%) y Mensualidades</label>
                            </div>

                            {/* CAJA DE CUOTAS DINAMICA */}
                            {metodoPago === 'Pie y Cuotas' && (
                                <div className="mb-4 p-3 bg-white border border-success rounded shadow-sm">
                                    <p className="mb-2"><strong>Pie a pagar hoy (30%):</strong> <span className="text-success fw-bold">{valorPie.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span></p>
                                    <p className="mb-2"><strong>Saldo a financiar:</strong> <span className="text-primary fw-bold">{valorSaldo.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span></p>
                                    <label className="form-label fw-bold">Selecciona las cuotas:</label>
                                    <select value={cuotas} onChange={(e) => setCuotas(e.target.value)} className="form-select border-success">
                                        <option value="3">3 Cuotas de {Math.round(valorSaldo / 3).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</option>
                                        <option value="6">6 Cuotas de {Math.round(valorSaldo / 6).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</option>
                                        <option value="12">12 Cuotas de {Math.round((valorSaldo * 1.05) / 12).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })} (+5% interés)</option>
                                    </select>
                                </div>
                            )}

                            <button type="submit" className="btn btn-verde btn-lg w-100 text-white fw-bold shadow-sm mt-3">
                                Confirmar y Solicitar Servicio
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* MODAL DE EXITO */}
            <div className="modal fade" id="modalExito" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content text-center p-4">
                        <div className="modal-body">
                            <h1 className="display-1 text-success">✅</h1>
                            <h3 className="color-verde fw-bold mt-3">¡Solicitud Enviada!</h3>
                            <p>Tu servicio ha sido registrado y se encuentra <strong>En proceso de validación</strong> por la administración.</p>
                            <button onClick={handleIrAReportes} className="btn btn-cian text-white mt-3 w-100 rounded-pill fw-bold">
                                Ver mis Reportes / Solicitudes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};