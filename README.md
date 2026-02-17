# 🎫 HoldMyID

es una cartera digital que permite a los usuarios guardar, ver y gestionar credenciales verificables (carnets de estudiante o empleado) desde cualquier dispositivo. Funciona como una billetera digital donde cada usuario puede tener hasta dos carnets:

Uno de ESTUDIANTE
Uno de EMPLEADO

Además, cada carnet tiene:

Un QR único
Una foto de perfil
Información verificada desde tablas maestras
Prevención antifraude para evitar duplicación de códigos o cédulas



## 📋 Descripción del Proyecto

HoldMyIDBack es una aplicación web responsiva que permite a los usuarios:

✅ Registrarse con seguridad utilizando autenticación JWT (roles: ESTUDIANTE/EMPLEADO)
✅ Generar y almacenar carnets digitales con QR único
✅ Subir fotos de perfil para sus carnets
✅ Gestionar múltiples carnets (hasta 2: uno ESTUDIANTE y uno EMPLEADO)
✅ Acceder a sus credenciales desde cualquier dispositivo
✅ Sistema de prevención de fraude con verificación de propietario
✅ Ver sus credenciales en un formato de cartera digital con efecto flip

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
- **qrcode 1.5** - Generación de códigos QR en formato PNG
- **multer 1.4** - Middleware para carga de archivos (fotos)

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

Configura tu base de datos MySQL según las credenciales que uses.

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

### 5️⃣ Instalar Dependencias

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

### 7️⃣ Ejecutar la Aplicación

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

## 🔗 Endpoints API

### Autenticación

| Método | Endpoint                      | Descripción                             |
| ------ | ----------------------------- | --------------------------------------- |
| POST   | `/api/autenticacion/registro` | Registrar usuario (ESTUDIANTE/EMPLEADO) |
| POST   | `/api/autenticacion/login`    | Iniciar sesión                          |

### Carnets

| Método | Endpoint                          | Descripción                                      |
| ------ | --------------------------------- | ------------------------------------------------ |
| GET    | `/api/carnets`                    | Obtener todos los carnets del usuario            |
| POST   | `/api/carnets/agregar-estudiante` | Agregar carnet ESTUDIANTE (verifica propietario) |
| POST   | `/api/carnets/agregar-empleado`   | Agregar carnet EMPLEADO (verifica propietario)   |
| PUT    | `/api/carnets/:carnetId/foto`     | Subir foto de perfil (multer)                    |

---

## 🔐 Flujo de Autenticación y Seguridad

### Registro e Identificación

```
1. Usuario selecciona rol: ESTUDIANTE o EMPLEADO
   ↓
2. Sistema valida credenciales en tablas maestras:
   - ESTUDIANTE: código_estudiante en tabla Estudiante
   - EMPLEADO: cédula en tabla Empleado
   ↓
3. Backend hashea la contraseña con bcryptjs
   ↓
4. Se crea Usuario + Carnet + QR único
   ↓
5. Se retorna JWT token (exp: 24h)
```

### Prevención de Fraude

```
6. Usuario intenta agregar carnet secundario
   ↓
7. Sistema verifica propietario:
   - Consulta tabla Usuario con Op.ne:
     ¿existe código/cedula bajo OTRO usuario_id?
   ↓
8. Si existe: Rechaza con error 403
   "Este código ya está registrado bajo otro usuario"
   ↓
9. Si no existe: Crea carnet y guarda credencial en Usuario
```

### Gestión de Carnets

```
10. Usuario puede tener máximo 2 carnets:
    - 1 ESTUDIANTE (con carrera)
    - 1 EMPLEADO (con cargo)
    ↓
11. Para cada carnet:
    - Se genera código QR único (PNG BLOB)
    - Se puede subir foto de perfil (BLOB)
    - Se almacenan en tabla Carnet
    ↓
12. Frontend detecta carnets sin foto:
    → Abre modal automático para subir
    ↓
14. Fotos se retornan como base64 para previsualizacion
```

---

## 📊 Esquema de Base de Datos

### Tabla: Usuario

