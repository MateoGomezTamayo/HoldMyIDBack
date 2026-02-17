import React, { useState } from 'react';
import './CarnetCard.css';

function CarnetCard({ estudiante }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="carnet-container" onClick={toggleFlip}>
      <div className={`carnet-card ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of card */}
        <div className="carnet-front">
          <div className="franja-superior" />

          <div className="carnet-content">
            <div className="carnet-foto">
              <img src={estudiante.foto_url} alt="Foto del estudiante" />
            </div>

            <div className="carnet-footer">
              <div className="carnet-nombre">
                {estudiante.nombre}
              </div>
              <div className="carnet-apellidos">
                {estudiante.apellidos}
              </div>
              <div className="carnet-carrera">
                {estudiante.carrera}
              </div>
              <div className="carnet-tipo">
                ESTUDIANTE
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="carnet-back">
          <div className="carnet-back-content">
            <h3>Código: {estudiante.codigo_estudiante}</h3>
            <div className="qr-placeholder">
              <p>QR Code</p>
            </div>
            <p className="carnet-instruccion">Toca para ver frente</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarnetCard;