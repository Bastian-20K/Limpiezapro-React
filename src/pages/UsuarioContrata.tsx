import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCatalogo, apiOperacion } from '../services/api';

interface Zona {
    id: number;
    nombreComuna: string;
    tarifaRecargo: number;
}

interface AreaCatalogo {
    id: number;
    nombreArea: string;
    precioBase: number;
    tiempoEstimadoMinutos?: number;
}

export const UsuarioContrata = () => {
    const navigate = useNavigate();

    const [zonas, setZonas] = useState<Zona[]>([]);
    const [zonaSeleccionada, setZonaSeleccionada] = useState('');
    const [tipoServicio, setTipoServicio] = useState('Casa');
    
    const [catalogoAreas, setCatalogoAreas] = useState<{ [key: string]: number }>({});
    const [cantidades, setCantidades] = useState<{ [key: string]: number }>({});
    
    const [comentarios, setComentarios] = useState('');
    const [imagenBase64, setImagenBase64] = useState<string>('');
    const [metodoPago, setMetodoPago] = useState<'Total' | 'Pie y Cuotas'>('Total');
    const [cuotas, setCuotas] = useState('3');

    useEffect(() => {
        const cargarDatosCatalogo = async () => {
            try {
                const respuestaZonas = await apiCatalogo.get('/zonas');
                setZonas(respuestaZonas.data);
                
                const respuestaAreas = await apiCatalogo.get('/catalogo-areas');
                const areasData: AreaCatalogo[] = respuestaAreas.data;
                
                const preciosMapeados: { [key: string]: number } = {};
                const cantidadesIniciales: { [key: string]: number } = {};
                
                areasData.forEach(area => {
                    preciosMapeados[area.nombreArea] = area.precioBase;
                    cantidadesIniciales[area.nombreArea] = 0;
                });
                
                setCatalogoAreas(preciosMapeados);
                setCantidades(cantidadesIniciales);
            } catch (error) {
                console.error("Error al conectar con el microservicio Catálogo:", error);
                alert("Hubo un problema al cargar los precios. Verifica que el servidor Catálogo (8086) esté encendido.");
            }
        };

        cargarDatosCatalogo();
    }, []);

    const handleCantidadChange = (area: string, valor: number) => {
        setCantidades(prev => ({
            ...prev,
            [area]: Math.max(0, valor)
        }));
    };

    const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("La imagen es muy pesada (máximo 2 MB). Por favor selecciona una más liviana.");
                e.target.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagenBase64('');
        }
    };

    const zonaActual = zonas.find(z => z.nombreComuna === zonaSeleccionada);
    const recargoZona = zonaActual ? zonaActual.tarifaRecargo : 0;

    const subtotalAreas = Object.keys(cantidades).reduce((total, area) => {
        return total + (cantidades[area] * (catalogoAreas[area] || 0));
    }, 0);

    const totalPrecio = subtotalAreas > 0 ? subtotalAreas + recargoZona : 0;
    const valorPie = Math.round(totalPrecio * 0.3);
    const valorSaldo = totalPrecio - valorPie;

    const handleConfirmarServicio = async (e: React.FormEvent) => {
        e.preventDefault();

        if (subtotalAreas === 0) {
            alert('Por favor, selecciona al menos un área para limpiar.');
            return;
        }

        const clienteActivo = localStorage.getItem('usuarioActivo') || 'Cliente Particular';
        
        const nuevaSolicitud = {
            cliente: clienteActivo,
            zona: zonaSeleccionada,
            tipoServicio: tipoServicio,
            metodoPago: metodoPago,
            cuotasSeleccionadas: metodoPago === 'Pie y Cuotas' ? parseInt(cuotas) : 1,
            montoTotal: totalPrecio,
            piePagado: metodoPago === 'Pie y Cuotas' ? valorPie : 0,
            observaciones: comentarios || 'Sin observaciones',
            imagenBase64: imagenBase64 || null,
            detallesAreas: Object.keys(cantidades)
                .filter(area => cantidades[area] > 0)
                .map(area => ({
                    nombreArea: area,
                    cantidad: cantidades[area],
                    subtotal: cantidades[area] * catalogoAreas[area]
                }))
        };

        try {
            await apiOperacion.post('/solicitudes/crear', nuevaSolicitud);

            const modalElement = document.getElementById('modalExito');
            if (modalElement) {
                modalElement.classList.add('show');
                modalElement.style.display = 'block';
                document.body.classList.add('modal-open');
            }
        } catch (error) {
            console.error("Error al enviar solicitud a Operacion-pro", error);
            alert("No se pudo registrar la solicitud. Verifica que el servidor Operacion (8085) esté encendido.");
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
                                <option key={z.id} value={z.nombreComuna}>
                                    {z.nombreComuna} {z.tarifaRecargo > 0 ? `(+$${z.tarifaRecargo.toLocaleString('es-CL')} traslado)` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    
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

                    <div className="card shadow-sm mb-4 border-0">
                        <div className="card-header card-header-custom fw-bold">2. Seleccionar Áreas a Limpiar</div>
                        <div className="card-body">
                            <p className="text-muted small">Añade la cantidad de áreas que necesitas limpiar. El precio se calculará automáticamente.</p>
                            
                            {Object.keys(catalogoAreas).length === 0 ? (
                                <div className="alert alert-info">No hay áreas disponibles o cargando precios desde el servidor...</div>
                            ) : (
                                <div className="row g-3">
                                    {Object.keys(catalogoAreas).map(area => (
                                        <div className="col-md-6 col-lg-4" key={area}>
                                            <div className="p-3 border rounded bg-white shadow-sm d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className="fw-bold">{area}</div>
                                                    <small className="text-muted">{catalogoAreas[area].toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })} / u</small>
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
                            )}
                        </div>
                    </div>

                    {/* DETALLES Y FOTOGRAFÍAS */}
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
                            <div className="mb-2">
                                <label className="form-label fw-bold color-azul-claro">Adjuntar Fotografía del Espacio (Opcional)</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="form-control" 
                                    onChange={handleImagenChange} 
                                />
                                {imagenBase64 && (
                                    <div className="mt-3 position-relative d-inline-block">
                                        <img src={imagenBase64} alt="Vista previa" className="img-thumbnail" style={{ maxHeight: '160px' }} />
                                        <button 
                                            type="button" 
                                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                            onClick={() => setImagenBase64('')}
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm mb-4 border-0">
                        <div className="card-header bg-cian-claro color-cian fw-bold">4. Resumen y Pago</div>
                        <div className="card-body">
                            <div className="resumen-box p-3 mb-4 rounded bg-light border">
                                <h5 className="fw-bold">Resumen de Solicitud</h5>
                                <ul className="list-unstyled mb-2">
                                    {Object.keys(cantidades).filter(a => cantidades[a] > 0).length === 0 ? (
                                        <li className="text-muted">Aún no has seleccionado áreas.</li>
                                    ) : (
                                        <>
                                            {Object.keys(cantidades).filter(a => cantidades[a] > 0).map(a => (
                                                <li key={a}>• {cantidades[a]}x {a} ({ (cantidades[a] * catalogoAreas[a]).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) })</li>
                                            ))}
                                            {recargoZona > 0 && (
                                                <li className="text-secondary mt-1">• Recargo traslado ({zonaSeleccionada}): {recargoZona.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</li>
                                            )}
                                        </>
                                    )}
                                </ul>
                                <hr/>
                                <h4 className="fw-bold text-end color-verde">
                                    Total: {totalPrecio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                </h4>
                            </div>

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

            <div className="modal fade" id="modalExito" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content text-center p-4">
                        <div className="modal-body">
                            <h1 className="display-1 text-success">✅</h1>
                            <h3 className="color-verde fw-bold mt-3">¡Solicitud Enviada!</h3>
                            <p>Tu servicio ha sido registrado en Operacion-pro y se encuentra <strong>En proceso de validación</strong>.</p>
                            <button onClick={handleIrAReportes} className="btn btn-cian text-white mt-3 w-100 rounded-pill fw-bold" data-bs-dismiss="modal">
                                Ver mis Reportes / Solicitudes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};