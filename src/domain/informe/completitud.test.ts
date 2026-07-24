import { describe, it, expect } from "vitest";
import { loQueFaltaParaFinalizar } from "@/domain/informe/completitud";
import { type DatosInforme } from "@/domain/informe/informe";

const FIRMA_COORDINADOR = {
  nombre: "Ana Coordinadora",
  rol: "coordinador" as const,
  firma: "data:image/png;base64,AAAA",
};

/** Un informe listo para cerrarse: contenido + firma del coordinador. */
function informeListo(cambios: Partial<DatosInforme> = {}): DatosInforme {
  return {
    proyectoId: "obra-1",
    contenido: "Visita sin incidencias reseñables.",
    firmas: [FIRMA_COORDINADOR],
    ...cambios,
  };
}

describe("loQueFaltaParaFinalizar", () => {
  it("no falta nada cuando hay contenido y firma del coordinador", () => {
    expect(loQueFaltaParaFinalizar(informeListo())).toEqual([]);
  });

  it("avisa de todo lo que falta en un borrador recién creado", () => {
    const falta = loQueFaltaParaFinalizar({ proyectoId: "obra-1" });

    expect(falta).toHaveLength(2);
    expect(falta.join(" ")).toContain("contenido");
    expect(falta.join(" ")).toContain("firma del coordinador");
  });

  it("exige el contenido del informe", () => {
    expect(loQueFaltaParaFinalizar(informeListo({ contenido: "   " }))).toEqual([
      "Falta escribir el contenido del informe.",
    ]);
  });

  it("exige la firma del coordinador", () => {
    const falta = loQueFaltaParaFinalizar(informeListo({ firmas: [] }));

    expect(falta).toEqual(["Falta la firma del coordinador."]);
  });

  it("NO exige la firma de una subcontrata con incumplimiento (no debe bloquear el cierre)", () => {
    const falta = loQueFaltaParaFinalizar(
      informeListo({
        incumplimientos: [{ id: "i1", subcontrata: "Ferralla SL", descripcion: "Sin arnés." }],
        // Solo firma el coordinador: la subcontrata no estaba para firmar.
        firmas: [FIRMA_COORDINADOR],
      }),
    );

    expect(falta).toEqual([]);
  });

  it("NO exige fotos ni personas que atienden", () => {
    expect(
      loQueFaltaParaFinalizar(informeListo({ fotos: [], personasAtienden: [] })),
    ).toEqual([]);
  });
});
