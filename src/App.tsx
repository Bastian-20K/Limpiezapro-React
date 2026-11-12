import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Inicio } from './pages/Inicio';
import { Usuario } from './pages/Usuario';
import { Admin } from './pages/Admin';
import { Empresa } from './pages/Empresa';
import { UsuarioContrata } from './pages/UsuarioContrata';
import { UsuarioEstado } from './pages/UsuarioEstado';
import { UsuarioPago } from './pages/UsuarioPago';
import { UsuarioReportes } from './pages/UsuarioReportes';
import { AdminAutoriza } from './pages/AdminAutoriza';
import { AdminGestion } from './pages/AdminGestion';
import { AdminReporte } from './pages/AdminReporte';
import { AdminSucursales } from './pages/AdminSucursales';
import { EmpresaContrata } from './pages/EmpresaContrata';
import { EmpresaEstado } from './pages/EmpresaEstado';
import { EmpresaPago } from './pages/EmpresaPago';
import { EmpresaReportes } from './pages/EmpresaReportes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*Ruta paginas*/}
        <Route path="/" element={<Inicio />} />
        <Route path="/usuario" element={<Usuario />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/empresa" element={<Empresa />} />
        <Route path="/usuario-contrata" element={<UsuarioContrata />} />
        <Route path="/usuario-estado" element={<UsuarioEstado />} />
        <Route path="/usuario-pago" element={<UsuarioPago />} />
        <Route path="/usuario-reportes" element={<UsuarioReportes />} />
        <Route path="/admin-autoriza" element={<AdminAutoriza />} />
        <Route path="/admin-gestion" element={<AdminGestion />} />
        <Route path="/admin-reporte" element={<AdminReporte />} />
        <Route path="/admin-sucursales" element={<AdminSucursales />} />
        <Route path="/empresa-contrata" element={<EmpresaContrata />} />
        <Route path="/empresa-estado" element={<EmpresaEstado />} />
        <Route path="/empresa-pago" element={<EmpresaPago />} />
        <Route path="/empresa-reportes" element={<EmpresaReportes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


