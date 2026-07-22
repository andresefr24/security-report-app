import { describe, it, expect } from "vitest";
import { crearBorrador, crearInforme, type DatosInforme } from "@/domain/informe/informe";

describe("crearBorrador", () => {
  it("crea un borrador con lo mínimo: la obra", () => {
    const resultado = crearBorrador({ proyectoId: "obra-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.proyectoId).toBe("obra-1");
      expect(resultado.valor.id).toBeTruthy();
      expect(resultado.valor.estado).toBe("borrador");
    }
  });

  it("captura sola la fecha/hora, en formato AAAA-MM-DDTHH:mm", () => {
    const resultado = crearBorrador({ proyectoId: "obra-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.fechaHora).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    }
  });

  it("respeta una fecha/hora indicada (informe rellenado más tarde)", () => {
    const resultado = crearBorrador({ proyectoId: "obra-1", fechaHora: "2026-07-01T09:30" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.valor.fechaHora).toBe("2026-07-01T09:30");
  });

  it("rechaza un borrador sin obra", () => {
    const resultado = crearBorrador({ proyectoId: "" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("obra");
  });

  it("empieza con los pasos vacíos (sin fotos, firmas ni incumplimientos)", () => {
    const resultado = crearBorrador({ proyectoId: "obra-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.fotos).toBeUndefined();
      expect(resultado.valor.firmas).toBeUndefined();
      expect(resultado.valor.incumplimientos).toBeUndefined();
    }
  });
});

describe("crearInforme", () => {
  function borradorGuardado(cambios: Partial<DatosInforme> = {}): DatosInforme {
    return { id: "informe-1", proyectoId: "obra-1", fechaHora: "2026-07-01T09:30", ...cambios };
  }

  it("reconstruye un informe guardado conservando su id y estado", () => {
    const resultado = crearInforme(borradorGuardado({ estado: "finalizado" }));

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.id).toBe("informe-1");
      expect(resultado.valor.estado).toBe("finalizado");
    }
  });

  it("asume estado borrador si lo guardado no lo trae", () => {
    const resultado = crearInforme(borradorGuardado());

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.valor.estado).toBe("borrador");
  });

  it("acepta fotos, personas, contenido, incumplimientos y firmas", () => {
    const resultado = crearInforme(
      borradorGuardado({
        personasAtienden: [{ nombre: "Luis Jefe", cargo: "Jefe de obra" }],
        fotos: [{ id: "f1", imagen: "data:image/png;base64,AAAA" }],
        contenido: "Visita sin incidencias reseñables.",
        incumplimientos: [{ id: "i1", subcontrata: "Ferralla SL", descripcion: "Sin arnés." }],
        firmas: [{ nombre: "Ana", rol: "coordinador", firma: "data:image/png;base64,BBBB" }],
      }),
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.fotos).toHaveLength(1);
      expect(resultado.valor.firmas?.[0].rol).toBe("coordinador");
      expect(resultado.valor.incumplimientos?.[0].subcontrata).toBe("Ferralla SL");
    }
  });

  it("rechaza una foto sin imagen", () => {
    const resultado = crearInforme(borradorGuardado({ fotos: [{ id: "f1", imagen: "" }] }));

    expect(resultado.ok).toBe(false);
  });

  it("rechaza una firma sin trazo", () => {
    const resultado = crearInforme(
      borradorGuardado({ firmas: [{ nombre: "Ana", rol: "coordinador", firma: "" }] }),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("firma");
  });

  it("rechaza una firma con un rol no permitido (p. ej. el promotor, que no firma)", () => {
    const resultado = crearInforme(
      borradorGuardado({
        firmas: [{ nombre: "X", rol: "promotor" as never, firma: "data:image/png;base64,BBBB" }],
      }),
    );

    expect(resultado.ok).toBe(false);
  });

  it("genera un id nuevo si le pasan uno vacío", () => {
    const resultado = crearInforme(borradorGuardado({ id: "" }));

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.valor.id).toBeTruthy();
  });
});
