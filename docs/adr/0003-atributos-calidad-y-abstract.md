# ADR-0003: Priorizacion de atributos de calidad y abstract tecnico

## 1. Contexto y descripcion del problema con cifras

HoldMyID gestiona credenciales digitales universitarias y de personal. El sistema opera con reglas de identidad sensibles, por lo que la calidad no puede quedar enunciada solo de forma cualitativa.

Estado actual observable del proyecto:

- 2 roles principales: ESTUDIANTE y EMPLEADO.
- 2 carnets maximos por usuario (1 de estudiante y 1 de empleado).
- 22 endpoints REST en backend, distribuidos en 4 modulos de rutas:
  - `authRoutes`: 5 endpoints.
  - `carnetRoutes`: 13 endpoints.
  - `usuarioRoutes`: 2 endpoints.
  - `validacionRoutes`: 2 endpoints.
- 5 modelos de dominio principales en backend: Usuario, Carnet, Estudiante, Empleado y VerificacionCodigo.
- 3 middlewares transversales de seguridad/control: autenticacion JWT, limitador general y limitador de login.

Problema arquitectonico:
Aunque ya existe estructura modular y medidas de seguridad base, todavia no hay un marco formal de metas medibles de calidad para evaluar decisiones futuras (cambios de API, crecimiento de carga, endurecimiento de seguridad y mantenibilidad del codigo).

## 2. Decision arquitectonica

Se define una linea base de calidad para la iteracion actual, priorizando 4 atributos:

1. Seguridad.
2. Disponibilidad.
3. Rendimiento.
4. Mantenibilidad.

Cada atributo queda respaldado por escenarios medibles (2 por atributo) para evaluacion tecnica y academica.

## 3. Technical abstract (English)

HoldMyID is a web-based digital wallet for university credentials, supporting two identity roles (student and employee) and up to two credentials per user. The current backend exposes 22 REST endpoints across authentication, credential management, user access, and verification modules. While the project already applies JWT-based authentication, fraud-prevention checks, and modular code organization, it lacks a measurable quality baseline to guide architectural evolution. This ADR defines four prioritized quality attributes: security, availability, performance, and maintainability. For each attribute, two concrete quality scenarios are specified with verifiable response measures (latency percentiles, uptime targets, access-control behavior, and change-impact constraints). The goal is to convert implicit quality expectations into explicit engineering criteria that can be validated during testing, deployment, and future refactoring cycles.

## 4. Atributos de calidad priorizados y justificacion

### 4.1 Seguridad

Justificacion:

- El sistema procesa identificadores personales y credenciales institucionales.
- Existen flujos expuestos a abuso (login, registro, validacion de carnet y RFID).
- Un fallo de seguridad compromete confianza y validez del carnet digital.

### 4.2 Disponibilidad

Justificacion:

- El carnet digital debe poder consultarse cuando el usuario lo necesita (validaciones en tiempo real y acceso desde movil/web).
- Cortes del servicio impactan directamente la operacion academica o administrativa.

### 4.3 Rendimiento

Justificacion:

- El valor de uso depende de respuestas rapidas en login, consulta y validacion de credenciales.
- La latencia alta degrada la experiencia y puede bloquear validaciones en puntos de control.

### 4.4 Mantenibilidad

Justificacion:

- El proyecto combina frontend y backend en evolucion continua.
- La velocidad de cambio debe sostenerse sin introducir regresiones funcionales ni deuda tecnica excesiva.

## 5. Escenarios de calidad (2 por atributo)

### 5.1 Seguridad

Escenario S1 - Acceso no autorizado a rutas protegidas

- Fuente del estimulo: usuario no autenticado o con token invalido.
- Estimulo: intenta consumir endpoints protegidos.
- Artefacto: API REST protegida por middleware JWT.
- Respuesta esperada: el sistema rechaza la solicitud con 401/403 sin exponer datos sensibles.
- Medida de respuesta: 100% de solicitudes no autorizadas son bloqueadas en pruebas funcionales.

Escenario S2 - Reutilizacion indebida de identidad

- Fuente del estimulo: usuario malicioso que intenta registrar codigo o cedula ya vinculados a otro usuario.
- Estimulo: alta de carnet secundario con identificador duplicado.
- Artefacto: logica antifraude de registro/agregado de carnet.
- Respuesta esperada: el sistema deniega la operacion y registra evento de rechazo.
- Medida de respuesta: 100% de intentos de duplicacion son rechazados con codigo de error de negocio.

