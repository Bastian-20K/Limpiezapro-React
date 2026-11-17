import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Zona {
    id: number;
    nombreComuna: string;
    tarifaRecargo: number;
}

interface CatalogoArea {
    id: number;
    nombreArea: string;
    precioBase: number;
    tiempoEstimadoMinutos: number;
}

interface Empleado {
    id: string;
    rut: string;
    nombre: string;
    telefono: string;
    edad: number;
    aniosExperiencia: number;
    especialidad: string;
    estado: string;
}

export const AdminSucursales = () => {
    const navigate = useNavigate();

    // Estados Zonas (Catálogo - Puerto 8086)
    const [zonas, setZonas] = useState<Zona[]>([]);
    const [nombreZona, setNombreZona] = useState('');
    const [tarifaRecargo, setTarifaRecargo] = useState('0');

    // Estados Áreas y Precios (Catálogo - Puerto 8086)
    const [areas, setAreas] = useState<CatalogoArea[]>([]);
    const [nombreArea, setNombreArea] = useState('');
    const [precioBase, setPrecioBase] = useState('');
    const [tiempoEstimado, setTiempoEstimado] = useState('60');

    // Estados Empleados (Operación - Puerto 8085)
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [empIdEdit, setEmpIdEdit] = useState<string | null>(null);
    const [rut, setRut] = useState('');
    const [nombreEmp, setNombreEmp] = useState('');
    const [contacto, setContacto] = useState('');
    const [edad, setEdad] = useState('');
    const [zonaEmp, setZonaEmp] = useState('');
    const [experiencia, setExperiencia] = useState('');
    const [especialidad, setEspecialidad] = useState('');

    const cargarZonas = async () => {
        try {
            const response = await axios.get('http://localhost:8086/api/v1/zonas');
            setZonas(response.data);
        } catch (error) {
            console.error("Error al cargar zonas desde la BD:", error);
        }
    };

    const cargarAreas = async () => {
        try {
            const response = await axios.get('http://localhost:8086/api/v1/catalogo-areas');
            setAreas(response.data);
        } catch (error) {
            console.error("Error al cargar áreas desde la BD:", error);
        }
    };

    const cargarEmpleados = async () => {
        try {
            const response = await axios.get('http://localhost:8085/api/v1/empleados');
            setEmpleados(response.data);
            actualizarKpiPersonal(response.data);
        } catch (error) {
            console.error("Error al cargar empleados:", error);
        }
    };
    
    useEffect(() => {
        cargarZonas();
        cargarAreas();
        cargarEmpleados();
    }, []);

    const actualizarKpiPersonal = (lista: Empleado[]) => {
        const activos = lista.filter(e => e.estado !== 'INACTIVO').length;
        localStorage.setItem('empleadosActivos', activos.toString());
    };

    // --- MANEJO DE ZONAS ---
    const handleAgregarZona = async (e: React.FormEvent) => {
        e.preventDefault();
        if (nombreZona.trim() === '') return;

        try {
            await axios.post('http://localhost:8086/api/v1/zonas', { 
                nombreComuna: nombreZona.trim(),
                tarifaRecargo: parseFloat(tarifaRecargo) || 0
            });
            setNombreZona('');
            setTarifaRecargo('0');
            cargarZonas();
        } catch (error) {
            console.error("Error al guardar la zona:", error);
            alert("No se pudo guardar la zona en la base de datos (verifica que no esté repetida).");
        }
    };

    const handleEliminarZona = async (id: number) => {
        if (window.confirm('¿Seguro que deseas eliminar esta zona?')) {
            try {
                await axios.delete(`http://localhost:8086/api/v1/zonas/${id}`);
                cargarZonas();
            } catch (error) {
                console.error("Error al eliminar la zona:", error);
                alert("No se pudo eliminar la zona.");
            }
        }
    };

    // --- MANEJO DE ÁREAS Y PRECIOS ---
    const handleAgregarArea = async (e: React.FormEvent) => {
        e.preventDefault();
        if (nombreArea.trim() === '' || !precioBase) return;

        try {
            await axios.post('http://localhost:8086/api/v1/catalogo-areas', {
                nombreArea: nombreArea.trim(),
                precioBase: parseFloat(precioBase) || 0,
                tiempoEstimadoMinutos: parseInt(tiempoEstimado) || 60
            });
            setNombreArea('');
            setPrecioBase('');
            setTiempoEstimado('60');
            cargarAreas();
        } catch (error) {
            console.error("Error al guardar el área:", error);
            alert("No se pudo guardar el área (verifica que el nombre no esté repetido).");
        }
    };

    const handleEliminarArea = async (id: number) => {
        if (window.confirm('¿Seguro que deseas eliminar esta área del catálogo?')) {
            try {
                await axios.delete(`http://localhost:8086/api/v1/catalogo-areas/${id}`);
                cargarAreas();
            } catch (error) {
                console.error("Error al eliminar el área:", error);
                alert("No se pudo eliminar el área.");
            }
        }
    };

    // --- MANEJO DE EMPLEADOS ---
    const handleGuardarEmpleado = async (e: React.FormEvent) => {
        e.preventDefault();

        const payloadDTO = {
            rut,
            nombre: nombreEmp,
            telefono: contacto,
            edad: parseInt(edad) || 0,
            aniosExperiencia: parseInt(experiencia) || 0,
            especialidad,
            estado: "DISPONIBLE"
        };

        try {
            if (empIdEdit) {
                alert("El backend aún no tiene endpoint para editar todos los datos, solo cambiar estado.");
            } else {
                await axios.post('http://localhost:8085/api/v1/empleados', payloadDTO);
            }
            cargarEmpleados();
            limpiarFormularioEmp();
        } catch (error) {
            console.error("Error al guardar empleado:", error);
            alert("Hubo un error al guardar el empleado. Revisa la consola.");
        }
    };

    const toggleEstadoEmpleado = async (emp: Empleado) => {
        const nuevoEstado = emp.estado === 'INACTIVO' ? 'DISPONIBLE' : 'INACTIVO';
        try {
            await axios.put(`http://localhost:8085/api/v1/empleados/${emp.id}/estado?estado=${nuevoEstado}`);
            cargarEmpleados();
        } catch (error) {
            console.error("Error al cambiar estado:", error);
        }
    };

    const limpiarFormularioEmp = () => {
        setEmpIdEdit(null);
        setRut('');
        setNombreEmp('');
        setContacto('');
        setEdad('');
        setZonaEmp('');
        setExperiencia('');
        setEspecialidad('');
    };

    return (
        <div className="bg-light min-vh-100">
            {/* NAV BAR */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
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
                            <li className="nav-item"><span className="nav-link text-white-50" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-reportes')}>Reporte</span></li>
                            <li className="nav-item"><span className="nav-link text-white active" style={{ cursor: 'pointer' }}>Sucursales / RRHH</span></li>
                            <li className="nav-item"><span className="nav-link text-white-50" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-autoriza')}>Autorizar</span></li>
                            <li className="nav-item"><span className="nav-link text-white-50" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-gestion')}>Gestionar</span></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container py-4">
                <h2 className="fw-bold color-cian mb-4">Gestión de Zonas, Catálogo y RRHH</h2>

                {/* BOTONES DE PESTAÑAS */}
                <ul className="nav nav-pills mb-4" id="pills-tab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button className="nav-link active" data-bs-toggle="pill" data-bs-target="#zonas" type="button" role="tab">📍 Zonas de Cobertura</button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className="nav-link" data-bs-toggle="pill" data-bs-target="#areas" type="button" role="tab">🧹 Áreas y Precios</button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className="nav-link" data-bs-toggle="pill" data-bs-target="#empleados" type="button" role="tab">👥 Personal de Limpieza</button>
                    </li>
                </ul>

                <div className="tab-content">
                    {/* PESTAÑA 1: ZONAS */}
                    <div className="tab-pane fade show active" id="zonas" role="tabpanel">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="card shadow-sm border-0">
                                    <div className="card-body">
                                        <h5 className="fw-bold color-azul-claro mb-3">Agregar Nueva Zona</h5>
                                        <form onSubmit={handleAgregarZona}>
                                            <label className="form-label small fw-bold">Nombre de Comuna / Zona</label>
                                            <input 
                                                type="text" 
                                                className="form-control mb-2" 
                                                placeholder="Ej: Concepción Centro" 
                                                value={nombreZona}
                                                onChange={(e) => setNombreZona(e.target.value)}
                                                required 
                                            />
                                            <label className="form-label small fw-bold">Tarifa Recargo Traslado ($)</label>
                                            <input 
                                                type="number" 
                                                className="form-control mb-3" 
                                                placeholder="0" 
                                                value={tarifaRecargo}
                                                onChange={(e) => setTarifaRecargo(e.target.value)}
                                                min="0"
                                                required 
                                            />
                                            <button type="submit" className="btn btn-primary text-white w-100 fw-bold">Registrar Zona</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-8 mt-3 mt-md-0">
                                <div className="card shadow-sm border-0">
                                    <div className="card-body p-0">
                                        <table className="table table-hover mb-0">
                                            <thead className="bg-primary text-white">
                                                <tr>
                                                    <th className="p-3">Comuna / Zona</th>
                                                    <th className="p-3">Recargo Traslado</th>
                                                    <th className="p-3 text-end">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {zonas.map((zona) => (
                                                    <tr key={zona.id}>
                                                        <td className="p-3 fw-bold">{zona.nombreComuna}</td>
                                                        <td className="p-3">${zona.tarifaRecargo.toLocaleString('es-CL')}</td>
                                                        <td className="p-3 text-end">
                                                            <button onClick={() => handleEliminarZona(zona.id)} className="btn btn-sm btn-outline-danger">
                                                                <i className="fa-solid fa-trash-can me-1"></i>Eliminar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {zonas.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="text-center p-4 text-muted">
                                                            No hay zonas registradas en la base de datos.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PESTAÑA 2: ÁREAS Y PRECIOS */}
                    <div className="tab-pane fade" id="areas" role="tabpanel">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="card shadow-sm border-0">
                                    <div className="card-body">
                                        <h5 className="fw-bold text-info mb-3">Agregar Área al Catálogo</h5>
                                        <form onSubmit={handleAgregarArea}>
                                            <label className="form-label small fw-bold">Nombre del Área</label>
                                            <input 
                                                type="text" 
                                                className="form-control mb-2" 
                                                placeholder="Ej: Dormitorio, Baño, Cocina" 
                                                value={nombreArea}
                                                onChange={(e) => setNombreArea(e.target.value)}
                                                required 
                                            />
                                            <label className="form-label small fw-bold">Precio Base ($ CLP)</label>
                                            <input 
                                                type="number" 
                                                className="form-control mb-2" 
                                                placeholder="Ej: 15000" 
                                                value={precioBase}
                                                onChange={(e) => setPrecioBase(e.target.value)}
                                                min="0"
                                                required 
                                            />
                                            <label className="form-label small fw-bold">Tiempo Estimado (Minutos)</label>
                                            <input 
                                                type="number" 
                                                className="form-control mb-3" 
                                                placeholder="Ej: 60" 
                                                value={tiempoEstimado}
                                                onChange={(e) => setTiempoEstimado(e.target.value)}
                                                min="10"
                                                required 
                                            />
                                            <button type="submit" className="btn btn-info text-white w-100 fw-bold">Guardar Área</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-8 mt-3 mt-md-0">
                                <div className="card shadow-sm border-0">
                                    <div className="card-body p-0">
                                        <table className="table table-hover mb-0 align-middle">
                                            <thead className="bg-info text-white">
                                                <tr>
                                                    <th className="p-3">Área de Limpieza</th>
                                                    <th className="p-3">Precio Base</th>
                                                    <th className="p-3">Tiempo Est.</th>
                                                    <th className="p-3 text-end">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {areas.map((area) => (
                                                    <tr key={area.id}>
                                                        <td className="p-3 fw-bold">{area.nombreArea}</td>
                                                        <td className="p-3 text-success fw-bold">
                                                            {area.precioBase.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                                                        </td>
                                                        <td className="p-3 text-muted">{area.tiempoEstimadoMinutos || 60} min</td>
                                                        <td className="p-3 text-end">
                                                            <button onClick={() => handleEliminarArea(area.id)} className="btn btn-sm btn-outline-danger">
                                                                <i className="fa-solid fa-trash-can me-1"></i>Eliminar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {areas.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="text-center p-4 text-muted">
                                                            No hay áreas de limpieza registradas en el catálogo.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PESTAÑA 3: EMPLEADOS */}
                    <div className="tab-pane fade" id="empleados" role="tabpanel">
                        {/* FORMULARIO CREAR / EDITAR */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body">
                                <h5 className="fw-bold text-success mb-3">Registrar Nuevo Empleado</h5>
                                <form onSubmit={handleGuardarEmpleado} className="row g-3">
                                    <div className="col-md-3">
                                        <input type="text" value={rut} onChange={(e) => setRut(e.target.value)} className="form-control" placeholder="RUT (Ej: 12345678-9)" required />
                                    </div>
                                    <div className="col-md-3">
                                        <input type="text" value={nombreEmp} onChange={(e) => setNombreEmp(e.target.value)} className="form-control" placeholder="Nombre Completo" required />
                                    </div>
                                    <div className="col-md-3">
                                        <input type="text" value={contacto} onChange={(e) => setContacto(e.target.value)} className="form-control" placeholder="Teléfono" required />
                                    </div>
                                    <div className="col-md-3">
                                        <input type="number" value={edad} onChange={(e) => setEdad(e.target.value)} className="form-control" placeholder="Edad" required />
                                    </div>
                                    <div className="col-md-3">
                                        <select value={zonaEmp} onChange={(e) => setZonaEmp(e.target.value)} className="form-select" required>
                                            <option value="">Seleccionar Zona...</option>
                                            {zonas.map(z => (
                                                <option key={z.id} value={z.nombreComuna}>{z.nombreComuna}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <input type="number" value={experiencia} onChange={(e) => setExperiencia(e.target.value)} className="form-control" placeholder="Años Experiencia" required />
                                    </div>
                                    <div className="col-md-4">
                                        <input type="text" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} className="form-control" placeholder="Especialidad" required />
                                    </div>
                                    <div className="col-md-2 d-flex gap-1">
                                        <button type="submit" className="btn btn-success text-white w-100 fw-bold">Guardar</button>
                                        <button type="button" onClick={limpiarFormularioEmp} className="btn btn-secondary">Limpiar</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* TABLA DE EMPLEADOS */}
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0 align-middle">
                                        <thead className="bg-success text-white">
                                            <tr>
                                                <th className="p-3">RUT</th>
                                                <th>Nombre</th>
                                                <th>Especialidad</th>
                                                <th>Exp.</th>
                                                <th>Estado</th>
                                                <th className="text-end p-3">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {empleados.map((emp) => (
                                                <tr key={emp.id}>
                                                    <td className="p-3 fw-bold">{emp.rut}</td>
                                                    <td>
                                                        <div>{emp.nombre}</div>
                                                        <small className="text-muted">{emp.telefono}</small>
                                                    </td>
                                                    <td>{emp.especialidad}</td>
                                                    <td>{emp.aniosExperiencia} años</td>
                                                    <td>
                                                        <span className={`badge ${emp.estado !== 'INACTIVO' ? 'bg-success' : 'bg-secondary'}`}>
                                                            {emp.estado}
                                                        </span>
                                                    </td>
                                                    <td className="text-end p-3">
                                                        <button onClick={() => toggleEstadoEmpleado(emp)} className={`btn btn-sm ${emp.estado !== 'INACTIVO' ? 'btn-outline-danger' : 'btn-outline-success'}`}>
                                                            {emp.estado !== 'INACTIVO' ? 'Desactivar' : 'Activar'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {empleados.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="text-center p-4 text-muted">
                                                        No hay empleados registrados.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};