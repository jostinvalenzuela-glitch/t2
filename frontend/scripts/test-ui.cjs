const { chromium } = require("playwright");
const assert = require("node:assert/strict");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const code = `UI-${Date.now()}`;
  let createdId;
  try {
    await page.goto("http://localhost:5173");
    await page.getByRole("row").filter({ hasText: "INV-001" }).waitFor();
    await page.getByRole("searchbox").fill("INV-001");
    assert.equal(await page.locator("tbody tr").count(), 1);
    await page.getByRole("searchbox").fill("");
    await page
      .locator(".filters")
      .getByLabel("Estado", { exact: true })
      .selectOption("Baja");
    assert.ok((await page.locator("tbody tr").count()) >= 1);
    assert.ok(
      (await page.locator("tbody .badge").allTextContents()).every(
        (estado) => estado.trim() === "Baja",
      ),
    );
    await page
      .locator(".filters")
      .getByLabel("Estado", { exact: true })
      .selectOption("");
    await page.getByRole("button", { name: "Registrar equipo" }).click();
    const form = page.getByRole("dialog", { name: "Registrar equipo" });
    for (const [label, value] of Object.entries({
      "Código de inventario": code,
      Nombre: "Notebook prueba navegador",
      Tipo: "Notebook",
      Marca: "Lenovo",
      Modelo: "E14",
      Ubicación: "Sala prueba",
      "Fecha de adquisición": "2025-03-12",
    })) {
      await form.getByLabel(label, { exact: true }).fill(value);
    }
    await form.getByRole("button", { name: "Guardar equipo" }).click();
    const row = page.getByRole("row").filter({ hasText: code });
    await row.waitFor();
    const all = await (await fetch("http://localhost:3000/equipos")).json();
    createdId = all.find((e) => e.codigoInventario === code).id;
    await row
      .getByRole("button", {
        name: "Ver Notebook prueba navegador",
        exact: true,
      })
      .click();
    await page
      .getByRole("dialog", { name: "Notebook prueba navegador", exact: true })
      .getByText("Sala prueba", { exact: true })
      .waitFor();
    await page.getByRole("button", { name: "Cerrar detalle" }).click();
    await row
      .getByRole("button", {
        name: "Editar Notebook prueba navegador",
        exact: true,
      })
      .click();
    const edit = page.getByRole("dialog", { name: "Editar equipo" });
    await edit
      .getByLabel("Nombre", { exact: true })
      .fill("Notebook editado navegador");
    await edit.getByRole("button", { name: "Guardar equipo" }).click();
    await row
      .getByText("Notebook editado navegador", { exact: true })
      .waitFor();
    await row
      .getByRole("button", {
        name: "Eliminar Notebook editado navegador",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: "Cancelar", exact: true }).click();
    assert.ok(await row.isVisible());
    await row
      .getByRole("button", {
        name: "Eliminar Notebook editado navegador",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: "Confirmar eliminación" }).click();
    await row.waitFor({ state: "detached" });
    createdId = undefined;
    // Simula una caída de la API para verificar la comunicación de errores.
    await page.route("**/equipos", (route) => route.abort());
    await page.getByRole("button", { name: "Actualizar", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "No se pudo conectar" })
      .waitFor();
    await page.unroute("**/equipos");
    await page.getByRole("button", { name: "Reintentar" }).click();
    await page.getByRole("row").filter({ hasText: "INV-001" }).waitFor();
    if (process.env.SCREENSHOT_PATH)
      await page.screenshot({
        path: process.env.SCREENSHOT_PATH,
        fullPage: true,
      });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
      false,
    );
    console.log(
      "UI correcta: listado, búsqueda, filtro, alta, detalle, edición, cancelación y confirmación de borrado, error de red, reintento y vista móvil.",
    );
  } finally {
    if (createdId)
      await fetch(`http://localhost:3000/equipos/${createdId}`, {
        method: "DELETE",
      });
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
