import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddCarnetModal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AddCarnetModal({ isOpen, onClose, onCarnetAdded, token, usuarioId, carnetosActuales = [] }) {
  const [tipoCarnet, setTipoCarnet] = useState(null);
  const [form, setForm] = useState({
    codigo_estudiante: '',
    cedula: '',
    cargo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Detectar qué carnets ya tiene
  const tieneEstudiante = carnetosActuales.some((c) => c.rol === 'ESTUDIANTE');
  const tieneEmpleado = carnetosActuales.some((c) => c.rol === 'EMPLEADO');
  const tieneLimiteCompleto = tieneEstudiante && tieneEmpleado;

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      setTipoCarnet(null);
      setForm({ codigo_estudiante: '', cedula: '', cargo: '' });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoChange = (tipo) => {
    setTipoCarnet(tipo);
    setForm({ codigo_estudiante: '', cedula: '', cargo: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (tipoCarnet === 'ESTUDIANTE') {
        if (!form.codigo_estudiante) {
          throw new Error('El código de estudiante es requerido');
        }

        await axios.post(
          `${API_URL}/api/carnets/agregar-estudiante`,
          {
            codigo_estudiante: form.codigo_estudiante,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSuccess('Carnet de estudiante agregado exitosamente');
      } else if (tipoCarnet === 'EMPLEADO') {
        if (!form.cedula) {
          throw new Error('La cédula es requerida');
        }

        await axios.post(
          `${API_URL}/api/carnets/agregar-empleado`,
          {
            cedula: form.cedula,
            cargo: form.cargo || '',
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSuccess('Carnet de empleado agregado exitosamente');
      }

      setForm({ codigo_estudiante: '', cedula: '', cargo: '' });
      setTipoCarnet(null);

      setTimeout(() => {
        onCarnetAdded();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al agregar carnet');
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
            {/* Selector de Tipo */}
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

            {/* Formulario según tipo seleccionado */}
            {tipoCarnet && (
              <form onSubmit={handleSubmit} className="modal-form">
                {error && <div className="modal-error">{error}</div>}
                {success && <div className="modal-success">{success}</div>}

                {tipoCarnet === 'ESTUDIANTE' ? (
                  <div className="modal-field">
                    <label htmlFor="codigo_estudiante">Código de Estudiante</label>
                    <input
                      id="codigo_estudiante"
                      name="codigo_estudiante"
                      type="text"
                      value={form.codigo_estudiante}
                      onChange={handleChange}
                      placeholder="Ej: 202310014"
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="modal-field">
                      <label htmlFor="cedula">Cédula</label>
                      <input
                        id="cedula"
                        name="cedula"
                        type="text"
                        value={form.cedula}
                        onChange={handleChange}
                        placeholder="Ej: 1131110580"
                        required
                      />
                    </div>

                    <div className="modal-field">
                      <label htmlFor="cargo">Cargo (Opcional)</label>
                      <input
                        id="cargo"
                        name="cargo"
                        type="text"
                        value={form.cargo}
                        onChange={handleChange}
                        placeholder="Ej: Docente, Coordinador"
                      />
                    </div>
                  </>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={onClose}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Agregando...' : 'Agregar Carnet'}
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
