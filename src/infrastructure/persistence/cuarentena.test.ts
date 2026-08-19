// Test de INTEGRACIÓN de la cuarentena: ejerce localForage → IndexedDB
// (con fake-indexeddb, porque jsdom no trae IndexedDB).
import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Cuarentena } from "@/infrastructure/persistence/cuarentena";

describe("Cuarentena", () => {
  let cuarentena: Cuarentena;

  beforeEach(async () => {
    cuarentena = new Cuarentena();
    await cuarentena.vaciar();
    // El aviso por consola es a propósito; que no ensucie la salida del test.
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("guarda la ficha cruda con su motivo y su fecha", async () => {
    await cuarentena.apartar("obra", "obra-1", { codigoObra: "OB-mala" }, ["Falta el promotor."]);

    const [apartada] = await cuarentena.listar();
    expect(apartada.agregado).toBe("obra");
    expect(apartada.clave).toBe("obra-1");
    expect(apartada.motivos).toEqual(["Falta el promotor."]);
    // La ficha se guarda TAL CUAL: es lo que permite recuperarla luego.
    expect(apartada.cruda).toEqual({ codigoObra: "OB-mala" });
    expect(Date.parse(apartada.apartadaEl)).not.toBeNaN();
  });

  it("avisa por consola: apartar algo es un bug que hay que mirar", async () => {
    await cuarentena.apartar("informe", "i1", { algo: 1 }, ["Roto."]);

    expect(console.warn).toHaveBeenCalled();
  });

  it("no mezcla fichas de agregados distintos que compartan clave", async () => {
    await cuarentena.apartar("obra", "1", { cual: "la obra" }, ["x"]);
    await cuarentena.apartar("informe", "1", { cual: "el informe" }, ["y"]);

    const apartadas = await cuarentena.listar();
    expect(apartadas).toHaveLength(2);
  });

  it("NO revienta si el disco no admite la escritura: una lectura no puede petar por esto", async () => {
    const lleno = new Error("QuotaExceededError");
    vi.spyOn(cuarentena["caja"], "setItem").mockRejectedValueOnce(lleno);

    // Lo importante es que no lance: quien la llama está en mitad de una lectura.
    await expect(
      cuarentena.apartar("obra", "obra-1", { algo: 1 }, ["Roto."]),
    ).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it("vaciar deja la cuarentena a cero", async () => {
    await cuarentena.apartar("obra", "obra-1", { algo: 1 }, ["Roto."]);
    expect(await cuarentena.listar()).toHaveLength(1);

    await cuarentena.vaciar();

    expect(await cuarentena.listar()).toHaveLength(0);
  });

  it("listar devuelve vacío cuando no se ha apartado nada", async () => {
    expect(await cuarentena.listar()).toEqual([]);
  });
});
