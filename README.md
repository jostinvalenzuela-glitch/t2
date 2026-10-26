# Inventario de Equipamiento Tecnológico

Proyecto de la Evaluación N.º 2 de Lenguaje de Programación Web II del Instituto Profesional Virginio Gómez.

## Estudiante

Jostin Paul Valenzuela Arevalo.

## Propósito y estado

Aplicación cliente-servidor para registrar, listar, consultar, editar, eliminar y buscar equipos tecnológicos. Vue consume la API NestJS con HTTP y JSON; TypeORM persiste los datos en MySQL.

## Tecnologías

- Frontend: Vue 3, JavaScript y Vite.
- Backend: NestJS 11 y TypeScript.
- Dependencias: npm, con versiones reproducibles en package-lock.json.
- Control de versiones: Git y GitHub.
- Persistencia: MySQL y TypeORM. Validación: class-validator y class-transformer.

## Requisitos e instalación

Usar Node.js 24.21 o una versión compatible con los package.json, npm, Git y MySQL Server. Este equipo usa Node.js 24.21.0, npm 11.19.0 y MySQL 26.7.0.

Clonar el repositorio antes de instalar:

```powershell
git clone https://github.com/jostinvalenzuela-glitch/t2.git
cd t2
```

Desde la raíz del repositorio, instalar las dependencias de cada aplicación:

```powershell
cd backend
npm.cmd ci
cd ../frontend
npm.cmd ci
```

En Windows usamos npm.cmd para evitar el bloqueo de npm.ps1 por la política de PowerShell. En otros entornos puede usarse npm.

## Ejecución

En una terminal desde la raíz:

```powershell
cd backend
npm.cmd run start:dev
```

La API responde en http://localhost:3000/equipos. Preparar primero la base de datos según la sección siguiente.

En otra terminal desde la raíz:

```powershell
cd frontend
npm.cmd run dev
```

Abrir la URL indicada por Vite, habitualmente http://localhost:5173. Ctrl+C detiene cada proceso.

El frontend usa VITE_API_URL, con valor predeterminado http://localhost:3000. Para cambiarlo, copiar frontend/.env.example a frontend/.env, editarlo y reiniciar Vite. Las variables VITE_ son públicas: nunca contienen contraseñas. Vite usa puerto fijo 5173 para mantener coherencia con CORS.

La pantalla muestra resumen y listado. La búsqueda combina nombre, código, tipo, ubicación o estado, sin distinguir mayúsculas ni tildes; puede combinarse con el filtro de estado. Ver consulta el detalle por ID. Registrar y Editar abren un formulario con validaciones HTML y errores de API. Eliminar solicita confirmación. Las operaciones recargan la lista y muestran su resultado. También hay estados de carga, lista vacía y fallo de comunicación con botón Reintentar.

## Estructura y arquitectura

- backend/src/main.ts: inicia el servidor NestJS.
- backend/src/app.module.ts: módulo principal.
- backend/src/app.controller.ts: ruta inicial generada.
- backend/src/app.service.ts: servicio inicial generado.
- backend/src/setup.ts: ValidationPipe y CORS compartidos.
- backend/src/equipos/equipo.entity.ts: columnas y estados del equipo.
- backend/src/equipos/dto/: reglas de creación y actualización.
- backend/src/equipos/equipos.module.ts: registra el recurso y su Repository.
- backend/src/equipos/equipos.controller.ts: rutas y parámetros HTTP.
- backend/src/equipos/equipos.service.ts: operaciones de persistencia y errores.
- backend/scripts/: creación de base, datos de ejemplo y pruebas HTTP.
- frontend/src/main.js: monta Vue en la página.
- frontend/src/App.vue: componente principal.
- frontend/src/api.js: peticiones HTTP y traducción de errores a mensajes.
- frontend/src/style.css: estilos y adaptación a pantallas pequeñas.
- frontend/scripts/test-ui.cjs: pruebas de navegador.
- docs/PRUEBAS.md: instrucciones y alcance de verificación.

Flujo: usuario → Vue → HTTP/JSON → controlador NestJS → servicio → Repository TypeORM → MySQL.

## Base de datos y variables

Copiar backend/.env.example a backend/.env y completar DB_HOST, DB_PORT, DB_USERNAME y DB_PASSWORD. DB_DATABASE es inventario_tecnologico_jostin. Desde backend ejecutar npm.cmd run db:create (el usuario necesita permiso CREATE) y luego npm.cmd run start:dev. TypeORM crea la tabla equipos desde equipo.entity.ts. DB_SYNCHRONIZE=true se usa solo para desarrollo local; en producción se requieren migraciones. Nunca publicar .env. PORT define el puerto de la API y FRONTEND_ORIGIN el origen permitido para Vue.

Desde la raíz, antes de iniciar el backend por primera vez:

```powershell
Copy-Item backend/.env.example backend/.env
code backend/.env
cd backend
npm.cmd run db:create
npm.cmd run start:dev
```

Completar el archivo en el editor antes de ejecutar db:create. No volver a copiar el ejemplo sobre un .env ya configurado. MySQL debe estar iniciado. No es necesario restablecer la contraseña de MySQL para instalar el proyecto: se utiliza una cuenta local válida con permisos sobre la base.

| Variable        | Función                           | Ejemplo sin secretos          |
| --------------- | --------------------------------- | ----------------------------- |
| DB_HOST         | Servidor MySQL                    | localhost                     |
| DB_PORT         | Puerto MySQL                      | 3306                          |
| DB_USERNAME     | Usuario local MySQL               | completar localmente          |
| DB_PASSWORD     | Contraseña MySQL                  | completar localmente          |
| DB_DATABASE     | Base del proyecto                 | inventario_tecnologico_jostin |
| DB_SYNCHRONIZE  | Crear/ajustar tabla en desarrollo | true                          |
| PORT            | Puerto de NestJS                  | 3000                          |
| FRONTEND_ORIGIN | Origen permitido por CORS         | http://localhost:5173         |
| VITE_API_URL    | URL pública de API en frontend    | http://localhost:3000         |

