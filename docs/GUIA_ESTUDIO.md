# Guía de estudio del inventario tecnológico

Esta guía explica el código entregado por Jostin Paul Valenzuela Arevalo. Estudia con el proyecto abierto y las dos aplicaciones funcionando. La meta es que puedas localizar una implementación, explicar su propósito, seguir los datos y hacer una modificación pequeña sin copiar una respuesta de memoria.

## Cómo organizar el estudio

Haz una primera lectura en el orden de esta guía. Después repite el recorrido de creación de un equipo sin mirar la explicación. Finalmente realiza los ejercicios y el simulacro.

| Sesión | Tema                | Evidencia de comprensión                            |
| ------ | ------------------- | --------------------------------------------------- |
| 1      | Arquitectura y HTTP | Dibujar el recorrido completo de una petición       |
| 2      | MySQL y TypeORM     | Explicar entidad, tabla y Repository                |
| 3      | NestJS y validación | Localizar rutas, DTO, servicio y errores            |
| 4      | Vue e integración   | Explicar formulario, reactividad, fetch y recarga   |
| 5      | Práctica y defensa  | Resolver cambios breves y responder cinco preguntas |

Para cada tema usa esta secuencia: lee la explicación, abre el archivo indicado, busca la función, ejecútala y explica el resultado en voz alta. Una definición sin conexión con tu código no basta para la interrogación.

## 1. Explicar el proyecto en un minuto

Puedes comenzar con esta explicación, adaptándola a tus palabras:

> Mi proyecto administra equipamiento tecnológico. El usuario trabaja en una interfaz Vue que permite listar, registrar, consultar, editar, eliminar y buscar equipos. Vue se comunica por HTTP con una API REST en NestJS y usa JSON para enviar y recibir datos. NestJS valida las peticiones con DTO y class-validator. El controlador recibe la petición, el servicio realiza la operación y un Repository de TypeORM accede a MySQL. Los datos quedan guardados aunque se reinicie el backend.

Debes poder demostrar cada afirmación abriendo su implementación. Si te preguntan por el buscador, abre App.vue; si preguntan por persistencia, abre la entidad, el servicio y la configuración.

## 2. Arquitectura y responsabilidades

```text
Usuario
  ↓ interactúa con formulario o botones
Vue y App.vue
  ↓ request() usa fetch(), HTTP y JSON
NestJS: Controller
  ↓ petición validada por pipes y DTO
EquiposService
  ↓ Repository de TypeORM
MySQL: inventario_tecnologico_jostin.equipos
```

El esquema resume el recorrido: la validación del cuerpo y los parámetros ocurre antes de ejecutar el método del controlador.

| Parte      | Responsabilidad en tu proyecto                                          |
| ---------- | ----------------------------------------------------------------------- |
| Vue        | Presentar datos, capturar entradas y mostrar carga, éxito o error       |
| HTTP       | Transportar peticiones y respuestas entre navegador y API               |
| JSON       | Representar los datos intercambiados como texto estructurado            |
| Controller | Asociar rutas y métodos HTTP con operaciones                            |
| Service    | Buscar, crear, actualizar y eliminar; manejar inexistentes y duplicados |
| DTO        | Definir y validar los datos permitidos en una petición                  |
| Entity     | Describir el almacenamiento de un equipo en la base                     |
| Repository | Ejecutar operaciones de persistencia para la entidad                    |
| MySQL      | Almacenar los registros de forma persistente                            |

**Para practicar:** ¿Qué ocurriría si Vue dejara de ejecutarse? Se pierde esa interfaz, pero la API puede seguir respondiendo. ¿Y si MySQL no está disponible? El backend no podrá completar su conexión y sus operaciones de persistencia. ¿Y si se cierra una pestaña? Los registros almacenados en MySQL permanecen.

## 3. Arranque y archivos principales

### backend/src/main.ts

`NestFactory.create(AppModule)` construye la aplicación a partir del módulo principal. `setup(app)` activa CORS y validación. `app.listen(...)` abre el puerto de la API, por defecto 3000. El catch final informa errores de arranque y asigna un código de salida de error.

`async` permite usar `await`. Una función async devuelve una promesa. `await` espera su resultado dentro de esa función; no congela por sí mismo todo el servidor.

