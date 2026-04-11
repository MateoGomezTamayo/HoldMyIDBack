# ADR-0001: Seleccion del estilo arquitectonico


## 1. Contexto
HoldMyID es una solucion web para gestionar credenciales digitales (carnets de estudiante y empleado) con mecanismos de autenticacion, validacion antifraude, carga de fotografia, codigos QR y validacion RFID.

La implementacion actual del sistema se compone de:
- Frontend web en React.
- Cliente movil (celular) como canal previsto de consumo de la API.
- Backend en Node.js con Express.
- Base de datos relacional MySQL.
- Comunicacion HTTP con intercambio de datos en JSON.
- Despliegue independiente de frontend y backend.

El equipo debe definir y justificar el estilo arquitectonico mas adecuado, de acuerdo con el alcance actual del producto y los escenarios de calidad esperados.

## 2. Decision arquitectonica
Se adopta una arquitectura combinada, integrada por los siguientes estilos:

1. Cliente-Servidor.
2. Monolito modular en el backend.
3. REST como estilo de integracion entre cliente web/movil y servidor.

## 3. Justificacion de la decision

### 3.1 Cliente-Servidor
- Permite separar claramente la capa de experiencia de usuario (cliente web y cliente movil) de la capa de negocio y persistencia (servidor + base de datos).
- Facilita evolucionar ambos canales (web y celular) sin reescribir la logica central.

### 3.2 Monolito modular
- El dominio funcional actual es acotado y puede administrarse de forma eficiente en un unico servicio backend.
- La modularizacion por rutas, controladores, modelos, middleware y utilidades permite mantener bajo acoplamiento interno y buena mantenibilidad.
- Reduce complejidad operativa frente a arquitecturas distribuidas para un equipo pequeno y en etapa de consolidacion funcional.

### 3.3 REST
- Estandariza la comunicacion entre frontend y backend mediante recursos HTTP y respuestas JSON.
- Mejora interoperabilidad, testabilidad y claridad del contrato de integracion.

## 4. Escenarios de calidad y respuesta arquitectonica

### 4.1 Seguridad (prioridad alta)
Escenario:
- Dado un usuario no autenticado, cuando intenta acceder a recursos protegidos, el sistema debe denegar el acceso.

Respuesta arquitectonica:
- Autenticacion basada en JWT.
- Middleware de autorizacion en rutas privadas.
- Cifrado de contrasenas.
- Validaciones antifraude en la capa de negocio.

### 4.2 Mantenibilidad (prioridad alta)
Escenario:
- Dado un nuevo requerimiento funcional, cuando se implementa, el impacto en modulos no relacionados debe ser minimo.

Respuesta arquitectonica:
- Organizacion modular del backend por responsabilidad.
- Separacion explicita entre ruteo, logica de negocio, acceso a datos y middleware transversal.

### 4.3 Desplegabilidad (prioridad media-alta)
Escenario:
- Dado un cambio de interfaz sin cambios de dominio, cuando se publica una nueva version, debe poder desplegarse el cliente web o movil sin recompilar backend.

Respuesta arquitectonica:
- Separacion de servicios en despliegue.
- Contrato REST que desacopla los ciclos de liberacion entre cliente web, cliente movil y servidor.

### 4.6 Compatibilidad movil (prioridad media)
Escenario:
- Dado un usuario desde celular, cuando consulta o valida su carnet, la funcionalidad debe mantenerse consistente con la experiencia web.

Respuesta arquitectonica:
- Reutilizacion del mismo contrato REST para cliente web y cliente movil.
- Logica de negocio centralizada en backend para asegurar reglas uniformes entre canales.

### 4.4 Escalabilidad (prioridad media)
Escenario:
- Dado un aumento de usuarios concurrentes, cuando crece la carga, el sistema debe escalar con minimo impacto en el comportamiento funcional.

Respuesta arquitectonica:
- Escalado horizontal del backend monolitico por replicas.
- Persistencia centralizada en MySQL para mantener consistencia transaccional.
- Posibilidad de evolucion futura a microservicios por dominio si aparecen cuellos de botella sostenidos.

### 4.5 Rendimiento (prioridad media)
Escenario:
- Dado un usuario autenticado, cuando consulta sus carnets, la respuesta debe ser estable y de baja latencia.

Respuesta arquitectonica:
- Flujo de red simple (cliente -> API -> base de datos).
- Consultas acotadas por usuario y operaciones de negocio concentradas en el backend.

## 5. Alternativas evaluadas

### 5.1 Microservicios
Decision: no adoptado en esta etapa.

Razon principal:
- Aumenta la complejidad operativa (observabilidad distribuida, gestion de contratos entre servicios, despliegues coordinados) sin un beneficio proporcional al alcance funcional actual.

### 5.2 Serverless
Decision: no adoptado en esta etapa.

Razon principal:
- Introduce retos potenciales para este contexto (cold starts, gestion de conexiones a base relacional y fragmentacion excesiva de logica).

### 5.3 Monolito no modular
Decision: descartado.

Razon principal:
- Penaliza mantenibilidad, pruebas y evolucion del sistema conforme aumenta la base de codigo.

## 6. Consecuencias

### 6.1 Consecuencias positivas
- Menor complejidad inicial y mayor velocidad de entrega.
- Curva de adopcion accesible para el equipo.
- Trazabilidad funcional y depuracion simplificadas al concentrar la logica de negocio.

### 6.2 Consecuencias negativas
- Escalado por dominio limitado frente a una arquitectura de microservicios.
- Riesgo de crecimiento descontrolado del monolito si no se mantiene disciplina de modularizacion.

## 7. Criterios de reevaluacion
Este ADR debe revisarse si ocurre alguno de los siguientes eventos:
- Crecimiento sostenido de carga que requiera escalado independiente por subdominio.
- Aparicion de nuevos contextos de negocio con necesidades de despliegue autonomo.
- Integraciones externas que demanden fronteras de servicio estrictas y aisladas.

## 8. Evidencia de implementacion
- Backend API: backend/src/index.js
- Modularizacion backend: backend/src/controllers, backend/src/routes, backend/src/models, backend/src/middleware
- Frontend web: frontend/src
- Preparado para cliente movil mediante API REST compartida
- Configuracion de despliegue: railway.toml

## 9. Aprobacion
Decision aprobada por el equipo de desarrollo para la iteracion actual del proyecto.