import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="home-card">
        <div className="home-badge">HoldMyID</div>
        <h1>Tu carnet en un toque</h1>
        <p>Accede, gestiona y visualiza tus carnets desde un solo lugar.</p>
        <div className="home-actions">
          <Link to="/login" className="btn btn-primary">
            Iniciar sesion
          </Link>
          <Link to="/register" className="btn btn-outline">
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