### backend/src/app.module.ts

El decorador `@Module` describe cómo se organiza la aplicación. `ConfigModule.forRoot({ isGlobal: true })` carga variables de entorno y permite usar ConfigService en los módulos. `EquiposModule` registra el recurso del inventario. `TypeOrmModule.forRootAsync` configura la conexión usando ConfigService.

`getOrThrow` falla si falta una variable requerida. El puerto usa `Number(...)` porque las variables de entorno son texto. El booleano se obtiene comparando con `'true'`: no se usa `Boolean('false')`, que daría true porque es una cadena no vacía.

Los archivos app.controller.ts y app.service.ts conservan la ruta inicial generada. El CRUD real está en la carpeta equipos; no debes confundir esa ruta inicial con el recurso del inventario.

### backend/src/equipos/equipos.module.ts

`TypeOrmModule.forFeature([Equipo])` hace disponible el Repository de Equipo dentro del módulo. `controllers` registra EquiposController y `providers` registra EquiposService.

**Respuesta que debes poder construir:** «Nest crea el servicio y entrega sus dependencias por inyección. Yo declaro que necesito el Repository de Equipo; no abro una nueva conexión manual en cada método».

## 4. MySQL, entidad y persistencia

Abre backend/src/equipos/equipo.entity.ts.

```typescript
@Entity("equipos")
export class Equipo {
  @PrimaryGeneratedColumn()
  id: number;
}
```

`@Entity('equipos')` relaciona la clase con la tabla equipos. `@PrimaryGeneratedColumn()` define una clave primaria numérica generada automáticamente. El cliente no decide ese ID en el POST.

Cada `@Column` describe una columna. `length` limita el almacenamiento de textos varchar. `unique: true` crea la restricción de unicidad del código de inventario. `nullable: true` permite que observaciones sea NULL en MySQL.

| Campo                          | Decisión y explicación                                                    |
| ------------------------------ | ------------------------------------------------------------------------- |
| id                             | Identificador interno autogenerado; sirve para rutas y relaciones futuras |
| codigoInventario               | Identificador institucional único, distinto del ID interno                |
| nombre                         | Texto descriptivo de hasta 120 caracteres                                 |
| tipo, marca, modelo, ubicacion | Textos obligatorios con longitudes delimitadas                            |
| estado                         | Enum con Disponible, En uso, Mantención y Baja                            |
| fechaAdquisicion               | Columna DATE: almacena una fecha sin hora                                 |
| observaciones                  | Texto opcional; permite NULL                                              |

El enum aparece en la entidad y también se reutiliza en el DTO. El frontend tiene su lista de estados para construir el selector; si se cambia el conjunto de estados, hay que mantener ambas partes coherentes.

La fecha se maneja como una cadena YYYY-MM-DD en la API y como DATE en MySQL. Así la adquisición no representa un instante con zona horaria. En la interfaz se usa Intl.DateTimeFormat para presentarla en formato chileno; la hora local añadida es solo para formatearla, no un dato que se guarde.

### Qué hace synchronize

Con DB_SYNCHRONIZE=true, TypeORM ajusta el esquema según la entidad al arrancar. Es cómodo para este desarrollo local, pero los cambios de esquema deben controlarse con migraciones en producción. No lo describas como una estrategia de respaldo ni como garantía de conservar datos ante cualquier cambio de entidad.

### Crear la base y cargar ejemplos son operaciones distintas

- scripts/create-database.cjs crea la base si no existe. No crea los cinco equipos. Valida el nombre antes de incorporarlo al SQL, porque un identificador de base no se trata como un valor de consulta común.
- TypeORM crea o ajusta la tabla al iniciar el backend con synchronize activado.
- scripts/seed.cjs envía POST a la API para cargar los cinco equipos. Antes consulta códigos existentes y no los sobrescribe.

La base final es inventario_tecnologico_jostin. Se eligió para aislar el trabajo de datos incompletos preexistentes en otra base local; esos datos anteriores no se eliminaron.

### Repository no es la base en memoria

