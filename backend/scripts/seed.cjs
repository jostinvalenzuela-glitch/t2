const base = process.env.API_URL || 'http://localhost:3000';
const datos = [
  [
    'INV-001',
    'Notebook biblioteca',
    'Notebook',
    'Lenovo',
    'ThinkPad E14',
    'Biblioteca',
    'Disponible',
    '2025-03-10',
  ],
  [
    'INV-002',
    'PC laboratorio',
    'PC',
    'HP',
    'ProDesk 400',
    'Laboratorio 1',
    'En uso',
    '2024-08-20',
  ],
  [
    'INV-003',
    'Monitor administración',
    'Monitor',
    'Samsung',
    'S24R350',
    'Administración',
    'Disponible',
    '2025-01-15',
  ],
  [
    'INV-004',
    'Proyector sala 201',
    'Proyector',
    'Epson',
    'PowerLite X49',
    'Sala 201',
    'Mantención',
    '2023-11-05',
  ],
  [
    'INV-005',
    'Notebook de respaldo',
    'Notebook',
    'Dell',
    'Latitude 3420',
    'Bodega',
    'Baja',
    '2021-06-12',
  ],
];

async function main() {
  const response = await fetch(`${base}/equipos`);
  if (!response.ok) throw new Error('No se pudo consultar la API');
  const existentes = await response.json();
  for (const row of datos) {
    const [
      codigoInventario,
      nombre,
      tipo,
      marca,
      modelo,
      ubicacion,
      estado,
      fechaAdquisicion,
    ] = row;
    if (
      existentes.some((equipo) => equipo.codigoInventario === codigoInventario)
    )
      continue;
    const result = await fetch(`${base}/equipos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigoInventario,
        nombre,
        tipo,
        marca,
        modelo,
        ubicacion,
        estado,
        fechaAdquisicion,
        observaciones: 'Equipo de demostración para la evaluación.',
      }),
    });
    if (!result.ok) throw new Error(await result.text());
    console.log(`Creado ${codigoInventario}`);
  }
  console.log(
    'Datos de ejemplo disponibles; no se sobrescribieron registros existentes.',
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
