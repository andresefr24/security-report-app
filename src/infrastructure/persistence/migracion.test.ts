import { describe, it, expect } from "vitest";
import {
  migrar,
  sellar,
  versionActual,
  versionDe,
  type Escalon,
  type Guardado,
} from "@/infrastructure/persistence/migracion";

// Dos escalones de mentira para probar la mecánica sin depender de ninguna
// entidad de verdad: el primero renombra un campo, el segundo añade otro.
const renombrar: Escalon = ({ viejo, ...resto }) => ({ ...resto, nuevo: viejo });
const añadirColor: Escalon = (ficha) => ({ ...ficha, color: "azul" });
const ESCALONES = [renombrar, añadirColor];

describe("versionDe", () => {
  it("una ficha sin sello es de la línea base (v0)", () => {
    expect(versionDe({ nombre: "obra" })).toBe(0);
  });

  it("una ficha sellada dice su versión", () => {
    expect(versionDe({ schemaVersion: 2 })).toBe(2);
  });
});

describe("migrar", () => {
  it("sube una ficha de la línea base aplicando todos los escalones en orden", () => {
    const migrada = migrar({ viejo: "el dato" }, ESCALONES);

    expect(migrada).toEqual({ nuevo: "el dato", color: "azul", schemaVersion: 2 });
  });

  it("aplica solo los escalones que le faltan, no los que ya pasó", () => {
    // Ya está en v1: el renombrado ya se hizo, solo le falta el color.
    const migrada = migrar({ nuevo: "el dato", schemaVersion: 1 }, ESCALONES);

    expect(migrada).toEqual({ nuevo: "el dato", color: "azul", schemaVersion: 2 });
  });

  it("no toca una ficha que ya está al día", () => {
    const alDia: Guardado = { nuevo: "el dato", color: "rojo", schemaVersion: 2 };

    expect(migrar(alDia, ESCALONES)).toEqual(alDia);
  });

  it("no toca una ficha venida del futuro: no sabemos deshacer lo que no conocemos", () => {
    // Un dispositivo con la app más nueva que la nuestra.
    const delFuturo: Guardado = { loQueSea: 1, schemaVersion: 99 };

    expect(migrar(delFuturo, ESCALONES)).toEqual(delFuturo);
  });

  it("deja la ficha sellada con la versión de hoy", () => {
    expect(migrar({ viejo: "x" }, ESCALONES).schemaVersion).toBe(2);
  });

  it("sin escalones definidos no hay nada que migrar: la ficha vuelve intacta", () => {
    // Ni siquiera se le pone sello: no hay ninguna versión a la que subirla.
    expect(migrar({ algo: 1 }, [])).toEqual({ algo: 1 });
  });

  it("la migración la dispara la VERSIÓN, no si la ficha encaja o no", () => {
    // Esta ficha ya tiene la forma de la v2 pero está sellada como v0: se le
    // aplican los escalones igualmente. Por eso el sello es lo que manda.
    const migrada = migrar({ nuevo: "ya estaba", color: "verde" }, ESCALONES);

    // El renombrado no encontró `viejo`, así que `nuevo` se queda sin valor: es
    // la prueba de que no adivinamos por la forma, seguimos el sello.
    expect(migrada.schemaVersion).toBe(2);
  });
});

describe("sellar", () => {
  it("pone la versión de hoy a lo que se va a guardar", () => {
    expect(sellar({ codigoObra: "OB-001" }, ESCALONES)).toEqual({
      codigoObra: "OB-001",
      schemaVersion: 2,
    });
  });

  it("la versión de hoy es el número de escalones", () => {
    expect(versionActual(ESCALONES)).toBe(2);
    expect(versionActual([])).toBe(0);
  });
});