Abre equipos.service.ts. `Repository<Equipo>` proporciona operaciones para esa entidad. `repository.create(dto)` construye un objeto de entidad en memoria: **todavía no guarda en MySQL**. `repository.save(equipo)` realiza la persistencia. Esta diferencia es una pregunta probable.

| Método usado | Qué hace                                             |
| ------------ | ---------------------------------------------------- |
| find         | Consulta todos, aquí ordenados por ID ascendente     |
| findOneBy    | Busca un registro con una condición, aquí el ID      |
| create       | Construye una entidad en memoria                     |
| merge        | Copia cambios sobre una entidad existente en memoria |
| save         | Inserta o actualiza el registro según su identidad   |
| remove       | Elimina el registro de una entidad ya obtenida       |

## 5. API REST y controlador

Abre backend/src/equipos/equipos.controller.ts.

`@Controller('equipos')` define el prefijo de las rutas. Los decoradores de cada método completan el endpoint.

| Petición          | Método del controlador | Resultado normal         |
| ----------------- | ---------------------- | ------------------------ |
| GET /equipos      | findAll                | 200 y arreglo JSON       |
| GET /equipos/1    | findOne                | 200 y objeto JSON        |
| POST /equipos     | create                 | 201 y equipo creado      |
| PATCH /equipos/1  | update                 | 200 y equipo actualizado |
| DELETE /equipos/1 | remove                 | 204 sin cuerpo           |

`@Body()` obtiene el cuerpo de la petición. `@Param('id', ParseIntPipe)` obtiene el parámetro de ruta y lo convierte a entero válido. El texto de la URL no se vuelve número solo por escribir `id: number`: la anotación de TypeScript no valida una petición en ejecución.

Ejemplo: /equipos/abc devuelve 400 por el pipe. /equipos/0 tiene un entero válido, pero al no existir ese registro devuelve 404 desde el servicio.

PATCH representa una actualización parcial: se puede cambiar solo ubicacion. No se exige reenviar todos los campos. El formulario actual sí envía sus campos editables completos, pero el backend admite la actualización parcial.

El controlador delega en el servicio para concentrar las operaciones de datos en una sola capa. Sus métodos devuelven los resultados o promesas y NestJS produce la respuesta JSON.

## 6. Servicio y manejo de errores

Abre backend/src/equipos/equipos.service.ts y sigue cada método.

### findOne

Busca con `findOneBy({ id })`. Si no hay registro, lanza NotFoundException. Nest la convierte en una respuesta HTTP 404. Esta función se reutiliza antes de actualizar o eliminar, por lo que esas operaciones también informan un ID inexistente.

### create

Construye la entidad a partir del DTO y llama al método privado save. El DTO ya pasó la validación antes de llegar al controlador. La base aporta el ID autogenerado.

### update

Primero obtiene el equipo existente. Después merge copia los campos recibidos y save los persiste. Los campos omitidos en PATCH conservan su valor previo.

### remove

Busca el equipo y lo elimina. El controlador define HTTP 204: la respuesta de borrado no contiene un JSON que el frontend deba leer.

### save y duplicados

El método privado save centraliza el manejo del guardado. Si TypeORM lanza QueryFailedError y MySQL informa ER_DUP_ENTRY, se responde ConflictException: HTTP 409. Otros errores se vuelven a lanzar; no se convierten todos en «código repetido».

La restricción UNIQUE de MySQL es la protección definitiva del código. Una comprobación previa en JavaScript por sí sola no evitaría que dos peticiones simultáneas intentaran guardar el mismo código.

## 7. DTO y validación

Abre backend/src/equipos/dto/create-equipo.dto.ts.

Un DTO define qué datos acepta una operación. La entidad describe cómo se almacenan. Se separan porque las reglas de entrada y las columnas de almacenamiento tienen responsabilidades distintas.

| Decorador               | Uso concreto                                                  |
| ----------------------- | ------------------------------------------------------------- |
| Transform(trim)         | Quita espacios al principio y final si el valor es texto      |
| IsString                | Rechaza valores que no sean cadenas                           |
| MinLength(3)            | Exige al menos tres caracteres en código y nombre             |
| MinLength(1)            | Impide textos obligatorios vacíos tras recortar espacios      |
| MaxLength               | Limita textos para ser coherentes con la entidad y las reglas |
| IsEnum                  | Acepta solo los cuatro estados declarados                     |
| Matches                 | Exige la forma YYYY-MM-DD de la fecha                         |
| IsDateString con strict | Comprueba que la fecha sea real, no solo que tenga formato    |
| IsOptional              | Permite omitir observaciones o enviarla como null             |

