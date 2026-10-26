# Inventario de Equipamiento Tecnológico

Proyecto de la Evaluación N.º 2 de Lenguaje de Programación Web II del Instituto Profesional Virginio Gómez.

## Estudiante

Jostin Paul Valenzuela Arevalo.

## Propósito y estado

El sistema permitirá registrar, listar, consultar, editar, eliminar y buscar equipos tecnológicos. Etapa 2: conexión MySQL y entidad Equipo implementadas; API e interfaz funcional pendientes.

## Tecnologías

- Frontend: Vue 3, JavaScript y Vite.
- Backend: NestJS 11 y TypeScript.
- Dependencias: npm, con versiones reproducibles en package-lock.json.
- Control de versiones: Git y GitHub.
- Próximas etapas: MySQL, TypeORM, class-validator y class-transformer.

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

Estas rutas todavía no están implementadas:

| Método | Ruta | Operación |
| --- | --- | --- |
| GET | /equipos | Listar |
| GET | /equipos/:id | Consultar |
| POST | /equipos | Registrar |
| PATCH | /equipos/:id | Actualizar |
| DELETE | /equipos/:id | Eliminar |

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
