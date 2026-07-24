// pdfmake no puede generar un PDF en el entorno de pruebas (necesita navegador),
// pero SÍ podemos comprobar lo que nos falló: que al importarlo tenemos su API de
// verdad en la mano.
//
// pdfmake y sus fuentes se publican en formato UMD, y según cómo los empaquete
// Vite la API real llega dentro de `default`. Si eso se rompe,
// `addVirtualFileSystem` no existe y generar el PDF revienta en el navegador —
// justo el fallo que se coló y que este test evita que vuelva.
import { describe, it, expect } from "vitest";

/** La misma interoperabilidad que usa el adaptador. */
function apiReal<T>(modulo: T | { default?: T }): T {
  const conDefault = modulo as { default?: T };
  return conDefault.default ?? (modulo as T);
}

describe("importación de pdfmake", () => {
  it("expone addVirtualFileSystem y createPdf tras la interoperabilidad", async () => {
    const pdfMake = apiReal<typeof import("pdfmake/build/pdfmake")>(
      await import("pdfmake/build/pdfmake"),
    );

    expect(typeof pdfMake.addVirtualFileSystem).toBe("function");
    expect(typeof pdfMake.createPdf).toBe("function");
  });

  it("las fuentes traen el sistema de archivos virtual con Roboto", async () => {
    const fuentes = apiReal<Record<string, string>>(await import("pdfmake/build/vfs_fonts"));

    // pdfmake busca estos archivos por nombre; si no están, no hay PDF.
    expect(Object.keys(fuentes)).toContain("Roboto-Regular.ttf");
  });
});
