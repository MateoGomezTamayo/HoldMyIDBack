# HoldMyIDBack

Una cartera digital segura e interoperable diseñada para centralizar y gestionar credenciales verificables (como carnets universitarios) en un único ecosistema accesible.

## Características

- Autenticación segura con JWT
- Interfaz responsiva (web y móvil)
- Digitalización de carnets y credenciales
- Gestión centralizada de identidad
- Protección de datos con encriptación

## Estructura del proyecto

\\\
HoldMyIDBack/
 frontend/          # Aplicación React
 backend/           # API Node.js + Express
 README.md
\\\

## Requisitos previos

- Node.js 16+ 
- npm o yarn
- MySQL 8.0+
- Git

## Instalación

### Frontend
\\\ash
cd frontend
npm install
npm start
\\\

### Backend
\\\ash
cd backend
npm install
npm start
\\\

## Variables de entorno

Crea un archivo \.env\ en la carpeta backend:

\\\
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=holdmyidback
JWT_SECRET=your_secret_key
\\\

## Licencia

MIT

## Autores

- Mateo Gómez Tamayo
- Lorenzo Vargas Sala
