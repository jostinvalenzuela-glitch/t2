<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { request } from "./api";

const estados = ["Disponible", "En uso", "Mantención", "Baja"];
const equipos = ref([]);
const cargando = ref(false);
const guardando = ref(false);
const error = ref("");
const errorFormulario = ref("");
const mensaje = ref("");
const busqueda = ref("");
const filtroEstado = ref("");
const formularioAbierto = ref(false);
const editandoId = ref(null);
const detalle = ref(null);
const eliminarPendiente = ref(null);
const eliminando = ref(false);
const vacio = () => ({
  codigoInventario: "",
  nombre: "",
  tipo: "",
  marca: "",
  modelo: "",
  ubicacion: "",
  estado: "Disponible",
  fechaAdquisicion: "",
  observaciones: "",
});
const formulario = reactive(vacio());
const normalizar = (texto) =>
  String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const filtrados = computed(() =>
  equipos.value.filter(
    (equipo) =>
      ["nombre", "codigoInventario", "tipo", "ubicacion", "estado"].some(
        (campo) =>
          normalizar(equipo[campo]).includes(normalizar(busqueda.value.trim())),
      ) &&
      (!filtroEstado.value || equipo.estado === filtroEstado.value),
  ),
);
const disponibles = computed(
  () => equipos.value.filter((e) => e.estado === "Disponible").length,
);
const enUso = computed(
  () => equipos.value.filter((e) => e.estado === "En uso").length,
);
const badge = (estado) =>
  ({
    Disponible: "disponible",
    "En uso": "uso",
    Mantención: "mantencion",
    Baja: "baja",
  })[estado];
const fecha = (valor) =>
  new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(
    new Date(`${valor}T12:00:00`),
  );

async function cargar() {
  cargando.value = true;
  error.value = "";
  try {
    equipos.value = await request("/equipos");
  } catch (e) {
    error.value = e.message;
  } finally {
    cargando.value = false;
  }
}
function nuevo() {
  Object.assign(formulario, vacio());
  editandoId.value = null;
  errorFormulario.value = "";
  formularioAbierto.value = true;
}
async function consultar(id, editar = false) {
  error.value = "";
  cargando.value = true;
  try {
    const equipo = await request(`/equipos/${id}`);
    if (editar) {
      // Solo copiamos campos editables; id no pertenece al DTO.
      for (const campo of Object.keys(vacio()))
        formulario[campo] = equipo[campo] ?? "";
      editandoId.value = id;
      errorFormulario.value = "";
      formularioAbierto.value = true;
    } else detalle.value = equipo;
  } catch (e) {
    error.value = e.message;
  } finally {
    cargando.value = false;
  }
}
async function guardar() {
  guardando.value = true;
  errorFormulario.value = "";
  mensaje.value = "";
  try {
    const editando = editandoId.value !== null;
    await request(editando ? `/equipos/${editandoId.value}` : "/equipos", {
      method: editando ? "PATCH" : "POST",
      body: JSON.stringify(formulario),
    });
    formularioAbierto.value = false;
    mensaje.value = editando
      ? "Equipo actualizado correctamente."
      : "Equipo registrado correctamente.";
    await cargar();
  } catch (e) {
    errorFormulario.value = e.message;
  } finally {
    guardando.value = false;
  }
}
async function eliminar() {
  eliminando.value = true;
  error.value = "";
  mensaje.value = "";
  try {
    await request(`/equipos/${eliminarPendiente.value.id}`, {
      method: "DELETE",
    });
    eliminarPendiente.value = null;
    mensaje.value = "Equipo eliminado correctamente.";
    await cargar();
  } catch (e) {
    error.value = e.message;
    eliminarPendiente.value = null;
  } finally {
    eliminando.value = false;
  }
}
onMounted(cargar);
</script>

