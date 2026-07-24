// Tests del adaptador de compartir. La Web Share API no existe en jsdom, así que
// la simulamos: lo que se prueba es NUESTRA lógica de decisión (cuándo se
// comparte, cuándo se descarga y cuándo el usuario simplemente canceló).
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WebShareAdapter } from "@/infrastructure/sharing/share.web";

const PDF = new Blob(["contenido"], { type: "application/pdf" });
const NOMBRE = "informe.pdf";

/** Pone (o quita) las funciones de la Web Share API en el navigator simulado. */
function simularNavegador(opciones: { canShare?: unknown; share?: unknown }) {
  for (const clave of ["canShare", "share"] as const) {
    Object.defineProperty(navigator, clave, {
      value: opciones[clave],
      configurable: true,
      writable: true,
    });
  }
}

describe("WebShareAdapter", () => {
  let adaptador: WebShareAdapter;

  beforeEach(() => {
    adaptador = new WebShareAdapter();
    // jsdom no implementa estas dos; hacen falta para la descarga.
    URL.createObjectURL = vi.fn(() => "blob:falsa");
    URL.revokeObjectURL = vi.fn();
    // Y tampoco navega: interceptamos el clic del enlace para no llenar la salida
    // de avisos. Lo que probamos es nuestra lógica, no que jsdom sepa descargar.
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("sePuedeCompartir", () => {
    it("dice que no si el navegador no tiene la Web Share API", () => {
      simularNavegador({ canShare: undefined, share: undefined });

      expect(adaptador.sePuedeCompartir(PDF, NOMBRE)).toBe(false);
    });

    it("dice que no si el navegador no admite compartir archivos (caso iOS)", () => {
      simularNavegador({ canShare: () => false, share: vi.fn() });

      expect(adaptador.sePuedeCompartir(PDF, NOMBRE)).toBe(false);
    });

    it("dice que sí cuando el navegador admite compartir este archivo", () => {
      simularNavegador({ canShare: () => true, share: vi.fn() });

      expect(adaptador.sePuedeCompartir(PDF, NOMBRE)).toBe(true);
    });
  });

  describe("compartir", () => {
    it("comparte cuando el navegador puede", async () => {
      const share = vi.fn().mockResolvedValue(undefined);
      simularNavegador({ canShare: () => true, share });

      expect(await adaptador.compartir(PDF, NOMBRE)).toEqual({ tipo: "compartido" });
      expect(share).toHaveBeenCalledOnce();
    });

    it("descarga como alternativa si el navegador no puede compartir", async () => {
      simularNavegador({ canShare: undefined, share: undefined });

      expect(await adaptador.compartir(PDF, NOMBRE)).toEqual({ tipo: "descargado" });
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it("no trata como error que el usuario cierre el diálogo", async () => {
      const cancelado = new DOMException("cancelado", "AbortError");
      simularNavegador({ canShare: () => true, share: vi.fn().mockRejectedValue(cancelado) });

      expect(await adaptador.compartir(PDF, NOMBRE)).toEqual({ tipo: "cancelado" });
      // Y no le colamos una descarga que no ha pedido.
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });

    it("descarga si compartir falla de verdad", async () => {
      simularNavegador({
        canShare: () => true,
        share: vi.fn().mockRejectedValue(new Error("se rompió")),
      });

      expect(await adaptador.compartir(PDF, NOMBRE)).toEqual({ tipo: "descargado" });
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe("descargar", () => {
    it("libera la memoria del archivo temporal", () => {
      adaptador.descargar(PDF, NOMBRE);

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:falsa");
    });
  });
});
