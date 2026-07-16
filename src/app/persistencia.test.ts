import { describe, it, expect, vi, afterEach } from "vitest";
import { solicitarPersistencia } from "@/app/persistencia";

// Guardamos el navigator.storage original para restaurarlo tras cada test.
const storageOriginal = Object.getOwnPropertyDescriptor(navigator, "storage");

function simularStorage(valor: unknown) {
  Object.defineProperty(navigator, "storage", { value: valor, configurable: true });
}

afterEach(() => {
  if (storageOriginal) {
    Object.defineProperty(navigator, "storage", storageOriginal);
  }
  vi.restoreAllMocks();
});

describe("solicitarPersistencia", () => {
  it("llama a persist() y devuelve true cuando la API existe y concede", async () => {
    const persist = vi.fn().mockResolvedValue(true);
    simularStorage({ persist });

    expect(await solicitarPersistencia()).toBe(true);
    expect(persist).toHaveBeenCalledOnce();
  });

  it("devuelve false cuando el navegador no soporta la API", async () => {
    simularStorage(undefined);

    expect(await solicitarPersistencia()).toBe(false);
  });

  it("no revienta si persist() lanza un error", async () => {
    const persist = vi.fn().mockRejectedValue(new Error("boom"));
    simularStorage({ persist });

    expect(await solicitarPersistencia()).toBe(false);
  });
});
