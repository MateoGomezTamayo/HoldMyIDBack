# ADR-0003: Estrategia de comunicacion

## 1. Contexto

HoldMyID es una solucion web para gestionar credenciales digitales universitarias y de personal. La arquitectura actual expone una API backend en Node.js/Express consumida por un frontend web en React, con persistencia en MySQL y autenticacion basada en JWT.

En este contexto, el equipo debe definir una estrategia de comunicacion arquitectonica que responda a tres preguntas:

1. Si la comunicacion principal del sistema debe ser sincronica o asincronica.
2. Que tecnologia de integracion conviene adoptar entre las opciones vistas en clase.
3. Como se definiran y gobernaran los contratos de comunicacion entre componentes y futuras integraciones.

La decision debe ajustarse al alcance real del proyecto: un backend monolitico modular, un cliente web activo, un cliente movil previsto a futuro y operaciones que exigen respuesta inmediata como login, consulta de carnets, validacion y actualizacion de datos.

## 2. Decision arquitectonica

Se adopta la siguiente estrategia de comunicacion para la iteracion actual de HoldMyID:

1. **Comunicacion sincronica como mecanismo principal** para las interacciones cliente-servidor criticas del negocio.
2. **REST sobre HTTP/HTTPS con mensajes JSON** como tecnologia de integracion oficial entre frontend, cliente movil futuro y backend.
3. **OpenAPI** como contrato de comunicacion objetivo para documentar endpoints, payloads, codigos de respuesta y reglas de autenticacion.
4. **Comunicacion asincronica reservada para escenarios no criticos o desacoplados** como notificaciones, correos, auditoria o integraciones futuras basadas en eventos.

## 3. Justificacion de la decision

### 3.1 Comunicacion sincronica para el flujo principal

- Los casos de uso centrales del sistema requieren respuesta inmediata: iniciar sesion, consultar carnets, registrar credenciales y validar identidad.
- El frontend necesita confirmacion directa del resultado para actualizar la interfaz y guiar al usuario sin ambiguedades.
- En la arquitectura actual no existen multiples servicios de negocio que justifiquen complejidad adicional de colas, brokers o consistencia eventual para el flujo principal.

### 3.2 REST como tecnologia de integracion

- REST encaja de forma natural con el stack ya implementado en Express y con el consumo desde aplicaciones web y moviles.
- Reduce la complejidad de adopcion, pruebas y depuracion frente a alternativas mas especializadas.
- Aprovecha convenciones ampliamente conocidas: verbos HTTP, codigos de estado, URIs por recurso y cuerpos JSON.

### 3.3 OpenAPI como contrato de comunicacion

- Permite formalizar la API mas alla del codigo fuente y hacer explicitos los contratos que hoy estan implicitos en rutas y controladores.
- Mejora alineacion entre frontend, backend, pruebas y futura documentacion academica o tecnica.
- Facilita versionado, validacion de payloads y generacion de colecciones o clientes si el proyecto evoluciona.

### 3.4 Asincronia limitada a integraciones desacopladas

- La asincronia si aporta valor en tareas secundarias donde no se necesita confirmacion inmediata al usuario final.
- Casos como envio de correos, auditoria o notificaciones pueden ejecutarse de forma diferida sin bloquear el flujo principal.
- Esta decision evita sobredisenar el sistema actual, pero deja una via clara de evolucion si aparecen procesos de larga duracion o integraciones externas adicionales.

## 4. Escenarios de calidad y respuesta comunicacional

### 4.1 Rendimiento

Escenario:

- Dado un usuario autenticado, cuando consulta sus carnets o valida una credencial, el sistema debe responder de forma inmediata y predecible.

Respuesta comunicacional:

- Se utiliza comunicacion sincronica REST de baja complejidad entre cliente y backend.
- Se evita agregar capas intermedias innecesarias en el flujo critico.

### 4.2 Interoperabilidad

Escenario:

- Dado un nuevo consumidor de la API (por ejemplo, un cliente movil), cuando se integra al sistema, debe poder consumir los mismos recursos sin reinterpretar protocolos propietarios.

Respuesta comunicacional:

- Se adopta REST con JSON por ser un estandar ampliamente soportado.
- Se documentan contratos mediante OpenAPI para mantener consistencia entre consumidores.

### 4.3 Mantenibilidad

Escenario:

- Dado un cambio en un endpoint existente, cuando se modifica el comportamiento, los equipos deben identificar con rapidez el contrato afectado y su impacto.

Respuesta comunicacional:

- OpenAPI centraliza la definicion del contrato.
- La estructura modular del backend por rutas y controladores limita el impacto del cambio.

### 4.4 Evolucion

Escenario:

- Dado un proceso secundario de larga duracion, cuando se incorpore al sistema, no debe degradar la experiencia del usuario en operaciones criticas.

Respuesta comunicacional:

- La estrategia permite introducir asincronia solo en esos procesos desacoplados, sin alterar la base REST sincronica del producto.

## 5. Alternativas evaluadas y descartadas

### 5.1 GraphQL

Decision: no adoptado en esta etapa.

