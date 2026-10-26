// Prueba contra MySQL real: crea un registro temporal y lo elimina al terminar.
const assert = require('node:assert/strict');
const base = process.env.API_URL || 'http://localhost:3000';
const equipo = { codigoInventario: `TEST-${Date.now()}`, nombre: 'Equipo de prueba', tipo: 'Notebook', marca: 'Lenovo', modelo: 'E14', ubicacion: 'Laboratorio', estado: 'Disponible', fechaAdquisicion: '2025-02-28' };
let id;
let checks = 0;
async function request(path, method = 'GET', body, expected = 200) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const text = await response.text();
  assert.equal(response.status, expected, `${method} ${path}: ${text}`);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  checks++;
  return text ? JSON.parse(text) : undefined;
}
async function main() {
  const created = await request('/equipos', 'POST', equipo, 201);
  id = created.id;
  assert.equal(typeof id, 'number');
  assert.equal((await request(`/equipos/${id}`)).codigoInventario, equipo.codigoInventario);
  assert.equal((await request(`/equipos/${id}`, 'PATCH', { nombre: 'Equipo actualizado' })).nombre, 'Equipo actualizado');
  assert.ok((await request('/equipos')).some((row) => row.id === id));
  await request('/equipos', 'POST', equipo, 409);
  for (const invalid of [
    { codigoInventario: 'ab' }, { nombre: '  ' }, { tipo: '' }, { marca: ' ' },
    { modelo: '' }, { ubicacion: '' }, { estado: 'Desconocido' },
    { fechaAdquisicion: '2025-02-30' }, { fechaAdquisicion: 'ayer' },
    { nombre: 42 }, { id: 999 }, { extra: 'no permitido' },
  ]) await request('/equipos', 'POST', { ...equipo, ...invalid }, 400);
  await request('/equipos', 'POST', {}, 400);
  await request(`/equipos/${id}`, 'PATCH', { nombre: null }, 400);
  await request(`/equipos/${id}`, 'PATCH', { extra: true }, 400);
  await request('/equipos/abc', 'GET', undefined, 400);
  for (const method of ['GET', 'PATCH', 'DELETE']) await request('/equipos/0', method, method === 'PATCH' ? { nombre: 'Inexistente' } : undefined, 404);
  await request(`/equipos/${id}`, 'DELETE', undefined, 204);
  await request(`/equipos/${id}`, 'GET', undefined, 404);
  id = undefined;
  console.log(`${checks} comprobaciones HTTP correctas: CRUD, validaciones, CORS, duplicados y 404.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (id) await fetch(`${base}/equipos/${id}`, { method: 'DELETE' });
});
