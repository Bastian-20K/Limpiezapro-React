import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Zona {
    id: string;
    nombre: string;
}

interface Empleado {
    id: string;
    rut: string;
    nombre: string;
    contacto: string;
    edad: number;
    zona: string;
    experiencia: number;
    especialidad: string;
    activo: boolean;
}

export const AdminSucursales = () => {
    const navigate = useNavigate();

    // Estados para Zonas
    const [zonas, setZonas] = useState<Zona[]>([]);
    const [nombreZona, setNombreZona] = useState('');

    // Estados para Empleados
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [empIdEdit, setEmpIdEdit] = useState<string | null>(null);
    const [rut, setRut] = useState('');
    const [nombreEmp, setNombreEmp] = useState('');
    const [contacto, setContacto] = useState('');
    const [edad, setEdad] = useState('');
    const [zonaEmp, setZonaEmp] = useState('');
    const [experiencia, setExperiencia] = useState('');
    const [especialidad, setEspecialidad] = useState('');

    // Cargar datos al iniciar
    useEffect(() => {
        // 1. Cargar Zonas
        const zonasGuardadas = localStorage.getItem('zonasAdmin');
        if (zonasGuardadas) {
            setZonas(JSON.parse(zonasGuardadas));
        } else {
            const zonasBase: Zona[] = [
                { id: '1', nombre: 'Santiago Centro' },
                { id: '2', nombre: 'Providencia' },
                { id: '3', nombre: 'Las Condes' }
            ];
            setZonas(zonasBase);
            localStorage.setItem('zonasAdmin', JSON.stringify(zonasBase));
        }

        // 2. Cargar Empleados
        const empleadosGuardados = localStorage.getItem('empleadosAdmin');
        if (empleadosGuardados) {
            const lista: Empleado[] = JSON.parse(empleadosGuardados);
            setEmpleados(lista);
            actualizarKpiPersonal(lista);
        } else {
            const empleadosBase: Empleado[] = [
                { id: 'EMP-1', rut: '12345678-9', nombre: 'Carlos Ruiz', contacto: '+56 9 1111 2222', edad: 32, zona: 'Providencia', experiencia: 4, especialidad: 'Vidrios en altura', activo: true },
                { id: 'EMP-2', rut: '98765432-1', nombre: 'Ana Gómez', contacto: '+56 9 3333 4444', edad: 28, zona: 'Las Condes', experiencia: 2, especialidad: 'Industrial', activo: true }
            ];
            setEmpleados(empleadosBase);
            localStorage.setItem('empleadosAdmin', JSON.stringify(empleadosBase));
            actualizarKpiPersonal(empleadosBase);
        }
    }, []);

    // Actualizar el KPI global para AdminReporte
    const actualizarKpiPersonal = (lista: Empleado[]) => {
        const activos = lista.filter(e => e.activo).length;
        localStorage.setItem('empleadosActivos', activos.toString());
    };

    // --- LÓGICA DE ZONAS ---
    const handleAgregarZona = (e: React.FormEvent) => {
        e.preventDefault();
        if (nombreZona.trim() === '') return;

        const nuevaZona: Zona = {
            id: Date.now().toString(),
            nombre: nombreZona.trim()
        };

        const nuevasZonas = [...zonas, nuevaZona];
        setZonas(nuevasZonas);
        localStorage.setItem('zonasAdmin', JSON.stringify(nuevasZonas));
        setNombreZona('');
    };

    const handleEliminarZona = (id: string) => {
        if (window.confirm('¿Seguro que deseas eliminar esta zona?')) {
            const nuevasZonas = zonas.filter(z => z.id !== id);
            setZonas(nuevasZonas);
            localStorage.setItem('zonasAdmin', JSON.stringify(nuevasZonas));
        }
    };

    // --- LÓGICA DE EMPLEADOS ---
    const handleGuardarEmpleado = (e: React.FormEvent) => {
        e.preventDefault();

        if (empIdEdit) {
            // Edición
            const empleadosActualizados = empleados.map(emp => 
                emp.id === empIdEdit 
                    ? {
                        ...emp,
                        rut,
                        nombre: nombreEmp,
                        contacto,
                        edad: parseInt(edad) || 0,
                        zona: zonaEmp,
                        experiencia: parseInt(experiencia) || 0,
                        especialidad
                    } 
                    : emp
            );
            setEmpleados(empleadosActualizados);
            localStorage.setItem('empleadosAdmin', JSON.stringify(empleadosActualizados));
            actualizarKpiPersonal(empleadosActualizados);
            setEmpIdEdit(null);
        } else {
            // Creación
            const nuevoEmpleado: Empleado = {
                id: `EMP-${Date.now()}`,
                rut,
                nombre: nombreEmp,
                contacto,
                edad: parseInt(edad) || 0,
                zona: zonaEmp,
                experiencia: parseInt(experiencia) || 0,
                especialidad,
                activo: true
            };
            const empleadosActualizados = [...empleados, nuevoEmpleado];
            setEmpleados(empleadosActualizados);
            localStorage.setItem('empleadosAdmin', JSON.stringify(empleadosActualizados));
            actualizarKpiPersonal(empleadosActualizados);
        }

        // Limpiar formulario
        limpiarFormularioEmp();
    };

    const handleCargarEdicion = (emp: Empleado) => {
        setEmpIdEdit(emp.id);
        setRut(emp.rut);
        setNombreEmp(emp.nombre);
        setContacto(emp.contacto);
        setEdad(emp.edad.toString());
        setZonaEmp(emp.zona);
        setExperiencia(emp.experiencia.toString());
        setEspecialidad(emp.especialidad);
    };

    const toggleEstadoEmpleado = (id: string) => {
        const empleadosActualizados = empleados.map(emp => 
            emp.id === id ? { ...emp, activo: !emp.activo } : emp
        );
        setEmpleados(empleadosActualizados);
        localStorage.setItem('empleadosAdmin', JSON.stringify(empleadosActualizados));
        actualizarKpiPersonal(empleadosActualizados);
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
                <h2 className="fw-bold color-cian mb-4">Gestión de Zonas y RRHH</h2>

                {/* BOTONES DE PESTAÑAS DE BOOTSTRAP */}
                <ul className="nav nav-pills mb-4" id="pills-tab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button className="nav-link active" data-bs-toggle="pill" data-bs-target="#zonas" type="button" role="tab">📍 Zonas de Cobertura</button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className="nav-link" data-bs-toggle="pill" data-bs-target="#empleados" type="button" role="tab">👥 Personal de Limpieza</button>
                    </li>
                </ul>

                <div className="tab-content">
                    {/* PESTAÑA ZONAS */}
                    <div className="tab-pane fade show active" id="zonas" role="tabpanel">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="card shadow-sm border-0">
                                    <div className="card-body">
                                        <h5 className="fw-bold color-azul-claro mb-3">Agregar Nueva Zona</h5>
                                        <form onSubmit={handleAgregarZona}>
                                            <input 
                                                type="text" 
                                                className="form-control mb-3" 
                                                placeholder="Ej: Santiago Centro" 
                                                value={nombreZona}
                                                onChange={(e) => setNombreZona(e.target.value)}
                                                required 
                                            />
                                            <button type="submit" className="btn btn-azul text-white w-100 fw-bold">Registrar Zona</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-8 mt-3 mt-md-0">
                                <div className="card shadow-sm border-0">
                                    <div className="card-body p-0">
                                        <table className="table table-hover mb-0">
                                            <thead className="bg-azul-claro text-white">
                                                <tr>
                                                    <th className="p-3">Nombre de la Zona</th>
                                                    <th className="p-3 text-end">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {zonas.map((zona) => (
                                                    <tr key={zona.id}>
                                                        <td className="p-3 fw-bold">{zona.nombre}</td>
                                                        <td className="p-3 text-end">
                                                            <button onClick={() => handleEliminarZona(zona.id)} className="btn btn-sm btn-outline-danger">
                                                                <i className="fa-solid fa-trash-can me-1"></i>Eliminar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PESTAÑA EMPLEADOS */}
                    <div className="tab-pane fade" id="empleados" role="tabpanel">
                        {/* FORMULARIO CREAR / EDITAR */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body">
                                <h5 className="fw-bold color-verde mb-3">
                                    {empIdEdit ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
                                </h5>
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
                                                <option key={z.id} value={z.nombre}>{z.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <input type="number" value={experiencia} onChange={(e) => setExperiencia(e.target.value)} className="form-control" placeholder="Años Experiencia" required />
                                    </div>
                                    <div className="col-md-4">
                                        <input type="text" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} className="form-control" placeholder="Especialidad (Ej: Vidrios, Industrial)" required />
                                    </div>
                                    <div className="col-md-2 d-flex gap-1">
                                        <button type="submit" className="btn btn-verde text-white w-100 fw-bold">
                                            {empIdEdit ? 'Actualizar' : 'Guardar'}
                                        </button>
                                        {empIdEdit && (
                                            <button type="button" onClick={limpiarFormularioEmp} className="btn btn-secondary">
                                                X
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* TABLA DE EMPLEADOS */}
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0 align-middle">
                                        <thead className="bg-verde text-white">
                                            <tr>
                                                <th className="p-3">RUT</th>
                                                <th>Nombre</th>
                                                <th>Zona</th>
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
                                                        <small className="text-muted">{emp.contacto}</small>
                                                    </td>
                                                    <td>{emp.zona}</td>
                                                    <td>{emp.especialidad}</td>
                                                    <td>{emp.experiencia} años</td>
                                                    <td>
                                                        <span className={`badge ${emp.activo ? 'bg-success' : 'bg-secondary'}`}>
                                                            {emp.activo ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    <td className="text-end p-3">
                                                        <button onClick={() => handleCargarEdicion(emp)} className="btn btn-sm btn-outline-primary me-2">
                                                            Editar
                                                        </button>
                                                        <button onClick={() => toggleEstadoEmpleado(emp.id)} className={`btn btn-sm ${emp.activo ? 'btn-outline-danger' : 'btn-outline-success'}`}>
                                                            {emp.activo ? 'Desactivar' : 'Activar'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
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