`'   '` se recorta a `''` y falla MinLength. La fecha 2025-02-30 tiene apariencia correcta pero no existe; la validación estricta la rechaza. No se implementó una prohibición de fechas futuras, porque la pauta exige una fecha válida y no esa regla adicional.

### ValidationPipe

Abre backend/src/setup.ts.

```typescript
new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});
```

- transform crea instancias del DTO y permite aplicar las transformaciones declaradas. No significa convertir automáticamente cualquier dato al tipo que convenga: nombre: 42 se rechaza.
- whitelist limita el cuerpo a las propiedades con reglas de validación.
- forbidNonWhitelisted hace que una propiedad adicional provoque 400, en lugar de simplemente descartarla.

Enviar `{ id: 999, ...campos }` en un POST se rechaza: id lo genera la base y no está declarado en el DTO de creación.

### DTO de actualización

UpdateEquipoDto utiliza PartialType(CreateEquipoDto, { skipNullProperties: false }). Hereda las reglas, permitiendo omitir campos en PATCH. Un obligatorio no puede anularse con null. Observaciones mantiene su propia regla opcional y sí admite null.

Un PATCH vacío es admitido por la implementación actual: no cambia campos. No afirmes que se rechaza si no agregaste expresamente esa regla.

### Por qué también se valida en el navegador

required, minlength, maxlength y type=date ayudan a corregir entradas antes de enviarlas. La API debe validar igualmente porque puede recibir peticiones de otra herramienta o de un cliente modificado.

## 8. Vue y estado reactivo

Abre frontend/src/App.vue. `<script setup>` contiene la lógica del componente. `<template>` describe la interfaz. Las variables declaradas en script setup pueden utilizarse en la plantilla.

### ref y reactive

`ref([])` crea el estado reactivo del arreglo equipos. En JavaScript se accede mediante equipos.value; Vue desenvuelve los ref al usarlos en la plantilla, por eso allí se escribe equipos.length.

`reactive(vacio())` crea el objeto formulario con campos reactivos. Se accede como formulario.nombre, sin .value. Object.assign reinicia sus propiedades conservando el mismo objeto reactivo.

| Variable                | Propósito                                         |
| ----------------------- | ------------------------------------------------- |
| equipos                 | Lista recibida de la API                          |
| cargando                | Indica una consulta en curso                      |
| guardando               | Evita repetir el envío del formulario             |
| error                   | Error general de comunicación u operación         |
| errorFormulario         | Error mostrado dentro del formulario              |
| mensaje                 | Confirmación de una operación exitosa             |
| busqueda y filtroEstado | Criterios de filtrado local                       |
| formularioAbierto       | Controla la visibilidad del formulario            |
| editandoId              | null para crear; ID del equipo para editar        |
| detalle                 | Equipo consultado para su ficha                   |
| eliminarPendiente       | Equipo seleccionado antes de confirmar el borrado |
| eliminando              | Indica que el borrado está en curso               |

### computed y búsqueda

filtrados deriva una lista a partir de equipos, busqueda y filtroEstado. Vue recalcula el resultado cuando cambian sus dependencias reactivas.

filter selecciona equipos; some comprueba si al menos un campo coincide; includes busca el texto dentro del campo. normalizar quita marcas de acento y convierte a minúsculas. Por eso «mantencion» puede encontrar «Mantención».

La búsqueda y el filtro ocurren en el frontend sobre la lista descargada. No hay un endpoint de búsqueda ni paginación en el backend. Para muchos miles de registros se podría trasladar filtrado y paginación al servidor; eso no está implementado aquí.

disponibles y enUso también son computed: cuentan equipos de la lista completa, independientemente del filtro visible.

### Directivas que debes reconocer

