# ADR-0002: Estructura interna del repositorio

## 1. Contexto
HoldMyID gestiona credenciales digitales universitarias con dos superficies de usuario diferenciadas: una aplicacion web en React (frontend) y una API REST en Node.js/Express (backend). Ambos componentes evolucionan en paralelo pero tienen ciclos de despliegue independientes, dependencias distintas y equipos de desarrollo potencialmente separados.

La decision clave es como organizar el codigo fuente en el repositorio para garantizar mantenibilidad, claridad de responsabilidades, testabilidad e integracion continua sin friccion.

## 2. Decision arquitectonica
Se adopta un **monorepo con separacion de servicios por directorio de primer nivel**, combinado con **organizacion por capa tecnica** al interior del backend.

La estructura resultante es:

```
/
├── backend/
│   └── src/
│       ├── config/          # Configuracion de base de datos y entorno
│       ├── controllers/     # Logica de negocio por dominio funcional
│       ├── middleware/      # Interceptores transversales (auth, limitadores)
│       ├── models/          # Entidades ORM (Sequelize)
│       ├── routes/          # Definicion de endpoints REST
│       └── utils/           # Utilidades reutilizables (jwt, password, email)
│           └── __tests__/   # Tests unitarios de utilidades
├── frontend/
│   └── src/
│       ├── assets/          # Recursos estaticos (imagenes, fuentes)
│       ├── components/      # Componentes reutilizables de UI
│       └── pages/           # Vistas completas asociadas a rutas
└── docs/
    └── adr/                 # Registro de decisiones arquitectonicas
```

## 3. Justificacion de la decision

### 3.1 Monorepo con directorios separados por servicio
- Permite gestionar ambos servicios desde un unico repositorio, facilitando la navegacion, las revisiones de codigo cruzadas y el versionado atomico de cambios que involucran frontend y backend.
- Los despliegues independientes se preservan mediante configuracion de CI/CD por subdirectorio (Railway, por ejemplo, permite apuntar el build a `backend/` o `frontend/` por separado).
- Reduce la friccion de onboarding: un nuevo colaborador clona un solo repositorio y tiene el sistema completo.

### 3.2 Organizacion por capa tecnica en el backend
- La separacion en `controllers`, `routes`, `models`, `middleware` y `utils` sigue el patron MVC adaptado a APIs REST, ampliamente conocido y documentado.
- Permite localizar rapidamente donde agregar o modificar logica: un nuevo endpoint se crea en `routes/` + `controllers/`; una nueva entidad en `models/`; un interceptor en `middleware/`.
- Facilita el testeo unitario por capa sin necesidad de instanciar el sistema completo.

### 3.3 Organizacion por componente y pagina en el frontend
- La separacion entre `components/` (UI reutilizable) y `pages/` (vistas de ruta) es un patron consolidado en React que reduce el acoplamiento entre logica de presentacion y logica de navegacion.
- Los estilos CSS coubicados con cada componente (mismo nombre, distinta extension) reducen fricciones de busqueda y evitan la proliferacion de archivos CSS globales dificiles de mantener.

### 3.4 Documentacion de decisiones en `docs/adr/`
- Registrar las decisiones arquitectonicas como archivos versionados en el repositorio asegura que el razonamiento detras de cada decision sea trazable, revisable y evolucione junto al codigo.
- Sigue la convencion de Architecture Decision Records (ADR) propuesta por Michael Nygard.

## 4. Escenarios de calidad y respuesta estructural

### 4.1 Mantenibilidad
Escenario:
- Dado un nuevo requerimiento de negocio, cuando se implementa, el desarrollador debe poder ubicar en menos de un minuto el modulo correcto a modificar.

Respuesta estructural:
- La organizacion por capa tecnica en el backend y por responsabilidad (component/page) en el frontend reduce el tiempo de navegacion al minimo necesario.
- Los nombres de archivos son descriptivos y consistentes con el dominio (carnetController, carnetRoutes, Carnet.js).

### 4.2 Testabilidad
Escenario:
- Dado un modulo de utilidad (jwt, password), cuando se prueba de forma aislada, no debe requerir levantar el servidor ni conectarse a base de datos.

Respuesta estructural:
- Los tests unitarios residen en `utils/__tests__/`, coubicados con el codigo que prueban.
- La separacion entre utilidades puras (utils/) y logica de negocio (controllers/) permite probar funciones criticas de seguridad de forma completamente aislada.

### 4.3 Desplegabilidad
Escenario:
- Dado un cambio exclusivo en el frontend, cuando se publica, el backend no debe recompilarse ni reimplementarse.

Respuesta estructural:
- La separacion `/backend` y `/frontend` como raices independientes permite configurar pipelines de CI/CD con filtros de path que disparan solo el despliegue del servicio modificado.

### 4.4 Trazabilidad de decisiones
Escenario:
- Dado un nuevo integrante del equipo, cuando revisa el repositorio, debe poder entender el razonamiento de las decisiones arquitectonicas sin necesidad de documentacion externa.