Razones:

- El dominio actual no presenta la complejidad de agregacion de datos ni la diversidad de clientes que justifique introducir un grafo de consultas.
- Agrega complejidad de resolvers, control fino de autorizacion y gobernanza de consultas.
- La API actual ya esta organizada por recursos y cubre de forma suficiente los casos de uso del proyecto.

### 5.2 gRPC

Decision: no adoptado en esta etapa.

Razones:

- Ofrece alto rendimiento y contratos fuertes, pero esta mejor alineado con comunicacion servicio a servicio y ecosistemas distribuidos.
- Introduce friccion innecesaria para integracion directa con frontend web, donde REST es mas natural y facil de depurar.
- El proyecto actual no necesita optimizacion binaria ni streaming avanzado entre multiples servicios.

### 5.3 SOAP

Decision: descartado.

Razones:

- Su nivel de formalidad y complejidad es desproporcionado para el alcance actual del producto.
- XML, WSDL y las practicas asociadas aumentan el costo de desarrollo y pruebas sin un beneficio claro en este contexto academico y web.
- La interoperabilidad requerida puede resolverse adecuadamente con REST y OpenAPI.

### 5.4 Comunicacion asincronica como estrategia principal

Decision: no adoptada en esta etapa.

Razones:

- La mayoria de operaciones del sistema requieren confirmacion inmediata al usuario.
- Introducir colas o brokers como base del sistema complicaria la trazabilidad, el manejo de errores y la experiencia de desarrollo.
- La asincronia queda reservada para procesos secundarios donde su valor sea real.

## 6. Contratos de comunicacion

La definicion de contratos para HoldMyID se establece asi:

- **Protocolo principal**: HTTP/HTTPS.
- **Estilo de integracion**: REST.
- **Formato de intercambio**: JSON.
- **Autenticacion**: Bearer token con JWT en encabezado `Authorization`.
- **Definicion formal del contrato**: especificacion OpenAPI para documentar recursos, parametros, cuerpos, respuestas y errores.

Sobre las alternativas de contrato vistas en clase:

- **OpenAPI**: adoptado para la API REST del proyecto.
- **.proto**: descartado por no adoptar gRPC en esta etapa.
- **WSDL**: descartado por no adoptar SOAP.
- **SDL**: descartado por no adoptar GraphQL.

## 7. Buenas practicas aplicadas y acordadas

- Mantener contratos explicitamente versionados cuando se introduzcan cambios incompatibles.
- Estandarizar codigos HTTP y estructuras de error para que todos los endpoints respondan de forma consistente.
- Documentar autenticacion, permisos, payloads y ejemplos de respuesta en OpenAPI.
- Evitar romper compatibilidad con consumidores existentes sin una ruta de migracion definida.
- Reservar la asincronia para tareas desacopladas y no para operaciones que exigen confirmacion inmediata.
- Centralizar validaciones de seguridad y autorizacion en middleware para no duplicar reglas en cada endpoint.
- Usar HTTPS en despliegue y no exponer informacion sensible en mensajes de error.

## 8. Consecuencias

### 8.1 Consecuencias positivas

- La estrategia de comunicacion queda alineada con la arquitectura real del proyecto y con sus necesidades inmediatas.
- Se simplifica el consumo desde frontend web y futuro cliente movil.
- El equipo gana claridad sobre cuando usar sincronia y cuando evaluar asincronia.
- OpenAPI ofrece una base concreta para documentacion, pruebas y evolucion del contrato.

### 8.2 Consecuencias negativas

- REST no ofrece por defecto la rigidez contractual de gRPC ni la flexibilidad de consulta de GraphQL.
- Si el sistema evoluciona a multiples servicios con alta carga interna, puede ser necesario complementar esta decision con otro mecanismo de integracion.
- La documentacion OpenAPI debe mantenerse sincronizada con la implementacion para no perder valor.

## 9. Criterios de reevaluacion

Este ADR debe revisarse si ocurre alguno de los siguientes eventos:

- Aparicion de multiples microservicios que requieran comunicacion servicio a servicio con contratos mas estrictos.
- Necesidad de streaming, alto rendimiento binario o interoperabilidad intensiva entre servicios internos.
- Incorporacion de procesos de negocio largos o desacoplados que hagan necesaria una capa asincronica formal con colas o eventos.
- Multiplicacion de consumidores con necesidades de consulta muy variables que hagan razonable reevaluar GraphQL.

## 10. Evidencia de implementacion

- Backend REST activo en `backend/src/routes/authRoutes.js`, `backend/src/routes/carnetRoutes.js`, `backend/src/routes/usuarioRoutes.js` y `backend/src/routes/validacionRoutes.js`.
- Backend Express centralizado en `backend/src/index.js`.
- Autenticacion por JWT en `backend/src/middleware/auth.js` y `backend/src/utils/jwt.js`.
- Integracion secundaria de correo en `backend/src/utils/emailService.js`.
- Cliente web consumidor de la API en `frontend/src/`.

## 11. Aprobacion

Decision aprobada por el equipo de desarrollo para la iteracion actual del proyecto.