| Código              | Significado                                              |
| ------------------- | -------------------------------------------------------- |
| v-model             | Vincula el valor de una entrada con el estado            |
| v-for               | Repite una parte de la interfaz por cada registro        |
| :key="equipo.id"    | Identifica de forma estable cada fila para Vue           |
| v-if y v-else       | Muestran contenido según una condición                   |
| @click              | Ejecuta un manejador al pulsar                           |
| @submit.prevent     | Maneja el envío sin recargar la página por el envío HTML |
| :disabled           | Vincula el estado deshabilitado a una expresión          |
| {{ equipo.nombre }} | Interpola un valor como texto                            |

No uses el índice del arreglo como explicación de la key: el proyecto utiliza el ID del registro. Vue escapa el contenido interpolado como texto; no se usa v-html para los datos del equipo.

### onMounted y cargar

onMounted(cargar) consulta la API cuando el componente termina de montarse. cargar activa el estado de carga, limpia el error previo y espera request('/equipos'). Si funciona, reemplaza la lista reactiva. Si falla, registra el mensaje. finally desactiva cargando tanto en éxito como en error.

## 9. fetch, HTTP y JSON

Abre frontend/src/api.js.

La URL base procede de VITE_API_URL o de http://localhost:3000. Se elimina una barra final para no construir rutas con dos barras.

request centraliza fetch y la interpretación de las respuestas. Content-Type: application/json indica el formato enviado. Las opciones permiten especificar method y body. GET es el método predeterminado de fetch.

JSON.stringify(formulario) convierte el objeto a texto JSON para enviarlo. response.json() interpreta el JSON recibido y devuelve datos que JavaScript puede utilizar. Son operaciones en sentidos opuestos.

**Punto importante:** fetch normalmente no lanza una excepción solo porque el servidor responde 400 o 404. Por eso el código revisa response.ok. El catch cercano a fetch informa fallos de red o de acceso a la respuesta. Después, los errores HTTP se convierten en Error usando el mensaje del backend.

class-validator puede producir un arreglo de mensajes. Array.isArray detecta ese caso y join los reúne para mostrarlos. HTTP 204 se trata antes de response.json(), ya que un borrado exitoso no tiene cuerpo JSON.

### CORS

El navegador distingue orígenes por protocolo, host y puerto. Vue en localhost:5173 y NestJS en localhost:3000 tienen puertos distintos. enableCors permite al origen configurado acceder a respuestas de la API desde el navegador.

CORS no es autenticación, no sustituye permisos de MySQL ni impide que una herramienta como PowerShell envíe peticiones. En el proyecto no hay login ni autorización por usuario; no se debe afirmar que existen.

## 10. Seguir una operación completa

### Registrar un equipo

1. El usuario pulsa Registrar equipo y se ejecuta nuevo().
2. vacio crea los valores iniciales; Object.assign limpia el formulario; editandoId queda en null.
3. v-model actualiza el objeto formulario mientras se escribe.
4. El navegador comprueba las reglas HTML y @submit.prevent ejecuta guardar.
5. guardar activa guardando y determina que debe usar POST porque editandoId es null.
6. JSON.stringify convierte el formulario en JSON y request llama a fetch.
7. NestJS identifica POST /equipos; ValidationPipe transforma y valida el cuerpo con CreateEquipoDto.
8. El controlador llama a EquiposService.create.
9. repository.create construye la entidad y repository.save ejecuta la inserción.
10. MySQL genera el ID y guarda el registro. NestJS devuelve 201 con el equipo creado.
11. Vue cierra el formulario, muestra éxito y ejecuta cargar para obtener la lista actualizada.
12. La reactividad actualiza las filas y contadores.

Si falla la validación o hay un duplicado, no se cierra el formulario: errorFormulario muestra el mensaje y finally libera el botón.

### Editar

consultar(id, true) obtiene primero la versión de la API. Copia solo los campos presentes en vacio, por lo que no envía id como campo editable. Guarda el ID aparte. guardar elige PATCH /equipos/:id. El servicio busca el registro, combina cambios y guarda.

El operador `?? ''` utiliza cadena vacía si un campo es null o undefined, como puede ocurrir con observaciones. No es lo mismo que ||, que también sustituiría valores como 0 o false.

### Eliminar

