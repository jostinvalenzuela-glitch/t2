# Inventario de Equipamiento Tecnológico

Proyecto de la Evaluación N.º 2 de Lenguaje de Programación Web II del Instituto Profesional Virginio Gómez.

## Estudiante

Jostin Paul Valenzuela Arevalo.

## Propósito y estado

Aplicación cliente-servidor para registrar, listar, consultar, editar, eliminar y buscar equipos tecnológicos. Vue consume la API NestJS con HTTP y JSON; TypeORM persiste los datos en MySQL. Etapa 4: interfaz integrada y compilada.

## Tecnologías

- Frontend: Vue 3, JavaScript y Vite.
- Backend: NestJS 11 y TypeScript.
- Dependencias: npm, con versiones reproducibles en package-lock.json.
- Control de versiones: Git y GitHub.
- Persistencia: MySQL y TypeORM. Validación: class-validator y class-transformer.

## Requisitos e instalación

Usar Node.js 24.21 o una versión compatible con los package.json. Este equipo usa Node.js 24.21.0 y npm 11.19.0. Se necesitará MySQL Server al implementar la persistencia.

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

El backend inicial responde en http://localhost:3000.

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
- frontend/src/main.js: monta Vue en la página.
- frontend/src/App.vue: componente principal.

Flujo previsto: usuario → Vue → HTTP/JSON → controlador NestJS → servicio → Repository TypeORM → MySQL.

## Base de datos y variables

Copiar backend/.env.example a backend/.env y completar DB_HOST, DB_PORT, DB_USERNAME y DB_PASSWORD. DB_DATABASE es inventario_tecnologico. Desde backend ejecutar npm.cmd run db:create (el usuario necesita permiso CREATE) y luego npm.cmd run start:dev. TypeORM crea la tabla equipos desde equipo.entity.ts. DB_SYNCHRONIZE=true se usa solo para desarrollo local; en producción se requieren migraciones. Nunca publicar .env. PORT define el puerto de la API y FRONTEND_ORIGIN el origen permitido para Vue.

Verificación etapa 2: base creada sin eliminar datos existentes, conexión TypeORM establecida, tabla equipos y columnas comprobadas con SHOW TABLES y DESCRIBE. El código de inventario es único para evitar identificar dos equipos con el mismo código.

## Endpoints previstos

Rutas implementadas. POST devuelve 201; consultas y PATCH, 200; DELETE, 204 sin cuerpo. Un ID inexistente devuelve 404, un cuerpo inválido 400 y un código duplicado 409.

| Método | Ruta | Operación |
| --- | --- | --- |
| GET | /equipos | Listar |
| GET | /equipos/:id | Consultar |
| POST | /equipos | Registrar |
| PATCH | /equipos/:id | Actualizar |
| DELETE | /equipos/:id | Eliminar |

Los DTO validan campos, longitudes, estado y fecha YYYY-MM-DD real. Se recortan espacios de los textos. PATCH admite campos omitidos pero rechaza null en los obligatorios. ValidationPipe transforma el cuerpo a DTO y rechaza propiedades no declaradas mediante whitelist y forbidNonWhitelisted. ParseIntPipe convierte y valida el ID de la ruta. CORS permite el origen configurado para Vue.

Para cargar cinco equipos coherentes sin sobrescribirlos, con la API iniciada ejecutar desde backend: npm.cmd run seed. Para probar contra MySQL real: npm.cmd run test:api. La prueba crea un registro temporal y lo elimina. Se ejecutaron 26 comprobaciones correctas: CRUD, valores inválidos, propiedades extra, duplicados, CORS, IDs inválidos e inexistentes.

## Verificación

Ambas aplicaciones compilaron correctamente con npm.cmd run build el 26 de octubre de 2026. npm audit reportó cero vulnerabilidades en frontend y backend después de actualizar las dependencias de NestJS 11 y fijar multer ^2.5.0 mediante overrides. Este override actualiza una dependencia indirecta con un aviso de seguridad; debe revisarse al actualizar NestJS. Estas comprobaciones iniciales no sustituyen las pruebas funcionales del inventario.

## Desarrollo y commits

1. Estructura inicial Vue y NestJS.
2. Conexión MySQL y entidad Equipo.
3. CRUD y validaciones.
4. Integración del frontend.
5. Pruebas y documentación final.

Los commits se realizarán sobre avances reales y verificados. git add prepara cambios; git commit registra una versión local; git push envía los commits a GitHub.

## Declaración de uso de IA

Herramienta: ChatGPT con Codex, de OpenAI.

Apoyo recibido: interpretación de la pauta, explicación de arquitectura y comandos, configuración del entorno, generación de documentación y preparación de las aplicaciones mediante generadores oficiales. Codex ejecutó en este equipo los generadores de NestJS y Vite y configuró la identidad de Git únicamente para este repositorio.

El estudiante proporcionó sus datos de autoría y autorizó el acceso a su cuenta de GitHub. La revisión y adaptación del código por parte del estudiante se registrará cuando ocurra; todavía no se atribuyen revisiones o pruebas personales no confirmadas.

El estudiante debe estudiar, revisar y poder explicar o modificar el código entregado. Al finalizar se incluirá una guía de estudio vinculada a los archivos del proyecto.
