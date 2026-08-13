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

  it("empieza vacío: sin actividades, sin firmas y sin receptor", () => {
    const resultado = crearBorrador({ proyectoId: "obra-1" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.actividades).toBeUndefined();
      expect(resultado.valor.firmas).toBeUndefined();
      expect(resultado.valor.receptor).toBeUndefined();
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

  it("acepta el informe v2 entero: resumen, situación, actividades, receptor y firmas", () => {
    const resultado = crearInforme(
      borradorGuardado({
        resumenSemana: "Semana del 03 al 07 de agosto de 2026.",
        situacion: "La obra avanza según programación.",
        actividades: [
          {
            id: "a1",
            ubicacion: "(M-103) PK 03+500 - Glorieta de Cobeña",
            descripcion: "Colocación de chapa metálica para encofrado.",
            fotos: [
              {
                id: "f1",
                imagen: "data:image/png;base64,AAAA",
                comentario: "Extintor y batefuego junto al grupo electrógeno.",
              },
            ],
          },
        ],
        receptor: { nombre: "Luis Jefe", empresa: "Constructora SL" },
        firmas: [{ nombre: "Ana", rol: "coordinador", firma: "data:image/png;base64,BBBB" }],
      }),
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.actividades).toHaveLength(1);
      expect(resultado.valor.actividades?.[0].fotos?.[0].comentario).toContain("Extintor");
      expect(resultado.valor.receptor?.empresa).toBe("Constructora SL");
      expect(resultado.valor.firmas?.[0].rol).toBe("coordinador");
    }
  });

  it("acepta una actividad recién añadida, todavía sin describir", () => {
    const resultado = crearInforme(borradorGuardado({ actividades: [{ id: "a1" }] }));

    // El borrador se guarda a medias; que la actividad esté vacía lo dirá
    // completitud al intentar finalizar, no el esquema.
    expect(resultado.ok).toBe(true);
  });

  it("marca una incidencia como una actividad más, con su tipo", () => {
    const resultado = crearInforme(
      borradorGuardado({
        actividades: [{ id: "a1", descripcion: "Extensión eléctrica IP-20.", tipo: "incidencia" }],
      }),
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.valor.actividades?.[0].tipo).toBe("incidencia");
  });

  it("rechaza una foto sin imagen", () => {
    const resultado = crearInforme(
      borradorGuardado({ actividades: [{ id: "a1", fotos: [{ id: "f1", imagen: "" }] }] }),
    );

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

  it("ya no admite firmas de subcontrata: en el modelo v2 esa regla no existe", () => {
    const resultado = crearInforme(
      borradorGuardado({
        firmas: [
          { nombre: "Ferralla SL", rol: "subcontrata" as never, firma: "data:image/png;base64,BBBB" },
        ],
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