El primer botón solo asigna eliminarPendiente y abre la confirmación. Cancelar limpia esa selección sin enviar DELETE. Confirmar ejecuta eliminar, espera el 204 y recarga. La confirmación está en Vue; una petición directa a la API puede eliminar sin ese diálogo.

### Consultar detalle

consultar(id) hace GET por ID y asigna detalle. La ficha muestra los datos devueltos. No se limita a reutilizar la copia de la fila sin consultar el servidor.

## 11. Comandos de ejecución y diagnóstico

Desde la raíz, en dos terminales:

```powershell
# Terminal 1
cd backend
npm.cmd run start:dev
```

```powershell
# Terminal 2
cd frontend
npm.cmd run dev
```

Abrir http://localhost:5173. La API se consulta en http://localhost:3000/equipos. Las dependencias se instalan por separado en cada aplicación; no hay un package.json de ejecución en la raíz.

| Síntoma                           | Qué comprobar                                                       |
| --------------------------------- | ------------------------------------------------------------------- |
| node no reconocido                | Instalación de Node y PATH; abrir nuevamente la terminal            |
| npm.ps1 bloqueado                 | Usar npm.cmd en PowerShell                                          |
| API no conecta con MySQL          | Servicio, host, puerto, credenciales y existencia de base           |
| MySQL 10061                       | Servidor o puerto no disponible; aún no valida la contraseña        |
| MySQL 1045                        | Se llegó al servidor, pero el acceso fue denegado                   |
| Vue informa fallo de comunicación | API iniciada, VITE_API_URL, CORS y pestaña Red del navegador        |
| API devuelve 400                  | Revisar mensaje, DTO y formato del cuerpo o ID                      |
| API devuelve 409                  | Código de inventario repetido                                       |
| EADDRINUSE o puerto ocupado       | Existe otro proceso escuchando; revisar antes de iniciar otra copia |

Un rechazo de CORS puede mostrarse como fallo de comunicación en Vue. Revisa también la consola del navegador para distinguirlo.

## 12. Pruebas y qué demuestran

Lee docs/PRUEBAS.md y los scripts, sin memorizar solo sus mensajes finales.

- npm.cmd run build en cada aplicación comprueba que el código puede compilarse; no demuestra por sí solo que todas las funciones sean correctas.
- npm.cmd run lint en backend revisa reglas de código y aplica correcciones de formato configuradas.
- npm.cmd test -- --runInBand ejecuta la prueba unitaria inicial del servicio/controlador generado, no todo el CRUD.
- npm.cmd run test:api, desde backend con la API activa, hace 26 comprobaciones contra HTTP y MySQL reales. Crea un equipo temporal y lo elimina.
- npm.cmd run test:ui, desde frontend con ambas aplicaciones activas y Chromium instalado, utiliza Playwright para operar la interfaz.
- La persistencia se comprobó comparando los cinco registros completos antes y después de reiniciar NestJS.
- npm.cmd audit consulta avisos conocidos de dependencias en ese momento; cero avisos no demuestra ausencia total de fallos.

En test:api se comprueban CRUD, datos inválidos, propiedades adicionales, duplicados, CORS e inexistentes. En test:ui se comprueban búsqueda por código, filtro, alta, detalle, edición, cancelar y confirmar borrado, fallo de red simulado, reintento y ancho móvil.

Para instalar el navegador de pruebas: npx.cmd playwright install chromium desde frontend. El script de seed se puede repetir sin duplicar los cinco códigos de ejemplo ni sobrescribirlos.

## 13. Git, GitHub y variables de entorno

Git registra versiones localmente. GitHub aloja el repositorio remoto. Un commit y un push son operaciones diferentes.

| Comando            | Explicación                                              |
| ------------------ | -------------------------------------------------------- |
| git status         | Revisa cambios pendientes y estado de la rama            |
| git diff           | Muestra cambios todavía no preparados                    |
| git add            | Prepara contenido para el siguiente commit               |
| git diff --cached  | Revisa exactamente lo preparado                          |
| git commit         | Registra una versión local con autor y mensaje           |
| git push           | Envía commits a la rama remota                           |
| git pull --ff-only | Actualiza la copia local sin crear una fusión automática |
| git log --oneline  | Permite recorrer el historial resumido                   |

