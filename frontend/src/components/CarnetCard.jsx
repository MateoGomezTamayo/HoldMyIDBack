import React, { useState } from 'react';
import './CarnetCard.css';
import fondoCarnet from '../assets/images/Fondo_Carnet.png';
import logoIush from '../assets/images/LogoIush.png';

function CarnetCard({ estudiante }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const qrSrc = estudiante.qr_base64
    ? `data:image/png;base64,${estudiante.qr_base64}`
    : null;

  // Mostrar carrera para ESTUDIANTE o cargo para EMPLEADO
  const descripcion = estudiante.rol === 'EMPLEADO' 
    ? (estudiante.cargo || 'Cargo no especificado')
    : (estudiante.carrera || 'Carrera no especificada');

  return (
    <div className="carnet-container" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`carnet-card ${isFlipped ? 'flipped' : ''}`}>
        {/* FRENTE */}
        <div className="carnet-front" style={{ backgroundImage: `url(${fondoCarnet})` }}>
          {/* Franja diagonal azul */}
          <div className="franja-superior"></div>

          {/* Foto */}
          <div className="carnet-foto-section">
            {estudiante.foto_url ? (
              <img src={estudiante.foto_url} alt="Foto" className="carnet-foto" />
            ) : (
              <div className="carnet-foto-placeholder">
                <span>👤</span>
              </div>
            )}
          </div>

          {/* Footer azul */}
          <div className="carnet-footer">
            <div className="carnet-nombre">{estudiante.nombre}</div>
            <div className="carnet-apellidos">{estudiante.apellidos}</div>
            <div className="carnet-codigo">{estudiante.codigo_estudiante}</div>
            <div className="carnet-carrera-wrapper">
              <div className="carnet-carrera">{descripcion}</div>
            </div>
            <div className="carnet-tipo-wrapper">
              <div className="carnet-tipo">{estudiante.rol || 'ESTUDIANTE'}</div>
            </div>
            <img src={logoIush} alt="Logo IUSH" className="carnet-logo" />
          </div>
        </div>

        {/* REVERSO */}
        <div className="carnet-back" style={{ backgroundImage: `url(${fondoCarnet})` }}>
          <h3>QR Code</h3>
          {qrSrc ? (
            <img src={qrSrc} alt="QR" className="qr-image" />
          ) : (
            <div className="qr-box"></div>
          )}
          <p>{estudiante.codigo_estudiante}</p>
        </div>
      </div>
    </div>
  );
}

export default CarnetCard;