```sql
CREATE TABLE Usuario (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  codigo_estudiante VARCHAR(50) UNIQUE NULL,  -- Guardado cuando agrega carnet ESTUDIANTE
  cedula VARCHAR(20) UNIQUE NULL,              -- Guardado cuando agrega carnet EMPLEADO
  email VARCHAR(100) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,            -- Hasheada con bcryptjs
  rol ENUM('ESTUDIANTE', 'EMPLEADO') NOT NULL,
  activo BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabla: Carnet

```sql
CREATE TABLE Carnet (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL REFERENCES Usuario(id),
  codigo_estudiante VARCHAR(50) NULL,
  rol ENUM('ESTUDIANTE', 'EMPLEADO') NOT NULL,
  numero VARCHAR(50) UNIQUE NOT NULL,
  codigo_qr LONGBLOB NOT NULL,                 -- PNG binario
  foto_perfil LONGBLOB NULL,                   -- JPEG/PNG binario (se retorna como base64)
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabla: Estudiante (Tabla Maestra)

```sql
CREATE TABLE Estudiante (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo_estudiante VARCHAR(50) UNIQUE NOT NULL,
  carrera VARCHAR(100) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: Empleado (Tabla Maestra)

```sql
CREATE TABLE Empleado (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  cargo VARCHAR(100) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## � Estructura del Proyecto

```
HoldMyIDBack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Configuración Sequelize
│   │   ├── controllers/
│   │   │   ├── authController.js    # Registro/Login, genera QR
│   │   │   └── carnetController.js  # CRUD carnets, prevención fraude
│   │   ├── middleware/
│   │   │   └── auth.js              # Verificación JWT
│   │   ├── models/
│   │   │   ├── Usuario.js           # Modelo Usuario
│   │   │   ├── Carnet.js            # Modelo Carnet (con código_qr, foto)
│   │   │   ├── Estudiante.js        # Tabla maestra
│   │   │   ├── Empleado.js          # Tabla maestra
│   │   │   └── index.js             # Asociaciones
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # POST /registro, /login
│   │   │   └── carnetRoutes.js      # GET carnets, POST agregar, PUT foto (multer)
│   │   ├── utils/
│   │   │   ├── crearBaseDatos.js    # Inicializador BD
│   │   │   ├── jwt.js               # Generación JWT
│   │   │   ├── password.js          # Hash bcryptjs
│   │   │   └── ...
│   │   └── index.js                 # Entry point, Express setup
│   ├── .env                         # Variables de entorno
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CarnetCard.jsx       # Efecto flip, muestra anverso/reverso
│   │   │   ├── AddCarnetModal.jsx   # Selector rol (ESTUDIANTE/EMPLEADO)
│   │   │   ├── UploadPhotoModal.jsx # Carga foto con preview
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Login.jsx            # Formulario login
│   │   │   ├── Register.jsx         # Formulario registro (rol selector)
│   │   │   ├── Dashboard.jsx        # Cartera digital (centr. Flexbox)
│   │   │   └── ...
│   │   ├── styles/
│   │   │   ├── CarnetCard.css       # Animación flip, placeholder foto
│   │   │   ├── Dashboard.css        # Flexbox centering
│   │   │   ├── AddCarnetModal.css   # Botones rol, badges
│   │   │   └── UploadPhotoModal.css # Preview, validación archivo
│   │   ├── App.jsx                  # Router principal
│   │   └── index.jsx
│   └── package.json
│
├── README.md                        # Este archivo
└── .gitignore
```

---

## 🧪 Escenarios de Prueba

### Test 1: Registro y Validación de Propietario

```
1. Usuario A se registra:
   - Email: usuarioA@test.com
   - Rol: ESTUDIANTE
   - Código: 202310014
   - Contraseña: test123

2. Usuario B intenta registrarse con MISMO código:
   - ❌ Rechazo: "código_estudiante ya registrado en tabla Estudiante"

3. Usuario B se registra con código diferente:
   - Código: 202310015
   - Contraseña: test456
   - ✅ Éxito: Crea Usuario + Carnet + QR

4. Usuario A agrega carnet EMPLEADO (segundo carnet):
   - Cédula: 1131110580
   - ✅ Éxito: Verifica cédula en tabla Empleado y Op.ne check

5. Usuario B intenta agregar mismo EMPLEADO carnet:
   - ❌ Rechazo 403: "Esta cédula ya está registrada bajo otro usuario"
```

### Test 2: Gestión de Fotos

```
1. Usuario crea carnet nuevo
   → Dashboard detecta foto_perfil NULL
   → Abre UploadPhotoModal automáticamente

2. Usuario selecciona archivo JPEG (< 5MB)
   → Preview muestra imagen
   → PUT /api/carnets/:id/foto con multipart/form-data
   → Backend guarda BLOB en foto_perfil

3. Frontend mapea foto_perfil → base64
   → CarnetCard muestra foto en anverso
   → Si NULL muestra placeholder (👤)
```

### Test 3: Layout Carnets

```
- 1 carnet: Centrado en pantalla
- 2 carnets: Distribuidos uniformemente con gap: 40px
- Responsive: En móvil, flex-direction: column; align-items: center
```

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

| Nombre              | GitHub                                                   |
| ------------------- | -------------------------------------------------------- |
| Mateo Gómez Tamayo  | [@MateoGomezTamayo](https://github.com/MateoGomezTamayo) |
| Lorenzo Vargas Sala | [@Lorox10](https://github.com/Lorox10)                   |
| Sofia Alzate        | [@sofiaalzate11](https://github.com/sofiaalzate11)       |
| [Integrante 4]      | [GitHub](https://github.com/)                            |
| [Integrante 5]      | [GitHub](https://github.com/)                            |

---

## 📞 Contacto

Para preguntas o sugerencias, abre un issue en GitHub o contacta al equipo de desarrollo.

---

<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella en GitHub ⭐**

</div>