El nombre y correo de autoría no autentican en GitHub. La cuenta autorizada para el push es jostinvalenzuela-glitch; sus credenciales son distintas de las de MySQL.

### Tus cinco avances

1. f821737: estructura inicial Vue y NestJS.
2. 8bcf6f0: conexión MySQL y entidad Equipo.
3. 2c2ed7e: CRUD, DTO, errores y pruebas HTTP.
4. 979080b: integración de la interfaz Vue.
5. 1a1af26: pruebas de navegador, correcciones, base aislada y documentación final.

La documentación de estudio puede añadir commits posteriores; el requisito es un mínimo de cinco avances significativos.

### .env y .env.example

.env contiene la configuración real de cada PC y está excluido de Git. .env.example muestra los nombres de variables y valores no secretos para reproducir la instalación. .gitignore evita incorporar determinados archivos no rastreados; no elimina secretos que ya se hayan publicado en el historial.

Las variables VITE_ forman parte de la configuración pública del frontend. Nunca deben contener una contraseña de MySQL. Las credenciales de base se usan en NestJS, no se entregan al navegador.

En otro PC, clonar o actualizar el código, ejecutar npm.cmd ci en cada carpeta, configurar .env, crear la base y ejecutar seed. Git no transporta los registros de MySQL ni el .env local.

## 14. Hablar con honestidad sobre la IA

El README declara que se usó ChatGPT con Codex para explicación, implementación, depuración, pruebas y documentación. No digas que escribiste manualmente cada línea ni que realizaste una revisión que todavía no hiciste.

Después de estudiar y practicar, puedes explicar concretamente qué revisaste: «Seguí el POST desde guardar hasta repository.save; comprobé un error 400; modifiqué una validación y repetí la prueba». Esa afirmación debe corresponder a acciones que realmente hayas realizado. Actualiza la declaración con esas revisiones reales.

La mejor defensa es poder abrir el código, explicar sus decisiones y modificarlo, incluyendo las partes generadas con apoyo de IA.

## 15. Ejercicios de modificación

Hazlos en una copia o rama de práctica. No subas ejercicios incompletos a main.

```powershell
git switch -c practica-interrogacion
```

### Ejercicio A: aumentar el mínimo de nombre a cinco caracteres

1. Busca nombre en CreateEquipoDto y cambia su MinLength a 5.
2. Busca el input correspondiente en App.vue y cambia minlength a 5.
3. Prueba un nombre de cuatro caracteres desde la interfaz y directamente contra la API.
4. Explica por qué la entidad puede conservar length: 120: ese valor es el máximo de almacenamiento, no el mínimo de validación.

### Ejercicio B: cambiar ubicación con PATCH

Usa un ID existente de tu propia base:

```powershell
$cuerpo = @{ ubicacion = 'Sala de estudio' } | ConvertTo-Json
Invoke-RestMethod -Method Patch -Uri http://localhost:3000/equipos/1 -ContentType 'application/json' -Body $cuerpo
```

Confirma que los demás campos siguen iguales. Explica UpdateEquipoDto, merge y save. Este ejercicio sí modifica un registro: restaura después su ubicación original usando la misma operación.

### Ejercicio C: agregar marca a la búsqueda

Busca el arreglo de campos en filtrados y agrega 'marca'. Prueba una marca existente y explica por qué no necesitas modificar la API: el frontend ya recibió ese dato.

### Ejercicio D: cambiar el orden de listado

Cambia id: 'ASC' por id: 'DESC' en findAll. Comprueba que la API y la tabla presentan primero los registros más recientes por ID. Explica que no es una ordenación por fecha de adquisición.

### Ejercicio E: reconocer una propiedad no permitida

```powershell
$cuerpo = @{ campoExtra = 'prueba' } | ConvertTo-Json
Invoke-RestMethod -Method Patch -Uri http://localhost:3000/equipos/1 -ContentType 'application/json' -Body $cuerpo
```

Debes obtener 400, aunque el equipo exista. Localiza forbidNonWhitelisted y explica por qué el servicio no debe guardar ese dato.

### Ejercicio F: agregar una nueva propiedad

