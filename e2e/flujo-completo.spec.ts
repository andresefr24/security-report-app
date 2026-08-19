import { test, expect, type Locator } from "@playwright/test";

// Prueba de extremo a extremo del recorrido completo del incremento 1.1:
// perfil → promotor → obra → informe (3 pasos, firmando de verdad) → PDF listo.
//
// A diferencia de los tests de componente, aquí corre la app REAL en el
// navegador: IndexedDB de verdad, y la firma se dibuja con el ratón sobre el
// canvas (lo que jsdom no puede). Se navega por URL porque la barra de
// navegación (tab bar) es de un hito posterior. No se suben fotos: no hacen
// falta para cerrar el informe y la compresión con Web Worker da guerra en CI.

/**
 * Dibuja un trazo sobre un canvas de firma. signature_pad escucha eventos de
 * PUNTERO con el botón pulsado (pointerdown en el canvas, pointermove/up en la
 * ventana), así que los disparamos tal cual, en vez de depender de cómo el
 * navegador traduce el ratón de Playwright.
 */
async function firmar(canvas: Locator) {
  await canvas.evaluate((cv: HTMLCanvasElement) => {
    const r = cv.getBoundingClientRect();
    const evento = (tipo: string, x: number, y: number, buttons: number) =>
      new PointerEvent(tipo, {
        clientX: r.left + x,
        clientY: r.top + y,
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true,
        buttons,
      });

    const medio = r.height / 2;
    cv.dispatchEvent(evento("pointerdown", 20, medio, 1));
    for (let i = 1; i <= 20; i++) {
      window.dispatchEvent(evento("pointermove", 20 + i * 6, medio + Math.sin(i / 3) * 15, 1));
    }
    window.dispatchEvent(evento("pointerup", 140, medio, 0));
  });
}

test("un coordinador crea un informe de punta a punta y llega al PDF", async ({ page }) => {
  // 1) Perfil del coordinador (su nº de registro da validez al informe).
  await page.goto("/perfil");
  await page.getByLabel(/Nombre y apellidos/i).fill("Ana García López");
  await page.getByLabel(/registro de la CAM/i).fill("3306");
  await firmar(page.getByLabel(/Zona para dibujar la firma/i));
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText(/Guardado en el dispositivo/i)).toBeVisible();

  // 2) Promotor.
  await page.goto("/promotores/nuevo");
  await page.getByLabel(/Nombre o razón social/i).fill("Canal de Isabel II");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Canal de Isabel II")).toBeVisible();

  // 3) Obra (eligiendo ese promotor), con su contratista para la cabecera.
  await page.goto("/obras/nueva");
  await page.getByLabel(/Promotor/i).selectOption({ label: "Canal de Isabel II" });
  await page.getByLabel(/Código de obra/i).fill("OB-2026-014");
  await page.getByLabel(/^Contratista$/).fill("API Movilidad");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("OB-2026-014")).toBeVisible();

  // 4) Nuevo informe de esa obra → abre el wizard.
  await page.getByRole("link", { name: "Nuevo informe" }).click();
  await expect(page.getByText("Paso 1 de 3")).toBeVisible();

  // 5) Paso 1: quién recibe el informe (opcional, pero es lo normal).
  await page.getByLabel(/^Nombre$/).fill("Luis Jefe de Obra");
  await page.getByRole("button", { name: "Siguiente" }).click();

  // 6) Paso 2: la observación. Sin al menos una con título no se puede cerrar.
  await expect(page.getByText("Paso 2 de 3")).toBeVisible();
  await page.getByRole("button", { name: "Añadir observación" }).click();
  await page.getByLabel(/^Título$/).fill("Grupo electrógeno sin medios de extinción");
  await page.getByLabel(/Dónde/i).fill("(M-103) PK 03+500");
  await page.getByLabel(/Explicación/i).fill("Se requiere instalar extintores.");
  // El estado se elige con un botón; la app pone la etiqueta y el color.
  await page.getByRole("button", { name: "MEDIDA REQUERIDA" }).click();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page.getByText("Paso 3 de 3")).toBeVisible();

  // 7) Firma del coordinador, la primera ranura (la de "recibido" es opcional).
  await page.getByLabel(/Nombre de quien firma/i).first().fill("Ana García López");
  await firmar(page.getByLabel(/Zona para dibujar la firma/i).first());

  // 8) Finalizar → pantalla de entrega con el PDF listo.
  await page.getByRole("button", { name: "Finalizar" }).click();
  await expect(page.getByRole("heading", { name: "Informe listo" })).toBeVisible({
    timeout: 30_000,
  });
  // La cadena entera funcionó: se cerró el informe y se generó el PDF.
  await expect(page.getByRole("button", { name: "Descargar" })).toBeVisible();
});