### 5.2 Disponibilidad

Escenario D1 - Operacion normal mensual

- Fuente del estimulo: trafico regular de usuarios autenticados.
- Estimulo: consultas y actualizaciones de carnets durante el mes.
- Artefacto: servicio backend y conectividad a base de datos.
- Respuesta esperada: continuidad operacional sin interrupciones prolongadas.
- Medida de respuesta: disponibilidad mensual >= 99.5%.

Escenario D2 - Reinicio de servicio backend

- Fuente del estimulo: falla de proceso o redeploy planificado.
- Estimulo: reinicio del servidor de aplicacion.
- Artefacto: API y capa de inicializacion.
- Respuesta esperada: restauracion rapida del servicio sin corrupcion de datos.
- Medida de respuesta: recuperacion operacional <= 5 minutos.

### 5.3 Rendimiento

Escenario R1 - Consulta de carnets

- Fuente del estimulo: usuarios autenticados concurrentes.
- Estimulo: peticiones GET a lista de carnets.
- Artefacto: endpoint de consulta de carnets y acceso a base de datos.
- Respuesta esperada: respuesta consistente con baja latencia.
- Medida de respuesta: percentil 95 <= 300 ms con 50 solicitudes/segundo en pruebas de carga.

Escenario R2 - Inicio de sesion

- Fuente del estimulo: usuarios en hora pico.
- Estimulo: peticiones POST de login.
- Artefacto: endpoint de autenticacion con validacion de credenciales.
- Respuesta esperada: autenticacion estable sin degradacion critica.
- Medida de respuesta: percentil 95 <= 250 ms con 30 solicitudes/segundo en pruebas de carga.

### 5.4 Mantenibilidad

Escenario M1 - Cambio funcional acotado

- Fuente del estimulo: nuevo requerimiento de un endpoint existente.
- Estimulo: agregar validacion de negocio en modulo de carnets.
- Artefacto: estructura modular backend (routes/controllers/models/middleware).
- Respuesta esperada: cambio localizado sin impacto transversal no previsto.
- Medida de respuesta: implementacion en <= 1 dia habil y modificando <= 4 archivos del backend.

Escenario M2 - Prevencion de regresiones

- Fuente del estimulo: refactorizacion de utilidades de seguridad (JWT/password).
- Estimulo: ejecucion de pruebas automatizadas tras el cambio.
- Artefacto: pruebas unitarias en utils y pruebas de integracion basicas.
- Respuesta esperada: deteccion temprana de errores antes de despliegue.
- Medida de respuesta: 100% de pruebas criticas de seguridad en verde antes de merge.

## 6. Consecuencias

### 6.1 Consecuencias positivas

- El equipo dispone de criterios de calidad verificables, no solo descriptivos.
- Las decisiones futuras pueden compararse contra objetivos medibles comunes.
- Se facilita la evaluacion academica y tecnica de la arquitectura.

### 6.2 Consecuencias negativas

- Requiere instrumentacion adicional (metricas de uptime, pruebas de carga y seguimiento de tiempos de cambio).
- Introduce disciplina de medicion que puede aumentar esfuerzo inicial en cada iteracion.

## 7. Criterios de reevaluacion

Este ADR debe revisarse si ocurre alguno de los siguientes eventos:

- Cambio de alcance a mas de 2 tipos de credencial por usuario.
- Incremento sostenido de carga que invalide los umbrales de latencia definidos.
- Incidentes de seguridad que exijan metas mas estrictas o nuevos controles.
- Evolucion a multiples servicios que altere el modelo actual de mantenibilidad.

## 8. Evidencia de implementacion (estado actual)

- API y rutas: `backend/src/routes/authRoutes.js`, `backend/src/routes/carnetRoutes.js`, `backend/src/routes/usuarioRoutes.js`, `backend/src/routes/validacionRoutes.js`.
- Seguridad: `backend/src/middleware/auth.js`, `backend/src/middleware/generalLimiter.js`, `backend/src/middleware/loginLimiter.js`.
- Dominio: `backend/src/models/Usuario.js`, `backend/src/models/Carnet.js`, `backend/src/models/Estudiante.js`, `backend/src/models/Empleado.js`, `backend/src/models/VerificacionCodigo.js`.
- Utilidades de seguridad: `backend/src/utils/jwt.js`, `backend/src/utils/password.js`.

## 9. Aprobacion

Decision propuesta para adopcion en la iteracion actual del proyecto HoldMyID.
