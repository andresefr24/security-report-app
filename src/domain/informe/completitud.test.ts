import { describe, it, expect } from "vitest";
import { loQueFaltaParaFinalizar } from "@/domain/informe/completitud";
import { type DatosInforme } from "@/domain/informe/informe";

const FIRMA_COORDINADOR = {
  nombre: "Ana Coordinadora",
  rol: "coordinador" as const,
  firma: "data:image/png;base64,AAAA",
};

/** Un informe listo para cerrarse: una actividad descrita + firma del coordinador. */
function informeListo(cambios: Partial<DatosInforme> = {}): DatosInforme {
  return {
    proyectoId: "obra-1",
    actividades: [
      { id: "a1", descripcion: "Limpieza de calzada con barredora." },
    ],
    firmas: [FIRMA_COORDINADOR],
    ...cambios,
  };
}

describe("loQueFaltaParaFinalizar", () => {
  it("no falta nada cuando hay una actividad descrita y firma del coordinador", () => {
    expect(loQueFaltaParaFinalizar(informeListo())).toEqual([]);
  });

  it("avisa de todo lo que falta en un borrador recién creado", () => {
    const falta = loQueFaltaParaFinalizar({ proyectoId: "obra-1" });

    expect(falta).toHaveLength(2);
    expect(falta.join(" ")).toContain("actividad");
    expect(falta.join(" ")).toContain("firma del coordinador");
  });

  it("exige al menos una actividad", () => {
    expect(loQueFaltaParaFinalizar(informeListo({ actividades: [] }))).toEqual([
      "Falta describir al menos una actividad.",
    ]);
  });

  it("no le vale una actividad vacía: tiene que estar descrita", () => {
    const falta = loQueFaltaParaFinalizar(
      informeListo({ actividades: [{ id: "a1", descripcion: "   " }] }),
    );

    expect(falta).toEqual(["Falta describir al menos una actividad."]);
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

  it("NO exige fotos, comentarios de foto ni receptor", () => {
    expect(
      loQueFaltaParaFinalizar(
        informeListo({
          actividades: [{ id: "a1", descripcion: "Desbroce mecánico.", fotos: [] }],
          receptor: undefined,
        }),
      ),
    ).toEqual([]);
  });
});
