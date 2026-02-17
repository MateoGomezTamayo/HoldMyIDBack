import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddCarnetModal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AddCarnetModal({ isOpen, onClose, onCarnetAdded, token, usuarioId, carnetosActuales = [] }) {
  const [paso, setPaso] = useState(1); // 1: tipo, 2: cedula, 3: codigo, 4: crear carnet
  const [tipoCarnet, setTipoCarnet] = useState(null);
  const [form, setForm] = useState({
    cedula: '',
    tipo_credencial: '',
    numero: '',
  });
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tiempoExpiracion, setTiempoExpiracion] = useState(10);
  const [verificado, setVerificado] = useState(false);
  const [correoEnviado, setCorreoEnviado] = useState('');

  // Detectar qué carnets ya tiene
  const tieneEstudiante = carnetosActuales.some((c) => c.rol === 'ESTUDIANTE');
  const tieneEmpleado = carnetosActuales.some((c) => c.rol === 'EMPLEADO');
  const tieneLimiteCompleto = tieneEstudiante && tieneEmpleado;

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      setPaso(1);
      setTipoCarnet(null);
      setForm({ cedula: '', tipo_credencial: '', numero: '' });
      setCodigo('');
      setVerificado(false);
      setCorreoEnviado('');
      setTiempoExpiracion(10);
    }
  }, [isOpen]);

  // Contador de expiración
  useEffect(() => {
    let interval;
    if (paso === 3 && tiempoExpiracion > 0) {
      interval = setInterval(() => {
        setTiempoExpiracion((prev) => prev - 1);
      }, 60000); // Actualizar cada minuto
    }
    return () => clearInterval(interval);
  }, [paso, tiempoExpiracion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoChange = (tipo) => {
    setTipoCarnet(tipo);
    setForm({ cedula: '', tipo_credencial: '', numero: '' });
    setCodigo('');
    setError('');
    setVerificado(false);
    setPaso(2);
  };

  const enviarCodigoVerificacion = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!form.cedula) {
        throw new Error(tipoCarnet === 'ESTUDIANTE' ? 'El código de estudiante es requerido' : 'La cédula es requerida');
      }

      const response = await axios.post(
        `${API_URL}/api/validate/send-code`,
        {
          cedula: form.cedula,
          tipo: tipoCarnet,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setCorreoEnviado(response.data.data.correo);
        setTiempoExpiracion(response.data.data.tiempoExpiracion);
        setPaso(3);
        setCodigo('');
        setSuccess('Código enviado al correo registrado');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al enviar el código');
    } finally {
      setLoading(false);
    }
  };

  const verificarCodigoRecibido = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!codigo || codigo.length !== 6) {
        throw new Error('Ingresa un código válido de 6 dígitos');
      }

      const response = await axios.post(
        `${API_URL}/api/validate/verify-code`,
        {
          cedula: form.cedula,
          tipo: tipoCarnet,
          codigo,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setVerificado(true);
        setSuccess('¡Identidad verificada correctamente!');
        setPaso(4);
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Código inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCarnet = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!form.tipo_credencial || !form.numero) {
        throw new Error('El tipo de credencial y número son requeridos');
      }

      await axios.post(
        `${API_URL}/api/carnets`,
        {
          cedula: form.cedula,
          tipo: tipoCarnet,
          tipo_credencial: form.tipo_credencial,
          numero: form.numero,
          verificado: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('¡Carnet agregado exitosamente!');
      setTimeout(() => {
        onCarnetAdded();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al crear carnet');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Agregar Carnet</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {tieneLimiteCompleto ? (
          <div className="modal-body">
            <div className="modal-message" style={{ color: '#d9534f', padding: '20px', textAlign: 'center' }}>
              <p>🚫 Ya tienes el número máximo de carnets (Estudiante y Empleado)</p>
              <p style={{ fontSize: '14px', marginTop: '10px' }}>No puedes agregar más carnets</p>
            </div>
          </div>
        ) : (
          <div className="modal-body">
            {/* PASO 1: Selector de Tipo */}
            {paso === 1 && (
              <div className="tipo-selector">
                <p className="tipo-label">Selecciona el tipo de carnet a agregar:</p>
                <div className="tipo-buttons">
                  <button
                    type="button"
                    className={`tipo-btn ${tipoCarnet === 'ESTUDIANTE' ? 'active' : ''} ${
                      tieneEstudiante ? 'disabled' : ''
                    }`}
                    onClick={() => !tieneEstudiante && handleTipoChange('ESTUDIANTE')}
                    disabled={tieneEstudiante}
                    title={tieneEstudiante ? 'Ya tienes un carnet de estudiante' : ''}
                  >
                    👨‍🎓 Estudiante
                    {tieneEstudiante && <span className="badge">Ya tienes</span>}
                  </button>

                  <button
                    type="button"
                    className={`tipo-btn ${tipoCarnet === 'EMPLEADO' ? 'active' : ''} ${
                      tieneEmpleado ? 'disabled' : ''
                    }`}
                    onClick={() => !tieneEmpleado && handleTipoChange('EMPLEADO')}
                    disabled={tieneEmpleado}
                    title={tieneEmpleado ? 'Ya tienes un carnet de empleado' : ''}
                  >
                    👔 Empleado
                    {tieneEmpleado && <span className="badge">Ya tienes</span>}
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: Ingresar Cédula */}
            {paso === 2 && (
              <form onSubmit={enviarCodigoVerificacion} className="modal-form">
                {error && <div className="modal-error">{error}</div>}

                <div className="paso-header">
                  <h3>Paso 1: Ingresa tu {tipoCarnet === 'ESTUDIANTE' ? 'código de estudiante' : 'cédula'}</h3>
                </div>

                <div className="modal-field">
                  <label htmlFor="cedula">
                    {tipoCarnet === 'ESTUDIANTE' ? 'Código de Estudiante' : 'Cédula'}
                  </label>
                  <input
                    id="cedula"
                    name="cedula"
                    type="text"
                    value={form.cedula}
                    onChange={handleChange}
                    placeholder={tipoCarnet === 'ESTUDIANTE' ? 'Ej: 202310014' : 'Ej: 1131110580'}
                    required
                    autoFocus
                  />
                  <small style={{ color: '#666', marginTop: '5px' }}>
                    Se te enviará un código de verificación al correo registrado
                  </small>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setPaso(1);
                      setTipoCarnet(null);
                    }}
                  >
                    Atrás
                  </button>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Código'}
                  </button>
                </div>
              </form>
            )}

            {/* PASO 3: Ingresar Código */}
            {paso === 3 && (
              <form onSubmit={verificarCodigoRecibido} className="modal-form">
                {error && <div className="modal-error">{error}</div>}
                {success && <div className="modal-success">{success}</div>}

                <div className="paso-header">
                  <h3>Paso 2: Verifica tu código</h3>
                  <p className="paso-subtitle">
                    Hemos enviado un código de 6 dígitos a {correoEnviado || 'tu correo'}
                  </p>
                </div>

                <div className="modal-field">
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
                  <small style={{ color: '#999', marginTop: '5px' }}>
                    El código expira en {tiempoExpiracion} minutos
                  </small>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setPaso(2)}
                  >
                    Atrás
                  </button>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Verificando...' : 'Verificar Código'}
                  </button>
                </div>
              </form>
            )}

            {/* PASO 4: Crear Carnet */}
            {paso === 4 && (
              <form onSubmit={handleCrearCarnet} className="modal-form">
                {error && <div className="modal-error">{error}</div>}
                {success && <div className="modal-success">{success}</div>}

                <div className="paso-header">
                  <h3>Paso 3: Datos de la Credencial</h3>
                  <p className="paso-subtitle">✅ Identidad verificada. Ahora agrega los datos de tu credencial</p>
                </div>

                <div className="modal-field">
                  <label htmlFor="tipo_credencial">Tipo de Credencial</label>
                  <select
                    id="tipo_credencial"
                    name="tipo_credencial"
                    value={form.tipo_credencial}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Selecciona el tipo --</option>
                    <option value="CÉDULA">Cédula</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="LICENCIA">Licencia de Conducir</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div className="modal-field">
                  <label htmlFor="numero">Número de Credencial</label>
                  <input
                    id="numero"
                    name="numero"
                    type="text"
                    value={form.numero}
                    onChange={handleChange}
                    placeholder="Número de credencial"
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={onClose}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Carnet'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddCarnetModal;
