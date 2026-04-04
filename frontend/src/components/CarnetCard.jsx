import React, { useState } from 'react';
import './CarnetCard.css';
import fondoCarnet from '../assets/images/Fondo_Carnet.png';
import logoIush from '../assets/images/LogoIush.png';
import RfidActivateModal from './RfidActivateModal';

function CarnetCard({ estudiante, token, onRfidUpdated }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRfidModal, setShowRfidModal] = useState(false);

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
          <div className="carnet-back-reader" aria-hidden="true">
            <div className="reader-icon-wrap">
              <div className="reader-phone"></div>
              <div className="reader-wave wave-1"></div>
              <div className="reader-wave wave-2"></div>
              <div className="reader-wave wave-3"></div>
            </div>
            <h3>Acercar al lector</h3>
            <p className="carnet-back-subtitle">Coloca el carnet cerca para leer el RFID</p>
          </div>
          <div className="carnet-back-rfid" onClick={(e) => e.stopPropagation()}>
            <span className={`carnet-rfid-status ${estudiante.rfid_activo ? 'ok' : 'off'}`}>
              {estudiante.rfid_activo ? 'RFID ON' : 'RFID OFF'}
            </span>
            <button
              className="btn-rfid-activate"
              title="Configurar UID"
              aria-label="Configurar UID"
              onClick={(e) => {
                e.stopPropagation();
                setShowRfidModal(true);
              }}
            >
              UID
            </button>
          </div>
        </div>
      </div>

      <RfidActivateModal
        isOpen={showRfidModal}
        onClose={() => setShowRfidModal(false)}
        carnet={estudiante}
        token={token}
        onRfidUpdated={onRfidUpdated}
      />
    </div>
  );
}

export default CarnetCard;
