import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CarnetCard from '../components/CarnetCard';
import AddCarnetModal from '../components/AddCarnetModal';
import UploadPhotoModal from '../components/UploadPhotoModal';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard() {
  const navigate = useNavigate();
  const [carnets, setCarnets] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [carnetSinFoto, setCarnetSinFoto] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    cargarCarnets(token);
  }, [navigate]);

  const cargarCarnets = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/carnets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = JSON.parse(localStorage.getItem('user'));

      // Mapear carnets con datos del usuario
      const carnetsMapeados = response.data.data.map((carnet) => ({
        id: carnet.id,
        nombre: userData?.nombre || 'Usuario',
        apellidos: userData?.apellidos || '',
        codigo_estudiante: carnet.codigo_estudiante,
        carrera: carnet.carrera || null,
        cargo: carnet.cargo || null,
        rol: carnet.rol,
        foto_url: carnet.foto_base64 ? `data:image/jpeg;base64,${carnet.foto_base64}` : null,
        qr_base64: carnet.qr_base64,
      }));

      setCarnets(carnetsMapeados);

      // Detectar si hay carnets sin foto
      const primerCarnetSinFoto = carnetsMapeados.find((c) => !c.foto_url);
      if (primerCarnetSinFoto) {
        setCarnetSinFoto(primerCarnetSinFoto);
        setShowPhotoModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar carnets');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Si no hay datos del usuario aún, mostrar loading
  if (!user || loading) {
    return <div className="dashboard" style={{ textAlign: 'center', marginTop: '50px' }}>Cargando...</div>;
  }

  const handleCarnetAdded = () => {
    const token = localStorage.getItem('token');
    cargarCarnets(token);
  };

  const handlePhotoUploaded = () => {
    const token = localStorage.getItem('token');
    cargarCarnets(token);
  };

  const handleLogout = () => {
    // Limpiar el almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirigir a la página de login
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Mi Cartera Digital</h1>
        <p>Gestiona tus carnets</p>
      </div>

      <section className="perfil-section">
        <div className="perfil-info">
          <h2>Hola, {user.nombre}</h2>
          <p>Email: {user.email}</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </section>

      {error && <div style={{ color: 'red', marginLeft: '20px' }}>{error}</div>}

      <section className="carnets-section">
        <h3>Mis Carnets ({carnets.length})</h3>
        <div className="carnets-grid">
          {carnets.length > 0 ? (
            carnets.map((carnet) => <CarnetCard key={carnet.id} estudiante={carnet} />)
          ) : (
            <p>No tienes carnets aún.</p>
          )}
        </div>

        <button className="btn-add-carnet" onClick={() => setShowModal(true)}>
          + Agregar Carnet
        </button>
      </section>

      <AddCarnetModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCarnetAdded={handleCarnetAdded}
        token={localStorage.getItem('token')}
        usuarioId={user.id}
        carnetosActuales={carnets}
      />

      <UploadPhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        carnet={carnetSinFoto}
        token={localStorage.getItem('token')}
        onPhotoUploaded={handlePhotoUploaded}
      />
    </div>
  );
}

export default Dashboard;