import { describe, it, expect } from "vitest";
import { loQueFaltaParaFinalizar } from "@/domain/informe/completitud";
import { type DatosInforme } from "@/domain/informe/informe";

const FIRMA_COORDINADOR = {
  nombre: "Ana Coordinadora",
  rol: "coordinador" as const,
  firma: "data:image/png;base64,AAAA",
};

/** Un informe listo para cerrarse: una observación con título + firma del coordinador. */
function informeListo(cambios: Partial<DatosInforme> = {}): DatosInforme {
  return {
    proyectoId: "obra-1",
    observaciones: [{ id: "o1", titulo: "Limpieza de calzada con barredora." }],
    firmas: [FIRMA_COORDINADOR],
    ...cambios,
  };
}

describe("loQueFaltaParaFinalizar", () => {
  it("no falta nada cuando hay una observación con título y firma del coordinador", () => {
    expect(loQueFaltaParaFinalizar(informeListo())).toEqual([]);
  });

  it("avisa de todo lo que falta en un borrador recién creado", () => {
    const falta = loQueFaltaParaFinalizar({ proyectoId: "obra-1" });

    expect(falta).toHaveLength(2);
    expect(falta.join(" ")).toContain("observación");
    expect(falta.join(" ")).toContain("firma del coordinador");
  });

  it("exige al menos una observación", () => {
    expect(loQueFaltaParaFinalizar(informeListo({ observaciones: [] }))).toEqual([
      "Falta el título de al menos una observación.",
    ]);
  });

  it("no le vale una observación sin título, aunque tenga explicación", () => {
    const falta = loQueFaltaParaFinalizar(
      informeListo({
        observaciones: [{ id: "o1", titulo: "   ", descripcion: "Un texto largo." }],
      }),
    );

    expect(falta).toEqual(["Falta el título de al menos una observación."]);
  });

  it("NO exige la explicación larga ni el estado: con el título basta", () => {
    expect(
      loQueFaltaParaFinalizar(informeListo({ observaciones: [{ id: "o1", titulo: "Vale" }] })),
    ).toEqual([]);
  });

  it("exige la firma del coordinador", () => {
    const falta = loQueFaltaParaFinalizar(informeListo({ firmas: [] }));

    expect(falta).toEqual(["Falta la firma del coordinador."]);
  });

  it("NO exige la firma de quien recibe (puede no haber nadie ese día)", () => {
    expect(loQueFaltaParaFinalizar(informeListo({ firmas: [FIRMA_COORDINADOR] }))).toEqual([]);
  });

  it("NO exige la situación general: los informes semanales no la usan", () => {
    expect(loQueFaltaParaFinalizar(informeListo({ situacion: undefined }))).toEqual([]);
  });

  it("NO exige fotos ni comentarios de foto", () => {
    expect(
      loQueFaltaParaFinalizar(
        informeListo({
          observaciones: [{ id: "o1", titulo: "Desbroce mecánico.", fotos: [] }],
        }),
      ),
    ).toEqual([]);
  });
});
