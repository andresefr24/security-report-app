import { describe, it, expect } from "vitest";
import { construirDocumento, type BloqueDocumento } from "@/infrastructure/pdf/construir-documento";
import { crearInforme, type DatosInforme } from "@/domain/informe/informe";
import { crearProyecto } from "@/domain/proyecto/proyecto";
import { crearPromotor } from "@/domain/promotor/promotor";
import { crearCoordinador } from "@/domain/coordinador/coordinador";
import { type DatosDelPdf } from "@/domain/ports/pdf-port";

/** Monta los cuatro ingredientes del PDF, con lo mínimo válido. */
function datosDelPdf(cambiosInforme: Partial<DatosInforme> = {}): DatosDelPdf {
  const informe = crearInforme({
    proyectoId: "obra-1",
    fechaHora: "2026-07-01T09:30",
    contenido: "Visita sin incidencias reseñables.",
    ...cambiosInforme,
  });
  const proyecto = crearProyecto({
    id: "obra-1",
    codigoObra: "OB-2026-014",
    descripcion: "Centro cívico Los Molinos",
    promotorId: "promotor-1",
    frecuenciaVisita: "semanal",
  });
  const promotor = crearPromotor({ id: "promotor-1", nombreRazonSocial: "Canal de Isabel II" });
  const coordinador = crearCoordinador({
    nombreCompleto: "Ana García López",
    numeroRegistroIrsst: "3306",
    profesion: "Ingeniera técnica de obras públicas",
    contacto: { empresa: "TPS Ingeniería" },
  });
  if (!informe.ok || !proyecto.ok || !promotor.ok || !coordinador.ok) {
    throw new Error("los datos de prueba deberían ser válidos");
  }
  return {
    informe: informe.valor,
    proyecto: proyecto.valor,
    promotor: promotor.valor,
    coordinador: coordinador.valor,
  };
}

/** Todo el texto del documento junto, para buscar cómodamente. */
function textoDe(bloques: BloqueDocumento[]): string {
  return bloques
    .map((b) => {
      if (b.tipo === "dato") return `${b.etiqueta}: ${b.valor}`;
      if (b.tipo === "firma") return `${b.rolEtiqueta} ${b.nombre}`;
      if (b.tipo === "imagen") return b.pie ?? "";
      return b.texto;
    })
    .join("\n");
}

describe("construirDocumento", () => {
  it("lleva los datos de la obra y del promotor", () => {
    const { bloques } = construirDocumento(datosDelPdf());
    const texto = textoDe(bloques);

    expect(texto).toContain("OB-2026-014");
    expect(texto).toContain("Centro cívico Los Molinos");
    expect(texto).toContain("Canal de Isabel II");
  });

  it("lleva el nº de registro IRSST del coordinador (lo que da validez legal)", () => {
    const { bloques } = construirDocumento(datosDelPdf());
    const texto = textoDe(bloques);

    expect(texto).toContain("Ana García López");
    expect(texto).toContain("IRSST");
    expect(texto).toContain("3306");
  });

  it("muestra la fecha de la visita en formato legible", () => {
    const { bloques } = construirDocumento(datosDelPdf());

    expect(textoDe(bloques)).toContain("1 de julio de 2026");
  });

  it("lleva el contenido del informe", () => {
    const { bloques } = construirDocumento(datosDelPdf());

    expect(textoDe(bloques)).toContain("Visita sin incidencias reseñables.");
  });

  it("embebe las fotos", () => {
    const { bloques } = construirDocumento(
      datosDelPdf({ fotos: [{ id: "f1", imagen: "data:image/png;base64,FOTO" }] }),
    );

    const imagenes = bloques.filter((b) => b.tipo === "imagen");
    expect(imagenes).toHaveLength(1);
    expect(imagenes[0]).toMatchObject({ imagen: "data:image/png;base64,FOTO" });
  });

  it("embebe las firmas con su nombre y su papel", () => {
    const { bloques } = construirDocumento(
      datosDelPdf({
        firmas: [
          { nombre: "Ana", rol: "coordinador", firma: "data:image/png;base64,FIRMA" },
          {
            nombre: "Rep. Ferralla",
            rol: "subcontrata",
            subcontrata: "Ferralla SL",
            firma: "data:image/png;base64,FIRMA2",
          },
        ],
      }),
    );

    const firmas = bloques.filter((b) => b.tipo === "firma");
    expect(firmas).toHaveLength(2);
    const texto = textoDe(bloques);
    expect(texto).toContain("Coordinador de seguridad y salud");
    // La firma de subcontrata dice de qué subcontrata es.
    expect(texto).toContain("Ferralla SL");
  });

  it("lista los incumplimientos por subcontrata", () => {
    const { bloques } = construirDocumento(
      datosDelPdf({
        incumplimientos: [{ id: "i1", subcontrata: "Ferralla SL", descripcion: "Sin arnés." }],
      }),
    );

    expect(textoDe(bloques)).toContain("Ferralla SL: Sin arnés.");
  });

  it("omite las secciones que no aplican (sin fotos, sin incumplimientos)", () => {
    const { bloques } = construirDocumento(datosDelPdf());
    const texto = textoDe(bloques);

    expect(texto).not.toContain("Fotografías");
    expect(texto).not.toContain("Incumplimientos detectados");
  });

  it("dice 'No consta' si el promotor ya no está, en vez de mentir", () => {
    const datos = { ...datosDelPdf(), promotor: null };

    expect(textoDe(construirDocumento(datos).bloques)).toContain("No consta");
  });

  it("el título identifica la obra y la fecha (sirve para el nombre del archivo)", () => {
    const { titulo } = construirDocumento(datosDelPdf());

    expect(titulo).toContain("OB-2026-014");
    expect(titulo).toContain("2026");
  });
});
