import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Register() {
  const navigate = useNavigate();
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/registro`, form);
      
      // Guardar token y data del usuario
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      setSuccess('¡Registrado exitosamente! Redirigiendo...');
      
      // Redirigir al dashboard después de 1.5s
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Crear cuenta</h1>
        <p>Registra un nuevo usuario.</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>

          <div className="auth-field">
            <label htmlFor="apellidos">Apellidos</label>
            <input id="apellidos" name="apellidos" value={form.apellidos} onChange={handleChange} required />
          </div>

          {form.rol === 'ESTUDIANTE' && (
            <div className="auth-field">
              <label htmlFor="codigo_estudiante">Codigo de estudiante</label>
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
                <label htmlFor="cedula">Cedula</label>
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
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="auth-field">
            <label htmlFor="contrasena">Contrasena</label>
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
      </div>
    </div>
  );
}

export default Register;
