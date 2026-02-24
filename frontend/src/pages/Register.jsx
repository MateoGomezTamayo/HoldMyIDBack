import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Register() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1); // 1: registro, 2: verificación
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    codigo_estudiante: '',
    email: '',
    contrasena: '',
    cedula: '',
    cargo: '',
    rol: 'ESTUDIANTE',
  });
  const [codigo, setCodigo] = useState('');
  const [correoEnviado, setCorreoEnviado] = useState('');
  const [tiempoExpiracion, setTiempoExpiracion] = useState(10);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Contador de expiración
  useEffect(() => {
    let interval;
    if (paso === 2 && tiempoExpiracion > 0) {
      interval = setInterval(() => {
        setTiempoExpiracion((prev) => prev - 1);
      }, 60000); // Actualizar cada minuto
    }
    return () => clearInterval(interval);
  }, [paso, tiempoExpiracion]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitRegistro = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/registro`, form);

      if (response.data.success) {
        setCorreoEnviado(response.data.data.correo);
        setTiempoExpiracion(response.data.data.tiempoExpiracion);
        setPaso(2);
        setCodigo('');
        
        // Mostrar código en consola si está en desarrollo
        if (response.data.data.codigo) {
          console.log('%c🔐 CÓDIGO DE VERIFICACIÓN', 'font-size: 16px; font-weight: bold; color: #7B3FE4;');
          console.log('%c' + response.data.data.codigo, 'font-size: 24px; font-weight: bold; color: #22c55e; letter-spacing: 5px;');
        }
        
        setSuccess('Código de verificación enviado a tu correo');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!codigo || codigo.length !== 6) {
        throw new Error('Ingresa un código válido de 6 dígitos');
      }

      const response = await axios.post(`${API_URL}/api/auth/verificar-registro`, {
        codigo,
        nombre: form.nombre,
        apellidos: form.apellidos,
        email: form.email,
        password: form.contrasena,
        codigo_estudiante: form.rol === 'ESTUDIANTE' ? form.codigo_estudiante : null,
        cedula: form.rol === 'EMPLEADO' ? form.cedula : null,
        universidad: form.rol === 'ESTUDIANTE' ? '' : null,
        rol: form.rol,
        cargo: form.cargo || null,
      });

      if (response.data.success) {
        // Guardar token y data del usuario
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));

        setSuccess('¡Correo verificado! Cuenta creada exitosamente. Redirigiendo...');

        // Redirigir al dashboard después de 2s
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al verificar código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <svg className="blob-background blob-blur" preserveAspectRatio="xMidYMid slice" viewBox="10 10 80 80">
        <path fill="#7B3FE4" className="out-top" d="M37-5C25.1-14.7,5.7-19.1-9.2-10-28.5,1.8-32.7,31.1-19.8,49c15.5,21.5,52.6,22,67.2,2.3C59.4,35,53.7,8.5,37-5Z"/>
        <path fill="#C8A8FF" className="in-top" d="M20.6,4.1C11.6,1.5-1.9,2.5-8,11.2-16.3,23.1-8.2,45.6,7.4,50S42.1,38.9,41,24.5C40.2,14.1,29.4,6.6,20.6,4.1Z"/>
        <path fill="#5A2EA6" className="out-bottom" d="M105.9,48.6c-12.4-8.2-29.3-4.8-39.4.8-23.4,12.8-37.7,51.9-19.1,74.1s63.9,15.3,76-5.6c7.6-13.3,1.8-31.1-2.3-43.8C117.6,63.3,114.7,54.3,105.9,48.6Z"/>
        <path fill="#9D7FDB" className="in-bottom" d="M102,67.1c-9.6-6.1-22-3.1-29.5,2-15.4,10.7-19.6,37.5-7.6,47.8s35.9,3.9,44.5-12.5C115.5,92.6,113.9,74.6,102,67.1Z"/>
      </svg>
      <div className="auth-card">
        {paso === 1 ? (
          <>
            <h1>Crear cuenta</h1>
            <p>Registra un nuevo usuario.</p>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <form className="auth-form" onSubmit={handleSubmitRegistro}>
              <div className="auth-field">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="apellidos">Apellidos</label>
                <input
                  id="apellidos"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  required
                />
              </div>

              {form.rol === 'ESTUDIANTE' && (
                <div className="auth-field">
                  <label htmlFor="codigo_estudiante">Código de estudiante</label>
                  <input
                    id="codigo_estudiante"
                    name="codigo_estudiante"
                    value={form.codigo_estudiante}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {form.rol === 'EMPLEADO' && (
                <>
                  <div className="auth-field">
                    <label htmlFor="cedula">Cédula</label>
                    <input
                      id="cedula"
                      name="cedula"
                      value={form.cedula}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="cargo">Cargo</label>
                    <input
                      id="cargo"
                      name="cargo"
                      value={form.cargo}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}

              <div className="auth-field">
                <label htmlFor="email">Correo</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="contrasena">Contraseña</label>
                <input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  value={form.contrasena}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="rol">Rol</label>
                <select id="rol" name="rol" value={form.rol} onChange={handleChange}>
                  <option value="ESTUDIANTE">ESTUDIANTE</option>
                  <option value="EMPLEADO">EMPLEADO</option>
                </select>
              </div>

              <div className="auth-actions">
                <button className="auth-button" type="submit" disabled={loading}>
                  {loading ? 'Registrando...' : 'Registrarse'}
                </button>
                <a href="/login" className="auth-link">
                  Ya tengo cuenta
                </a>
              </div>
            </form>
          </>
        ) : (
          <>
            <h1>Verifica tu correo</h1>
            <p>Se ha enviado un código de 6 dígitos a {correoEnviado}</p>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <form className="auth-form" onSubmit={handleVerificarCodigo}>
              <div className="auth-field">
                <label htmlFor="codigo">Código de Verificación</label>
                <input
                  id="codigo"
                  type="text"
                  maxLength="6"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="000000"
                  required
                  autoFocus
                  style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '5px' }}
                />
                <small style={{ color: '#999', marginTop: '5px', display: 'block' }}>
                  El código expira en {tiempoExpiracion} minutos
                </small>
              </div>

              <div className="auth-actions">
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => {
                    setPaso(1);
                    setCodigo('');
                  }}
                >
                  Volver
                </button>
                <button className="auth-button" type="submit" disabled={loading}>
                  {loading ? 'Verificando...' : 'Verificar Código'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
