# 🎫 HoldMyIDBack

> Una cartera digital segura e interoperable diseñada para centralizar y gestionar credenciales verificables en un único ecosistema accesible.

---

## 📋 Descripción del Proyecto

HoldMyIDBack es una aplicación web responsiva que permite a los usuarios:

✅ Registrarse con seguridad utilizando autenticación JWT
✅ Subir y almacenar digitalmente sus credenciales (carnets universitarios, etc.)
✅ Acceder a sus credenciales desde cualquier dispositivo
✅ Ver sus credenciales en un formato de cartera digital

---

## 🛠️ Tecnologías Empleadas

### 💻 Frontend

- **React 18.2** - Librería para interfaces de usuario
- **React Router 6.8** - Enrutamiento entre páginas
- **Axios 1.3** - Cliente HTTP para peticiones a la API
- **Zustand 4.3** - Gestión de estado global
- **Tailwind CSS 3.2** - Framework CSS para estilos
- **TypeScript** - Tipado estático (opcional en componentes)

### 🔧 Backend

- **Node.js** - Entorno de ejecución JavaScript
- **Express 4.18** - Framework web para API REST
- **Sequelize 6.35** - ORM para bases de datos
- **MySQL2 3.1** - Controlador MySQL
- **JWT (jsonwebtoken 9.0)** - Autenticación segura
- **bcryptjs 2.4** - Hash de contraseñas
- **CORS 2.8** - Permitir peticiones desde el frontend
- **dotenv 16.0** - Gestión de variables de entorno

### 🗄️ Base de Datos

- **MySQL 8.0+** - Base de datos relacional

---

## 📦 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

