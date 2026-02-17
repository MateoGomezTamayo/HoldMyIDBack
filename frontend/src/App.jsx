import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className=\"App\">
        <header className=\"header\">
          <h1>HoldMyIDBack</h1>
          <p>Tu cartera digital de credenciales</p>
        </header>
        
        <main className=\"main\">
          <Routes>
            <Route path=\"/\" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className=\"home\">
      <h2>Bienvenido a HoldMyIDBack</h2>
      <p>Digitaliza y gestiona tus credenciales de forma segura</p>
    </div>
  );
}

export default App;
