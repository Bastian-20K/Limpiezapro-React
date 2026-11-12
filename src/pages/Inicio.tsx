import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export const Inicio = () => {
    //estao
    const navigate = useNavigate();

    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');

    const [correoEmpresa, setCorreoEmpresa] = useState('');
    const [passwordEmpresa, setPasswordEmpresa] = useState('');

    
    const [nombreReg, setNombreReg] = useState('');
    const [correoReg, setCorreoReg] = useState('');
    const [passwordReg, setPasswordReg] = useState('');
    
    const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const correoNormalizado = correo.trim().toLowerCase();

    if (!correoNormalizado.includes('@') || password.trim() === '') {
        alert('Por favor, ingresa un correo válido y tu contraseña.');
        return;
    }

    
    // localstorage
    const passwordGuardada = localStorage.getItem(correoNormalizado);

    
    if (!passwordGuardada || passwordGuardada !== password) {
        alert('Error: Correo no registrado o contraseña incorrecta.');
        return;
    }

    // modal
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    // pag red
    if (correoNormalizado.includes('admin')) {
        navigate('/admin');
    } else if (correoNormalizado.includes('empresa')) {
        localStorage.setItem('empresaActiva', correoNormalizado);
        navigate('/empresa');
    } else {
        localStorage.setItem('usuarioActivo', correoNormalizado);
        navigate('/usuario');
    }
  };

    const handleLoginEmpresa = (e: React.FormEvent) => {
        e.preventDefault(); 

        const correoNormalizado = correoEmpresa.trim().toLowerCase();

        // Validación 
        if (!correoNormalizado.includes('@') || passwordEmpresa.trim() === '') {
            alert('Por favor, ingresa un correo válido y tu contraseña corporativa.');
            return;
        }

        //VERIFICAR EN LOCALSTORAGE
        const passwordGuardada = localStorage.getItem(correoNormalizado);

        
        if (!passwordGuardada || passwordGuardada !== passwordEmpresa) {
            alert('Error: Correo corporativo no registrado o contraseña incorrecta.');
            return;
        }

        
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        
        localStorage.setItem('empresaActiva', correoNormalizado); 
        navigate('/empresa');
    };

    const handleRegistro = (e: React.FormEvent) => {
    e.preventDefault();

    const correoNormalizado = correoReg.trim().toLowerCase();

    // 
    if (nombreReg.trim() === '' || !correoNormalizado.includes('@') || passwordReg.trim() === '') {
      alert('Por favor, completa todos los campos correctamente para registrarte.');
      return;
    }

    
    
    localStorage.setItem(correoNormalizado, passwordReg);

    
    alert('¡Registro exitoso! Ya puedes iniciar sesión con tu nueva cuenta.');

    
    setNombreReg('');
    setCorreoReg('');
    setPasswordReg('');

    
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    
    
    const modalGeneral = document.getElementById('modalAccesoGeneral');
    const modalEmpresa = document.getElementById('modalEmpresa');
    
    if (modalGeneral) {
        modalGeneral.classList.remove('show');
        modalGeneral.style.display = 'none';
        modalGeneral.setAttribute('aria-hidden', 'true');
    }
    if (modalEmpresa) {
        modalEmpresa.classList.remove('show');
        modalEmpresa.style.display = 'none';
        modalEmpresa.setAttribute('aria-hidden', 'true');
        }
    };
    return (
        <>
        
    <nav className="navbar navbar-expand-lg custom-navbar shadow-sm">
        <div className="container">
            <a className="navbar-brand text-white fw-bold" href="index.html">LimpiezaPro</a>
            <button className="navbar-toggler border-white" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ms-auto">
                    <li className="nav-item"><a className="nav-link text-white active" href="index.html">Principal</a></li>
                </ul>
            </div>
        </div>
    </nav>

    
    <header className="hero-section text-center text-white py-5">
        <div className="container py-5">
            <h1 className="display-4 fw-bold shadow-text">Tu Entorno Impecable, Siempre</h1>
            <p className="lead mt-3 shadow-text">Ofrecemos servicios de limpieza profesional. Contrata, paga con pie inicial y en cuotas.</p>
        </div>
    </header>

    
    <section id="ingresar" className="container py-5 mt-4">
        <div className="text-center mb-5">
            <h2 className="fw-bold color-azul-claro">Selecciona tu Portal de Acceso</h2>
        </div>

        
        <div className="row g-4 text-center justify-content-center">
            
            
            <div className="col-md-5">
                <div className="card h-100 shadow-sm border-0 p-4 card-hover bg-azul-claro">
                    
                    <div className="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h1 className="display-3 mb-3">👤</h1>
                            <h4 className="fw-bold color-azul-claro">Acceso Personas</h4>
                            <p className="text-muted small">Portal para clientes particulares y personal administrativo.</p>
                        </div>
                        <button className="btn btn-azul text-white mt-3 w-100 rounded-pill fw-bold" data-bs-toggle="modal" data-bs-target="#modalAccesoGeneral">
                            Ingresar / Registrarse
                        </button>
                    </div>
                </div>
            </div>

            
            <div className="col-md-5">
                <div className="card h-100 shadow-sm border-0 p-4 card-hover bg-cian-claro">
                    
                    <div className="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h1 className="display-3 mb-3">🏢</h1>
                            <h4 className="fw-bold color-cian">Acceso Empresas</h4>
                            <p className="text-muted small">Servicios de limpieza profesional para oficinas, instalaciones comerciales e industriales. Financia tu servicio corporativo con un pie inicial y el resto en cuotas.</p>
                        </div>
                        <button className="btn btn-cian text-white mt-3 w-100 rounded-pill fw-bold" data-bs-toggle="modal" data-bs-target="#modalEmpresa">
                            Acceder como Empresa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>

            
    
    <div className="modal fade" id="modalAccesoGeneral" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header bg-azul-claro text-white">
                    <h5 className="modal-title fw-bold">Acceso a la Plataforma</h5>
                    <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <ul className="nav nav-tabs" id="tabAccesoGeneral" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button className="nav-link active text-primary" data-bs-toggle="tab" data-bs-target="#loginGeneral" type="button" role="tab">Iniciar Sesión</button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button className="nav-link text-primary" data-bs-toggle="tab" data-bs-target="#registroGeneral" type="button" role="tab">Crear Cuenta Cliente</button>
                        </li>
                    </ul>
                    <div className="tab-content mt-3">
                        
                        
                        <div className="tab-pane fade show active" id="loginGeneral" role="tabpanel">
                            <form onSubmit={handleLogin} id="formLoginGeneral">
                                <div className="mb-3">
                                    <label className="form-label">Correo electrónico o Usuario</label>
                                    <input value={correo} onChange={(e) => setCorreo(e.target.value)} type="text" id="loginUserGeneral" className="form-control" placeholder="Ej: cliente@correo.com o admin" required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contraseña</label>
                                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" id="loginPassGeneral" className="form-control" placeholder="••••••••" required />
                                </div>
                                <div id="loginErrorGeneral" className="text-danger mb-2 d-none">Credenciales no reconocidas. Inténtalo de nuevo.</div>
                                <button type="submit" className="btn btn-azul w-100 text-white">Ingresar</button>
                            </form>
                        </div>

                        
                        <div className="tab-pane fade" id="registroGeneral" role="tabpanel">
                            <form onSubmit={handleRegistro} id="formRegistroGeneral">
                    <div className="mb-3">
                        <label className="form-label">Nombre Completo</label>
                        <input value={nombreReg} onChange={(e) => setNombreReg(e.target.value)} type="text" id="regNombreCliente" className="form-control" required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Correo Electrónico</label>
                        <input value={correoReg} onChange={(e) => setCorreoReg(e.target.value)} type="email" id="regEmailCliente" className="form-control" required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input value={passwordReg} onChange={(e) => setPasswordReg(e.target.value)} type="password" id="regPassCliente" className="form-control" required />
                    </div>
                    <button type="submit" className="btn btn-verde w-100 text-white">Registrarse</button>
                </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    

    
    <div className="modal fade" id="modalEmpresa" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header bg-cian-claro">
                    <h5 className="modal-title color-cian fw-bold">Acceso Corporativo</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <ul className="nav nav-tabs" id="tabEmpresa" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button className="nav-link active text-info" data-bs-toggle="tab" data-bs-target="#loginEmpresa" type="button" role="tab">Iniciar Sesión</button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button className="nav-link text-info" data-bs-toggle="tab" data-bs-target="#registroEmpresa" type="submit" role="tab">Registrar Empresa</button>
                        </li>
                    </ul>
                    <div className="tab-content mt-3">
                        
                        
                        <div className="tab-pane fade show active" id="loginEmpresa" role="tabpanel">
                            <form onSubmit={handleLoginEmpresa} id="formLoginEmpresa">
                                <div className="mb-3">
                                    <label className="form-label">Correo Corporativo</label>
                                    <input type="email" id="loginEmailEmpresa" className="form-control" placeholder="correo@empresa.com" value={correoEmpresa} onChange={(e) => setCorreoEmpresa(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contraseña</label>
                                    <input type="password" id="loginPasswordEmpresa" className="form-control" placeholder="Contraseña" value={passwordEmpresa} onChange={(e) => setPasswordEmpresa(e.target.value)} required />
                                </div>
                                <div id="loginErrorEmpresa" className="text-danger mb-2 d-none">Credenciales incorrectas.</div>
                                <button type="submit" className="btn btn-cian w-100 text-white">Ingresar al Portal</button>
                            </form>
                        </div>

                        
                        <div className="tab-pane fade" id="registroEmpresa" role="tabpanel">
                            <form onSubmit={handleRegistro} id="formRegistroEmpresa">
                                <div className="mb-3">
                                    <label className="form-label">Razón Social / Nombre de Empresa</label>
                                    <input value={nombreReg} onChange={(e) => setNombreReg(e.target.value)} type="text" id="regNombreEmpresa" className="form-control" required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Correo Corporativo</label>
                                    <input value={correoReg} onChange={(e) => setCorreoReg(e.target.value)} type="email" id="regEmailEmpresa" className="form-control" required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contraseña</label>
                                    <input value={passwordReg} onChange={(e) => setPasswordReg(e.target.value)} type="password" id="regPasswordEmpresa" className="form-control" required />
                                </div>
                                <div id="regExitoEmpresa" className="text-success mb-2 d-none">¡Empresa registrada! Ahora puedes iniciar sesión.</div>
                                <button type="submit" className="btn btn-azul w-100 text-white">Crear Cuenta Corporativa</button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>

    
    <section className="bg-light py-5 border-top border-bottom mt-5">
    <div className="container text-center">
        <h5 className="text-uppercase text-muted fw-bold mb-4 small">Marcas que nos respaldan y equipamiento profesional</h5>
        
        <div className="row row-cols-2 row-cols-md-5 g-3 align-items-center justify-content-center">
            
            
            <div className="col">
                <div className="card border-0 shadow-sm p-3 bg-white sponsor-card text-center">
                    <span className="fw-bold text-dark small d-block mb-3">KÄRCHER</span>
                    <img src="img/karcher.png" alt="Logo Kärcher" className="sponsor-logo mx-auto"/>
                </div>
            </div>

            
            <div className="col">
                <div className="card border-0 shadow-sm p-3 bg-white sponsor-card text-center">
                    <span className="fw-bold text-dark small d-block mb-3">3M</span>
                    <img src="img/3m.png" alt="Logo 3M" className="sponsor-logo mx-auto"/>
                </div>
            </div>
            
            <div className="col">
                <div className="card border-0 shadow-sm p-3 bg-white sponsor-card text-center">
                    <span className="fw-bold text-dark small d-block mb-3">ECOLAB</span>
                    <img src="img/ecolab.png" alt="Logo Ecolab" className="sponsor-logo mx-auto"/>
                </div>
            </div>
            
            <div className="col">
                <div className="card border-0 shadow-sm p-3 bg-white sponsor-card text-center">
                    <span className="fw-bold text-dark small d-block mb-3">DIVERSEY</span>
                    <img src="img/diversey.png" alt="Logo Diversey" className="sponsor-logo mx-auto"/>
                </div>
            </div>
            
            <div className="col">
                <div className="card border-0 shadow-sm p-3 bg-white sponsor-card text-center">
                    <span className="fw-bold text-dark small d-block mb-3">VIRUTEX PRO</span>
                    <img src="img/virutexpro.png" alt="Logo Virutex Pro" className="sponsor-logo mx-auto"/>
                </div>
            </div>
            </div>
        </div>
    </section>

    
    <footer className="bg-dark text-white pt-5 pb-3">
        <div className="container">
            <div className="row g-4">
                
                
                
                    <div className="col-lg-4 col-md-6">
                        <h4 className="fw-bold text-white mb-3">Limpieza<span className="color-cian">Pro</span></h4>
                        <p className="text-secondary small"> Soluciones integrales de limpieza profesional para hogares y empresas. Ofrecemos financiamiento flexible con pago en cuotas y pie inicial a la medida de tus necesidades.</p>
                        <h6 className="fw-bold text-light mt-4 mb-3">Conéctate con nosotros</h6>
                    <div className="d-flex flex-wrap gap-2">
                        <a href="https://facebook.com/tu-pagina" target="_blank" rel="noopener noreferrer" className="social-icon-btn social-facebook" title="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
                        <a href="https://instagram.com/tu-usuario" target="_blank" rel="noopener noreferrer" className="social-icon-btn social-instagram" title="Instagram"><i className="fa-brands fa-instagram"></i></a>
                        <a href="https://linkedin.com/company/tu-empresa" target="_blank" rel="noopener noreferrer" className="social-icon-btn social-linkedin" title="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
                        <a href="https://x.com/tu-usuario" target="_blank" rel="noopener noreferrer" className="social-icon-btn social-x" title="X (Twitter)"><i className="fa-brands fa-x-twitter"></i></a>
                        <a href="https://tiktok.com/@tu-usuario" target="_blank" rel="noopener noreferrer" className="social-icon-btn social-tiktok" title="TikTok"><i className="fa-brands fa-tiktok"></i></a>
                        <a href="https://youtube.com/@tu-canal" target="_blank" rel="noopener noreferrer" className="social-icon-btn social-youtube" title="YouTube"><i className="fa-brands fa-youtube"></i></a>
                        <a href="https://wa.me/56912345678?text=Hola,%20quisiera%20solicitar%20información%20sobre%20sus%20servicios" target="_blank" rel="noopener noreferrer" className="social-icon-btn social-whatsapp" title="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
                </div>
            </div>

                
                <div className="col-lg-2 col-md-6">
                    <h6 className="fw-bold text-white mb-3 text-uppercase">Sectores</h6>
                    <ul className="list-unstyled text-secondary small mb-0">
                        <li className="mb-2"><a href="#" className="text-decoration-none text-secondary text-white-50">Residencial y Casas</a></li>
                        <li className="mb-2"><a href="#" className="text-decoration-none text-secondary text-white-50">Oficinas Corporativas</a></li>
                        <li className="mb-2"><a href="#" className="text-decoration-none text-secondary text-white-50">Locales y Retail</a></li>
                        <li className="mb-2"><a href="#" className="text-decoration-none text-secondary text-white-50">Industrias y Bodegas</a></li>
                        <li className="mb-2"><a href="#" className="text-decoration-none text-secondary text-white-50">Salud y Educación</a></li>
                    </ul>
                </div>

                
                <div className="col-lg-3 col-md-6">
                    <h6 className="fw-bold text-white mb-3 text-uppercase">Soporte y Ayuda</h6>
                    <ul className="list-unstyled text-secondary small mb-0">
                        <li className="mb-2"><a href="#" className="text-decoration-none text-secondary text-white-50">Centro de Ayuda / FAQ</a></li>
                        <li className="mb-2"><a href="#" className="text-decoration-none text-secondary text-white-50">Gestión de Cuotas y Pagos</a></li>
                        <li className="mb-2"><a href="#" className="text-decoration-none text-secondary text-white-50">Términos y Condiciones</a></li>
                        <li className="mb-2"><a href="#" className="text-decoration-none text-secondary text-white-50">Política de Privacidad</a></li>
                        <li className="mb-2"><a href="#" className="text-decoration-none text-secondary text-white-50">Canal de Denuncias / Reclamos</a></li>
                    </ul>
                </div>

                
                <div className="col-lg-3 col-md-6">
                    <h6 className="fw-bold text-white mb-3 text-uppercase">Contacto</h6>
                    <ul className="list-unstyled text-secondary small mb-0">
                        <li className="mb-2"><i className="bi bi-geo-alt-fill color-cian me-2"></i>Av. Central #1234, Oficina 502</li>
                        <li className="mb-2"><i className="bi bi-telephone-fill color-cian me-2"></i>+56 9 1234 5678</li>
                        <li className="mb-2"><i className="bi bi-envelope-fill color-cian me-2"></i>contacto@limpiezapro.com</li>
                        <li className="mb-2"><i className="bi bi-clock-fill color-cian me-2"></i>Lun - Vie: 08:30 - 18:30 hrs</li>
                    </ul>
                </div>

            </div>

            <hr className="border-secondary my-4"/>

            
            <div className="row align-items-center small text-secondary">
                <div className="col-md-6 text-center text-md-start">
                    © 2026 LimpiezaPro. Todos los derechos reservados.
                </div>
                <div className="col-md-6 text-center text-md-end mt-2 mt-md-0">
                    <span className="badge bg-secondary text-dark"><i className="bi bi-credit-card me-1"></i>Pago en Cuotas Disponible</span>
                </div>
            </div>
        </div>
    </footer>
        
        </>
    );
};