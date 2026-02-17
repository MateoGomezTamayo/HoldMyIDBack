import React from 'react';
import CarnetCard from '../components/CarnetCard';
import './Dashboard.css';

function Dashboard() {
  const estudianteDemo = {
    nombre: 'Juan',
    apellidos: 'García López',
    carrera: 'Ingeniería de Sistemas',
    codigo_estudiante: 'ES-2024-001',
    foto_url: 'https://via.placeholder.com/150'
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Mi Cartera Digital</h1>
        <p>Gestiona tu carnet de estudiante</p>
      </div>

      <section className="perfil-section">
        <div className="perfil-info">
          <h2>Hola, {estudianteDemo.nombre}</h2>
          <p>Universidad: Tu Universidad</p>
        </div>
      </section>

      <section className="carnets-section">
        <h3>Mis Carnets</h3>
        <div className="carnets-grid">
          <CarnetCard estudiante={estudianteDemo} />
        </div>

        <button className="btn-add-carnet">
          + Agregar Carnet
        </button>
      </section>
    </div>
  );
}

export default Dashboard;