Antes de escribir, identifica las capas que cambiarías: entidad y esquema; DTO de creación; frontend vacio y formulario; detalle si corresponde; seed y pruebas según el caso. El DTO de actualización hereda las reglas del DTO de creación. Si el nuevo campo es obligatorio, debes decidir cómo completar los registros que ya existen antes de imponer la restricción. No basta con añadir un input.

Al finalizar los ejercicios, revisa git diff y guarda o revierte cada cambio conscientemente. Regresa a main con git switch main solo después de resolver los cambios pendientes. No uses git reset --hard como solución automática.

## 16. Preguntas para practicar en voz alta

Responde primero sin leer y luego verifica las pistas.

| Pregunta                                  | Elementos que debe contener tu respuesta                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| ¿Qué sucede al registrar un equipo?       | v-model → guardar → POST/JSON → DTO/pipe → controller → service → create/save → MySQL → 201 → cargar |
| ¿Diferencia entre DTO y entidad?          | Entrada y validación frente a esquema y persistencia; mostrar ambos archivos                         |
| ¿Dónde se valida un ID?                   | ParseIntPipe; después findOne determina si existe                                                    |
| ¿create guarda en MySQL?                  | No; construye entidad. save persiste                                                                 |
| ¿Qué evita códigos duplicados?            | UNIQUE en MySQL y traducción de ER_DUP_ENTRY a 409                                                   |
| ¿Por qué validar también en backend?      | Un cliente puede omitir o alterar las reglas HTML                                                    |
| ¿Qué ocurre con una propiedad extra?      | ValidationPipe la rechaza con 400 por forbidNonWhitelisted                                           |
| ¿Qué permite PATCH?                       | Campos omitidos; conserva los demás; no admite null en obligatorios                                  |
| ¿Por qué no leer JSON tras DELETE?        | La respuesta 204 no tiene cuerpo                                                                     |
| ¿Qué diferencia hay entre ref y reactive? | ref usa .value en JS; formulario es un objeto reactivo con propiedades directas                      |
| ¿Dónde se hace la búsqueda?               | computed en Vue sobre la lista descargada                                                            |
| ¿Por qué usar finally?                    | Liberar estado de carga aunque una operación falle                                                   |
| ¿Qué es CORS?                             | Permiso del navegador entre orígenes; no login ni permisos de base                                   |
| ¿Cómo probaste persistencia?              | Comparación de registros e IDs antes/después de reiniciar el backend                                 |
| ¿Qué se necesita en otro PC?              | Código, dependencias, MySQL, .env local, db:create y seed                                            |
| ¿Qué apoyo recibiste de IA?               | Alcance declarado, revisión personal real y responsabilidad sobre el código                          |

## 17. Simulacro de cinco preguntas

Destina aproximadamente tres minutos a cada respuesta y abre los archivos necesarios.

1. Explica el recorrido de edición de un equipo y muestra dónde se elige PATCH.
2. Muestra dónde se impide una fecha imposible y explica por qué verificar solo el formato no basta.
3. Explica el Repository y demuestra qué operación guarda y cuál solo construye un objeto.
4. Modifica el buscador para incluir marca y demuestra que funciona.
5. Explica los cinco avances del historial y el uso declarado de IA.

Evalúa cada respuesta con la rúbrica: dominio conceptual 4 puntos, aplicación al código 4, razonamiento y justificación 4, claridad y autonomía 2. No te asignes puntaje completo si solo recitas una definición sin localizar su implementación.

## 18. Lista final de preparación

- Puedo explicar el proyecto sin leer esta guía.
- Puedo localizar cada capa sin buscar al azar.
- Puedo seguir un POST y un PATCH completos.
- Distingo 400, 404, 409 y 204 con un ejemplo propio.
- Sé por qué la entidad y el DTO son distintos.
- Puedo explicar cada estado reactivo principal de Vue.
- Puedo provocar y resolver un error de comunicación.
- Puedo hacer y comprobar al menos dos modificaciones pequeñas.
- Puedo describir con precisión qué hizo la IA y qué revisé personalmente.
- Tengo el proyecto funcionando, el repositorio público y su URL entregada en Canvas.

Si puedes demostrar estas acciones con tu código, estás preparando comprensión aplicada, que es lo que evalúa la interrogación.
