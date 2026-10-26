# Verificación funcional

## Preparación

Configurar backend/.env según el README. Iniciar MySQL y backend en puerto 3000; iniciar frontend en puerto 5173. Ejecutar npm.cmd run seed desde backend para disponer de los cinco equipos de demostración. Usar una base local de desarrollo.

## API contra MySQL real

Desde backend ejecutar npm.cmd run test:api. Se realizan 26 comprobaciones HTTP con un registro temporal: CRUD completo, código duplicado 409, DTO inválido 400, propiedades extra 400, fechas imposibles 400, null en campo obligatorio 400, ID no numérico 400 y equipo inexistente 404. También se comprueba la cabecera CORS. El registro temporal se elimina al finalizar.

## Interfaz en navegador

Con ambas aplicaciones iniciadas, desde frontend:

```powershell
npx.cmd playwright install chromium
npm.cmd run test:ui
```

La prueba usa Chromium sin ventana. Comprueba listado, búsqueda, filtro de estado, alta, detalle, edición, cancelar borrado, confirmar borrado, fallo de red simulado, reintento y ancho móvil de 390 píxeles. Crea un equipo temporal y lo elimina. Necesita los datos de ejemplo sin alterar para las búsquedas iniciales.

## Compilación y análisis

Desde backend: npm.cmd run lint, npm.cmd test -- --runInBand y npm.cmd run build. Desde frontend: npm.cmd run build. npm.cmd audit consulta avisos de seguridad en cada carpeta.

## Persistencia

1. Consultar GET http://localhost:3000/equipos y anotar los códigos e IDs.
2. Detener solo el backend con Ctrl+C.
3. Reiniciarlo desde backend con npm.cmd run start:dev.
4. Repetir GET /equipos y verificar que los registros mantienen sus IDs y datos.

## Comprobación manual antes de entregar

- Abrir http://localhost:5173 y revisar los cinco equipos.
- Buscar por nombre, código, tipo, ubicación y estado.
- Crear un equipo; abrir su detalle; editarlo; cancelar y después confirmar su eliminación.
- Intentar registrar un código repetido y comprobar el mensaje de la API.
- Detener el backend y pulsar Actualizar para comprobar el mensaje de comunicación. Reiniciarlo y pulsar Reintentar.
- Abrir GitHub sin sesión y comprobar que el repositorio es público.
- Entregar la URL del repositorio en Canvas antes del 28 de octubre de 2026 a las 16:00.

La entrega en Canvas y la revisión personal del estudiante se realizan fuera de estas pruebas automáticas.

## Resultados observados el 26 de octubre de 2026

- Backend y frontend: compilación correcta.
- ESLint backend: cero errores y cero advertencias.
- Jest: una prueba inicial correcta.
- API con MySQL real: 26 comprobaciones correctas.
- Chromium: listado, búsqueda por código, filtro de estado, creación, detalle, edición, cancelación y confirmación de borrado correctos.
- Chromium: fallo de red simulado y reintento correctos; sin desbordamiento horizontal del documento a 390 px.
- Persistencia: comparación completa de los cinco registros antes y después del reinicio de NestJS, sin diferencias.
- npm audit: cero vulnerabilidades en ambas aplicaciones en el momento de la consulta.
- GitHub: repositorio público confirmado mediante consulta sin credenciales.
- Secretos: backend/.env excluido de Git y sin contraseñas reales en los archivos versionados.

Se usa inventario_tecnologico_jostin para aislar este trabajo de una base previa con datos incompletos. No se eliminaron los registros de esa base anterior. Las pruebas de navegador y API limpiaron sus registros temporales; permanecen los cinco equipos de ejemplo.