Respuesta estructural:
- El directorio `docs/adr/` con ADRs numerados y fechados provee contexto historico y justificacion explicita de cada decision significativa.

## 5. Alternativas evaluadas y descartadas

### 5.1 Polyrepo (repositorios independientes por servicio)
Decision: descartado.

Razones:
- Aumenta la friccion de onboarding: clonar, configurar y sincronizar multiples repositorios.
- Dificulta los cambios atomicos que afectan simultaneamente frontend y backend (requiere coordinar pull requests en dos repositorios).
- Complica la trazabilidad de versiones compatibles entre servicios para equipos pequenos.
- Adecuado cuando los servicios tienen equipos completamente separados y ciclos de vida totalmente independientes, lo cual no aplica en la etapa actual del proyecto.

### 5.2 Organizacion por dominio funcional en el backend (Feature-based)
Decision: no adoptado en esta etapa.

Estructura alternativa descartada:
```
src/
├── carnet/
│   ├── carnet.controller.js
│   ├── carnet.routes.js
│   └── carnet.model.js
├── auth/
│   ├── auth.controller.js
│   └── auth.routes.js
```

Razones:
- Agrega navegacion mas intuitiva para dominios muy grandes, pero introduce complejidad innecesaria con el numero actual de entidades (4-5 modelos).
- Puede generar ambiguedad en la ubicacion de logica transversal (middleware de autenticacion, utilidades compartidas).
- Recomendada como evolucion natural si el backend supera los 8-10 dominios funcionales con logica diferenciada.

### 5.3 Estructura plana sin subdirectorios
Decision: descartado.

Razones:
- Todos los archivos en una misma carpeta no escala con el crecimiento del codigo base.
- Imposibilita aplicar convenciones de importacion relativa consistentes.
- Penaliza la mantenibilidad desde las primeras iteraciones del proyecto.

### 5.4 Monorepo con herramienta de gestion (Nx, Turborepo)
Decision: no adoptado en esta etapa.

Razones:
- Introduce dependencias de tooling con curva de aprendizaje no justificada para dos servicios.
- Los beneficios (cache de builds, grafos de dependencia) son relevantes en monorepos con 5+ paquetes o equipos de mas de 5 personas.
- Queda como opcion de evolucion si el repositorio incorpora nuevas aplicaciones (cliente movil nativo, servicios adicionales).

## 6. Buenas practicas aplicadas

- **Coubicacion de tests con el codigo que prueban**: los archivos de test en `__tests__/` dentro del modulo correspondiente facilitan su mantenimiento y evitan desincronizaciones.
- **Coubicacion de estilos con componentes**: cada componente React tiene su CSS asociado en el mismo directorio, siguiendo el principio de cohesion.
- **Nombres consistentes con el dominio**: los archivos siguen el patron `[entidad][Tipo].js` (carnetController, carnetRoutes) para que la busqueda sea predecible.
- **Separacion explicita de configuracion**: `config/database.js` centraliza la conexion a base de datos, evitando que cada controlador gestione sus propias conexiones.
- **Documentacion versionada junto al codigo**: los ADRs en `docs/adr/` forman parte del repositorio y se actualizan con el mismo flujo de revisiones que el codigo fuente.

## 7. Consecuencias

### 7.1 Consecuencias positivas
- Navegacion y onboarding simplificados para nuevos colaboradores.
- Cambios atomicos posibles entre frontend y backend en un solo commit/pull request.
- Tests unitarios de utilidades ejecutables de forma completamente aislada.
- Ciclos de despliegue independientes preservados mediante configuracion de CI/CD por subdirectorio.
- Trazabilidad historica de decisiones mediante ADRs versionados.

### 7.2 Consecuencias negativas
- El monorepo crece en tamano con el tiempo; requiere disciplina para evitar dependencias cruzadas no controladas entre servicios.
- La organizacion por capa tecnica puede dificultar la vision de dominio en proyectos con muchas entidades; requiere reevaluacion si el backend supera los 8-10 modulos funcionales.

## 8. Criterios de reevaluacion
Este ADR debe revisarse si ocurre alguno de los siguientes eventos:
- Incorporacion de un tercer servicio con ciclo de vida propio (cliente movil nativo, microservicio de notificaciones).
- Crecimiento del backend a mas de 8-10 dominios funcionales diferenciados.
- Adopcion de un equipo con mas de 5 personas donde la organizacion por dominio funcional aporte beneficios tangibles de paralelismo de trabajo.

## 9. Evidencia de implementacion
- Estructura de directorios activa: `backend/src/`, `frontend/src/`, `docs/adr/`
- Configuracion de despliegue apuntando a subdirectorios: `railway.toml`
- Tests unitarios coubicados: `backend/src/utils/__tests__/jwt.test.js`, `backend/src/utils/__tests__/password.test.js`
- ADR-0001 como primer registro de decision versionado en `docs/adr/`

## 10. Aprobacion
Decision aprobada por el equipo de desarrollo para la iteracion actual del proyecto.