Equipo contiene id autogenerado, codigoInventario único (3 a 50 caracteres), nombre (3 a 120), tipo, marca, modelo, ubicacion, estado, fechaAdquisicion y observaciones opcionales (hasta 2000). Los textos obligatorios se recortan y no admiten espacios vacíos. Estados válidos: Disponible, En uso, Mantención y Baja.

Verificación etapa 2: base creada sin eliminar datos existentes, conexión TypeORM establecida, tabla equipos y columnas comprobadas con SHOW TABLES y DESCRIBE. El código de inventario es único para evitar identificar dos equipos con el mismo código.

## Endpoints de la API

Rutas implementadas. POST devuelve 201; consultas y PATCH, 200; DELETE, 204 sin cuerpo. Un ID inexistente devuelve 404, un cuerpo inválido 400 y un código duplicado 409.

| Método | Ruta         | Operación  |
| ------ | ------------ | ---------- |
| GET    | /equipos     | Listar     |
| GET    | /equipos/:id | Consultar  |
| POST   | /equipos     | Registrar  |
| PATCH  | /equipos/:id | Actualizar |
| DELETE | /equipos/:id | Eliminar   |

Los DTO validan campos, longitudes, estado y fecha YYYY-MM-DD real. Se recortan espacios de los textos. PATCH admite campos omitidos pero rechaza null en los obligatorios. ValidationPipe transforma el cuerpo a DTO y rechaza propiedades no declaradas mediante whitelist y forbidNonWhitelisted. ParseIntPipe convierte y valida el ID de la ruta. CORS permite el origen configurado para Vue.

Para cargar cinco equipos coherentes sin sobrescribirlos, con la API iniciada ejecutar desde backend: npm.cmd run seed. Para probar contra MySQL real: npm.cmd run test:api. La prueba crea un registro temporal y lo elimina. Se ejecutaron 26 comprobaciones correctas: CRUD, valores inválidos, propiedades extra, duplicados, CORS, IDs inválidos e inexistentes.

## Verificación

El 26 de octubre de 2026 ambas aplicaciones compilaron, ESLint terminó sin errores ni advertencias y Jest pasó su prueba inicial. También pasaron las 26 comprobaciones HTTP contra MySQL y la prueba de navegador del CRUD, filtros, errores y vista móvil. Se compararon los cinco registros completos antes y después de reiniciar el backend y permanecieron idénticos. Los comandos y el alcance están en [docs/PRUEBAS.md](docs/PRUEBAS.md).

npm audit reportó cero vulnerabilidades en frontend y backend después de actualizar NestJS 11 y fijar multer 2.5.0 mediante overrides. Este override corrige una dependencia indirecta y debe revisarse al actualizar NestJS. El resultado de auditoría corresponde a la fecha de consulta.

La base inventario_tecnologico_jostin aísla el trabajo de registros incompletos que ya existían en otra base local. No se borraron esos datos. Los cinco registros de ejemplo permanecen en la base propia y el repositorio es público.

## Desarrollo y commits

1. Estructura inicial Vue y NestJS.
2. Conexión MySQL y entidad Equipo.
3. CRUD y validaciones.
4. Integración del frontend.
5. Pruebas y documentación final.

Historial de avances: f821737 (estructura inicial), 8bcf6f0 (persistencia), 2c2ed7e (CRUD), 979080b (interfaz) y el commit final de pruebas y documentación que contiene este README. Cada fase se compiló o verificó antes de registrar su avance.

Los commits registran avances reales y verificados. git add prepara cambios; git commit registra una versión local; git push envía los commits a GitHub.

Para seguir trabajando desde otro PC, con una copia sin cambios pendientes:

```powershell
git pull --ff-only origin main
```

Después instalar dependencias con npm.cmd ci en backend y frontend y configurar .env local. La base y las contraseñas no se transfieren por Git; ejecutar db:create y seed en ese equipo. Para publicar un avance revisado:

```powershell
git status
git add README.md backend frontend docs
git diff --cached --stat
git commit -m "Descripcion concreta del avance"
git push origin main
```

Antes de preparar archivos comprobar que .env sigue excluido con git check-ignore backend/.env. En otro PC configurar user.name y user.email con git config --local; autenticar el push con una cuenta autorizada en este repositorio. No usar force push para resolver diferencias entre PCs.

## Declaración de uso de IA

Herramienta: ChatGPT con Codex, de OpenAI.

Apoyo recibido: interpretación de la pauta, explicación de arquitectura y comandos, configuración del entorno, generación del código de conexión, entidad, DTO, servicio, controlador e interfaz; depuración; pruebas automáticas; revisión de dependencias y documentación. Codex ejecutó los generadores oficiales de NestJS y Vite, implementó las funciones y configuró la identidad de Git únicamente para este repositorio. También ejecutó las comprobaciones técnicas registradas en docs/PRUEBAS.md.

El estudiante proporcionó sus datos de autoría, autorizó el acceso a GitHub, ejecutó pasos de configuración y recuperación de acceso a MySQL y solicitó mantener documentación y commits por etapas. La revisión y adaptación personal del código generado debe completarse antes de entregar; todavía no se atribuye al estudiante una revisión técnica no confirmada.

El estudiante debe estudiar, revisar y poder explicar o modificar el código entregado.