<template>
  <header class="topbar">
    <a class="brand" href="#contenido"
      ><span class="brand-icon" aria-hidden="true">▣</span> EQUIPA
      <span class="brand-sub">/ Inventario tecnológico</span></a
    ><span class="institution">IPVG · Lenguaje de Programación Web II</span>
  </header>
  <main id="contenido" class="container">
    <div class="page-heading">
      <div>
        <p class="eyebrow">ADMINISTRACIÓN DE RECURSOS</p>
        <h1>Equipamiento tecnológico</h1>
        <p class="subtitle">
          Organiza y mantén al día los equipos de tu institución.
        </p>
      </div>
      <button class="primary" @click="nuevo">＋ Registrar equipo</button>
    </div>
    <section class="stats" aria-label="Resumen del inventario">
      <article>
        <span>Equipos registrados</span><strong>{{ equipos.length }}</strong
        ><small>Inventario total</small>
      </article>
      <article>
        <span>Disponibles</span><strong>{{ disponibles }}</strong
        ><small>Listos para utilizar</small>
      </article>
      <article>
        <span>En uso</span><strong>{{ enUso }}</strong
        ><small>Asignados actualmente</small>
      </article>
    </section>
    <p v-if="mensaje" class="notice success" role="status">{{ mensaje }}</p>
    <div v-if="error" class="notice error" role="alert">
      {{ error }}
      <button class="text-button" @click="cargar">Reintentar</button>
    </div>
    <section
      class="inventory"
      aria-labelledby="lista-titulo"
      :aria-busy="cargando"
    >
      <div class="inventory-heading">
        <h2 id="lista-titulo">
          Inventario de equipos <span class="count">{{ equipos.length }}</span>
        </h2>
        <button class="secondary" :disabled="cargando" @click="cargar">
          Actualizar
        </button>
      </div>
      <div class="filters">
        <label class="search"
          >Buscar equipo<input
            v-model="busqueda"
            type="search"
            placeholder="Nombre, código, tipo, ubicación o estado…" /></label
        ><label class="state-filter"
          >Estado<select v-model="filtroEstado" aria-label="Estado">
            <option value="">Todos los estados</option>
            <option v-for="estado in estados" :key="estado">
              {{ estado }}
            </option>
          </select></label
        >
      </div>
      <p v-if="cargando" class="empty" role="status">Consultando equipos…</p>
      <div v-else-if="filtrados.length" class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Tipo</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th class="align-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="equipo in filtrados" :key="equipo.id">
              <td>
                <div class="equipment-cell">
                  <span class="equipment-icon" aria-hidden="true">▱</span>
                  <div>
                    <strong>{{ equipo.nombre }}</strong
                    ><small
                      >{{ equipo.codigoInventario }} · {{ equipo.marca }}
                      {{ equipo.modelo }}</small
                    >
                  </div>
                </div>
              </td>
              <td>{{ equipo.tipo }}</td>
              <td>{{ equipo.ubicacion }}</td>
              <td>
                <span class="badge" :class="badge(equipo.estado)">{{
                  equipo.estado
                }}</span>
              </td>
              <td>
                <div class="actions">
                  <button
                    class="text-button"
                    :aria-label="`Ver ${equipo.nombre}`"
                    @click="consultar(equipo.id)"
                  >
                    Ver</button
                  ><button
                    class="text-button"
                    :aria-label="`Editar ${equipo.nombre}`"
                    @click="consultar(equipo.id, true)"
                  >
                    Editar</button
                  ><button
                    class="text-button danger-text"
                    :aria-label="`Eliminar ${equipo.nombre}`"
                    @click="eliminarPendiente = equipo"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty">
        <h3>
          {{
            equipos.length ? "No hay coincidencias" : "Tu inventario está vacío"
          }}
        </h3>
        <p>
          {{
            equipos.length
              ? "Prueba otra búsqueda o cambia el estado."
              : "Registra tu primer equipo para comenzar."
          }}
        </p>
      </div>
      <div class="table-footer">
        {{ filtrados.length }} de {{ equipos.length }} equipos
        <span>Datos almacenados en MySQL</span>
      </div>
    </section>
    <footer class="footer">
      Jostin Paul Valenzuela Arevalo <span>Evaluación N.º 2 · 2026</span>
    </footer>
  </main>
  <dialog
    :open="formularioAbierto"
    class="modal"
    aria-labelledby="form-titulo"
    @keydown.esc="!guardando && (formularioAbierto = false)"
  >
    <form @submit.prevent="guardar">
      <div class="modal-heading">
        <div>
          <p class="eyebrow">INVENTARIO</p>
          <h2 id="form-titulo">
            {{ editandoId ? "Editar equipo" : "Registrar equipo" }}
          </h2>
        </div>
        <button
          type="button"
          class="close"
          aria-label="Cerrar formulario"
          :disabled="guardando"
          @click="formularioAbierto = false"
        >
          ×
        </button>
      </div>
      <p class="form-help">
        Todos los campos son obligatorios, excepto observaciones.
      </p>
      <p v-if="errorFormulario" class="notice error" role="alert">
        {{ errorFormulario }}
      </p>
      <div class="form-grid">
        <label
          >Código de inventario<input
            v-model="formulario.codigoInventario"
            required
            minlength="3"
            maxlength="50"
            placeholder="INV-006" /></label
        ><label
          >Nombre<input
            v-model="formulario.nombre"
            required
            minlength="3"
            maxlength="120"
            placeholder="Notebook biblioteca"
        /></label>
        <label
          >Tipo<input
            v-model="formulario.tipo"
            aria-label="Tipo"
            required
            maxlength="60"
            list="tipos"
            placeholder="Notebook"
          /><datalist id="tipos">
            <option>Notebook</option>
            <option>PC</option>
            <option>Monitor</option>
            <option>Proyector</option>
          </datalist></label
        ><label
          >Marca<input
            v-model="formulario.marca"
            required
            maxlength="80"
            placeholder="Lenovo"
        /></label>
        <label
          >Modelo<input
            v-model="formulario.modelo"
            required
            maxlength="100"
            placeholder="ThinkPad E14" /></label
        ><label
          >Ubicación<input
            v-model="formulario.ubicacion"
            required
            maxlength="120"
            placeholder="Biblioteca"
        /></label>
        <label
          >Estado<select v-model="formulario.estado" required>
            <option v-for="estado in estados" :key="estado">
              {{ estado }}
            </option>
          </select></label
        ><label
          >Fecha de adquisición<input
            v-model="formulario.fechaAdquisicion"
            type="date"
            required
        /></label>
        <label class="full-width"
          >Observaciones <span class="optional">(opcional)</span
          ><textarea
            v-model="formulario.observaciones"
            maxlength="2000"
            rows="3"
            placeholder="Información adicional"
          ></textarea>
        </label>
      </div>
      <div class="modal-actions">
        <button
          type="button"
          class="secondary"
          :disabled="guardando"
          @click="formularioAbierto = false"
        >
          Cancelar</button
        ><button class="primary" :disabled="guardando">
          {{ guardando ? "Guardando…" : "Guardar equipo" }}
        </button>
      </div>
    </form>
  </dialog>
  <dialog
    :open="Boolean(detalle)"
    class="modal"
    aria-labelledby="detalle-titulo"
    @keydown.esc="detalle = null"
  >
    <template v-if="detalle"
      ><div class="modal-heading">
        <div>
          <p class="eyebrow">FICHA DEL EQUIPO</p>
          <h2 id="detalle-titulo">{{ detalle.nombre }}</h2>
        </div>
        <button
          class="close"
          aria-label="Cerrar detalle"
          @click="detalle = null"
        >
          ×
        </button>
      </div>
      <span class="badge" :class="badge(detalle.estado)">{{
        detalle.estado
      }}</span>
      <dl class="detail-grid">
        <div>
          <dt>Código</dt>
          <dd>{{ detalle.codigoInventario }}</dd>
        </div>
        <div>
          <dt>Tipo</dt>
          <dd>{{ detalle.tipo }}</dd>
        </div>
        <div>
          <dt>Marca</dt>
          <dd>{{ detalle.marca }}</dd>
        </div>
        <div>
          <dt>Modelo</dt>
          <dd>{{ detalle.modelo }}</dd>
        </div>
        <div>
          <dt>Ubicación</dt>
          <dd>{{ detalle.ubicacion }}</dd>
        </div>
        <div>
          <dt>Adquisición</dt>
          <dd>{{ fecha(detalle.fechaAdquisicion) }}</dd>
        </div>
        <div class="full-width">
          <dt>Observaciones</dt>
          <dd class="observaciones">
            {{ detalle.observaciones || "Sin observaciones." }}
          </dd>
        </div>
      </dl>
      <div class="modal-actions">
        <button class="secondary" @click="detalle = null">Cerrar</button>
      </div></template
    >
  </dialog>
  <dialog
    :open="Boolean(eliminarPendiente)"
    class="modal small-modal"
    aria-labelledby="eliminar-titulo"
    @keydown.esc="!eliminando && (eliminarPendiente = null)"
  >
    <h2 id="eliminar-titulo">¿Eliminar este equipo?</h2>
    <p>
      Se eliminará <strong>{{ eliminarPendiente?.nombre }}</strong> del
      inventario. Esta acción no se puede deshacer.
    </p>
    <div class="modal-actions">
      <button
        class="secondary"
        :disabled="eliminando"
        @click="eliminarPendiente = null"
      >
        Cancelar</button
      ><button class="danger" :disabled="eliminando" @click="eliminar">
        {{ eliminando ? "Eliminando…" : "Confirmar eliminación" }}
      </button>
    </div>
  </dialog>
  <div
    v-if="formularioAbierto || detalle || eliminarPendiente"
    class="backdrop"
    aria-hidden="true"
  ></div>
</template>
