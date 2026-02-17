import React, { useState, useRef } from 'react';
import axios from 'axios';
import './UploadPhotoModal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function UploadPhotoModal({ isOpen, onClose, carnet, token, onPhotoUploaded }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        setError('La foto no debe ser mayor a 5MB');
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files[0]) {
      setError('Por favor selecciona una foto');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('foto', fileInputRef.current.files[0]);

      await axios.put(
        `${API_URL}/api/carnets/${carnet.id}/foto`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccess('Foto cargada exitosamente');
      fileInputRef.current.value = '';
      setPreview(null);

      setTimeout(() => {
        onPhotoUploaded();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar la foto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !carnet) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Agregar Foto al Carnet</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="upload-body">
          <p className="upload-title">
            {carnet.rol === 'ESTUDIANTE' 
              ? `${carnet.nombre} ${carnet.apellidos} (${carnet.codigo_estudiante})` 
              : `${carnet.nombre} ${carnet.apellidos} (${carnet.codigo_estudiante})`}
          </p>

          {/* Preview de la foto */}
          <div className="photo-preview-container">
            {preview ? (
              <img src={preview} alt="Preview" className="photo-preview" />
            ) : (
              <div className="photo-placeholder">
                <div className="placeholder-icon">📷</div>
                <p>Selecciona una foto</p>
              </div>
            )}
          </div>

          {/* Input de archivo */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
            id="photo-upload"
          />

          <label htmlFor="photo-upload" className="file-label">
            Elegir archivo
          </label>

          {/* Mensajes */}
          {error && <div className="upload-error">{error}</div>}
          {success && <div className="upload-success">{success}</div>}

          {/* Instrucciones */}
          <div className="upload-instructions">
            <p>💡 Recomendaciones:</p>
            <ul>
              <li>Una foto clara de frente</li>
              <li>Sin sombreros ni accesorios en el rostro</li>
              <li>Fondo blanco o neutro</li>
              <li>Máximo 5MB</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-submit"
              onClick={handleUpload}
              disabled={loading || !preview}
            >
              {loading ? 'Cargando...' : 'Cargar Foto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPhotoModal;
