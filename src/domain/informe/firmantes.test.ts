import { describe, it, expect } from "vitest";
import { firmantesRequeridos } from "@/domain/informe/firmantes";
import { type DatosInforme } from "@/domain/informe/informe";

const base: DatosInforme = { proyectoId: "obra-1" };

describe("firmantesRequeridos", () => {
  it("el coordinador firma siempre, aunque no haya incumplimientos", () => {
    const requeridos = firmantesRequeridos(base);

    expect(requeridos).toHaveLength(1);
    expect(requeridos[0].rol).toBe("coordinador");
  });

  it("añade la subcontrata a la que se le anotó un incumplimiento", () => {
    const requeridos = firmantesRequeridos({
      ...base,
      incumplimientos: [{ id: "i1", subcontrata: "Ferralla SL", descripcion: "Sin arnés." }],
    });

    expect(requeridos).toHaveLength(2);
    expect(requeridos[1]).toEqual({
      rol: "subcontrata",
      subcontrata: "Ferralla SL",
      incumplimientoId: "i1",
    });
  });

  it("no repite una subcontrata con varios incumplimientos", () => {
    const requeridos = firmantesRequeridos({
      ...base,
      incumplimientos: [
        { id: "i1", subcontrata: "Ferralla SL", descripcion: "Sin arnés." },
        { id: "i2", subcontrata: "Ferralla SL", descripcion: "Andamio sin barandilla." },
      ],
    });

    expect(requeridos).toHaveLength(2);
  });

  it("añade una firma por cada subcontrata distinta", () => {
    const requeridos = firmantesRequeridos({
      ...base,
      incumplimientos: [
        { id: "i1", subcontrata: "Ferralla SL", descripcion: "Sin arnés." },
        { id: "i2", subcontrata: "Encofrados Sur", descripcion: "Hueco sin proteger." },
      ],
    });

    expect(requeridos.map((f) => f.subcontrata)).toEqual([undefined, "Ferralla SL", "Encofrados Sur"]);
  });
});