| Herramienta | Versión | Enlace                                        |
| ----------- | ------- | --------------------------------------------- |
| Node.js     | 16+     | [Descargar](https://nodejs.org/)              |
| npm / yarn  | 7+      | Viene con Node.js                             |
| MySQL       | 8.0+    | [Descargar](https://www.mysql.com/downloads/) |
| Git         | Última  | [Descargar](https://git-scm.com/)             |

Verifica las instalaciones:

```bash
node --version
npm --version
mysql --version
git --version
```

---

## 🚀 Instalación y Configuración

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/MateoGomezTamayo/HoldMyIDBack.git
cd HoldMyIDBack
```

### 2️⃣ Configurar Base de Datos MySQL

#### Opción A: Línea de comandos MySQL

```bash
mysql -u root -p
```

Luego ejecuta este script SQL:

```sql
CREATE DATABASE holdmyidback CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE holdmyidback;

-- Tabla de usuarios
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  universidad VARCHAR(100),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE
);

-- Tabla de carnets
CREATE TABLE carnets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  numero VARCHAR(50) UNIQUE NOT NULL,
  expedicion DATE,
  vencimiento DATE,
  imagen_qr LONGBLOB,
  archivo_pdf LONGBLOB,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de sesiones
CREATE TABLE sesiones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  fecha_expiracion DATETIME,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

#### Opción B: Cliente MySQL (MySQL Workbench)

1. Abre MySQL Workbench
2. Conecta con tus credenciales
3. Copia el SQL anterior en una nueva pestaña de Query
4. Ejecuta (Ctrl+Shift+Enter)

### 3️⃣ Configurar Variables de Entorno

#### Backend

Copia el archivo `.env.example` a `.env`:

```bash
cd backend
cp .env.example .env
```

Edita `backend/.env` con tus credenciales:

```env
# Puerto del servidor
PORT=5000

# Base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_contraseña_mysql
DB_NAME=holdmyidback
DB_PORT=3306

# JWT Secret (genera una cadena segura)
JWT_SECRET=tu_secret_key_super_segura_aqui_cambiar_en_produccion

# Entorno
NODE_ENV=development
```

### 4️⃣ Instalar Dependencias

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 5️⃣ Ejecutar la Aplicación

#### 🔲 Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Deberías ver:

```
✓ Conexión a MySQL establecida correctamente
Servidor corriendo en puerto 5000
```

#### 🌐 Terminal 2 - Frontend

```bash
cd frontend
npm start
```

Se abrirá automáticamente en `http://localhost:3000`

---

## 📁 Estructura del Proyecto

```
HoldMyIDBack/
├── backend/
│   ├── src/
│   │   ├── index.js              # Punto de entrada del servidor
│   │   ├── config/
│   │   │   └── database.js       # Configuración de MySQL con Sequelize
│   │   ├── routes/               # Rutas de la API
│   │   ├── controllers/          # Lógica de negocio
│   │   ├── models/               # Modelos de Sequelize
│   │   ├── middleware/           # Middlewares (autenticación, etc)
│   │   └── utils/                # Funciones auxiliares
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── index.jsx             # Punto de entrada de React
│   │   ├── App.jsx               # Componente principal
│   │   ├── App.css               # Estilos principales
│   │   ├── index.css             # Estilos globales
│   │   ├── components/           # Componentes reutilizables
│   │   ├── pages/                # Páginas principales
│   │   ├── services/             # Servicios (llamadas a API)
│   │   ├── hooks/                # Hooks personalizados
│   │   └── context/              # Contexto de estado global
│   ├── public/
│   │   └── index.html            # HTML principal
│   ├── package.json
│   └── .gitignore
│
├── README.md
└── .gitignore
```

---

## 🔗 Endpoints API

La API seguirá la estructura RESTful:

| Método | Endpoint             | Descripción                 |
| ------ | -------------------- | --------------------------- |
| POST   | `/api/auth/register` | Registro de usuario         |
| POST   | `/api/auth/login`    | Login de usuario            |
| GET    | `/api/auth/verify`   | Verificar token JWT         |
| GET    | `/api/usuarios/:id`  | Obtener datos del usuario   |
| GET    | `/api/carnets`       | Obtener carnets del usuario |
| POST   | `/api/carnets`       | Subir nuevo carnet          |
| DELETE | `/api/carnets/:id`   | Eliminar carnet             |

---

## 🔐 Flujo de Autenticación

```
1. Usuario se registra con email y contraseña
   ↓
2. Backend hashea la contraseña con bcryptjs
   ↓
3. Se guarda en la base de datos
   ↓
4. Usuario hace login
   ↓
5. Backend verifica contraseña
   ↓
6. Backend genera JWT token
   ↓
7. Frontend guarda token en localStorage
   ↓
8. Token se envía en headers de peticiones autenticadas
   ↓
9. Middleware en backend valida token en cada petición
```

---

## 👥 Guía de Contribución

Este proyecto es desarrollado por 5 miembros del equipo. Para mantener orden:

### 🌳 Ramas

- `main` - ✅ Código estable (solo merges desde development)
- `development` - 🔄 Rama de integración principal
- `feature/nombre-feature` - ✨ Para nuevas características
- `fix/nombre-bug` - 🐛 Para correcciones

### 📝 Workflow

1. Crea una rama desde `development`:

   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/tu-feature
   ```

2. Realiza tus cambios y commits:

   ```bash
   git add .
   git commit -m "Descripción clara del cambio"
   ```

3. Push a GitHub:

   ```bash
   git push origin feature/tu-feature
   ```

4. Crea un Pull Request en GitHub

### 📌 Convenciones de Commits

```
[TIPO] Descripción breve

Tipos disponibles:
- [feat] Nueva funcionalidad
- [fix] Corrección de bug
- [docs] Cambios en documentación
- [style] Cambios de estilos
- [refactor] Refactorización de código

Ejemplo: [feat] Agregar página de login
```

---

## 🐛 Solución de Problemas

### ❌ Error de Conexión a MySQL

**Problema:** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solución:**

1. Verifica que MySQL está corriendo
2. Revisa las credenciales en `.env`
3. Asegúrate que la base de datos existe

```bash
# Windows - Verificar MySQL
Get-Service | Where-Object {$_.Name -eq "MySQL80"}

# Si no está corriendo, inicia el servicio
net start MySQL80
```

### ❌ Puerto 3000 o 5000 en uso

```bash
# Cambiar puerto en .env si es necesario
PORT=5001
```

### ❌ Errores de dependencias

```bash
# Limpiar cache de npm
npm cache clean --force
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

---

## 👨‍💻 Autores

- 👤 Mateo Gómez Tamayo
- 👤 Lorenzo Vargas Sala
- 👤 [Agregar otros miembros del equipo]

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver archivo LICENSE para más detalles.

---

## 📞 Contacto

Para preguntas o sugerencias, abre un issue en GitHub o contacta al equipo de desarrollo.

---

<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella en GitHub ⭐**

</div>
