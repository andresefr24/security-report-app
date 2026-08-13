import { describe, it, expect } from "vitest";
import { construirDocumento, type BloqueDocumento } from "@/infrastructure/pdf/construir-documento";
import { crearInforme, type DatosInforme } from "@/domain/informe/informe";
import { crearProyecto, type DatosProyecto } from "@/domain/proyecto/proyecto";
import { crearPromotor } from "@/domain/promotor/promotor";
import { crearCoordinador } from "@/domain/coordinador/coordinador";
import { type DatosDelPdf } from "@/domain/ports/pdf-port";

/** Monta los cuatro ingredientes del PDF, con lo mínimo válido. */
function datosDelPdf(
  cambiosInforme: Partial<DatosInforme> = {},
  cambiosProyecto: Partial<DatosProyecto> = {},
): DatosDelPdf {
  const informe = crearInforme({
    proyectoId: "obra-1",
    fechaHora: "2026-07-01T09:30",
    actividades: [{ id: "a1", descripcion: "Visita sin incidencias reseñables." }],
    ...cambiosInforme,
  });
  const proyecto = crearProyecto({
    id: "obra-1",
    codigoObra: "OB-2026-014",
    descripcion: "Centro cívico Los Molinos",
    promotorId: "promotor-1",
    frecuenciaVisita: "semanal",
    ...cambiosProyecto,
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

  it("lleva el contratista de la obra en la cabecera", () => {
    const { bloques } = construirDocumento(datosDelPdf({}, { contratista: "API Movilidad" }));

    expect(textoDe(bloques)).toContain("Contratista: API Movilidad");
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

  it("lleva la descripción de cada actividad", () => {
    const { bloques } = construirDocumento(datosDelPdf());

    expect(textoDe(bloques)).toContain("Visita sin incidencias reseñables.");
  });

  it("encabeza la actividad con su ubicación, como los informes reales", () => {
    const { bloques } = construirDocumento(
      datosDelPdf({
        actividades: [
          {
            id: "a1",
            ubicacion: "(M-103) PK 03+500 - Glorieta de Cobeña",
            descripcion: "Colocación de chapa metálica.",
          },
        ],
      }),
    );

    expect(textoDe(bloques)).toContain("(M-103) PK 03+500 - Glorieta de Cobeña");
  });

  it("lleva el resumen de la semana y la situación cuando los hay", () => {
    const { bloques } = construirDocumento(
      datosDelPdf({
        resumenSemana: "Semana del 03 al 07 de agosto de 2026.",
        situacion: "La obra avanza según programación.",
      }),
    );

    const texto = textoDe(bloques);
    expect(texto).toContain("Semana del 03 al 07 de agosto de 2026.");
    expect(texto).toContain("La obra avanza según programación.");
  });

  it("nombra a quien recibe el informe", () => {
    const { bloques } = construirDocumento(
      datosDelPdf({ receptor: { nombre: "Luis Jefe", empresa: "Constructora SL" } }),
    );

    const texto = textoDe(bloques);
    expect(texto).toContain("Recibido por");
    expect(texto).toContain("Luis Jefe");
    expect(texto).toContain("Constructora SL");
  });

  it("embebe las fotos", () => {
    const { bloques } = construirDocumento(
      datosDelPdf({ fotos: [{ id: "f1", imagen: "data:image/png;base64,FOTO" }] }),
    );

    const imagenes = bloques.filter((b) => b.tipo === "imagen");
    expect(imagenes).toHaveLength(1);
    expect(imagenes[0]).toMatchObject({ imagen: "data:image/png;base64,FOTO" });
  });

  it("pone el comentario de la foto como pie de la imagen", () => {
    const { bloques } = construirDocumento(
      datosDelPdf({
        fotos: [
          {
            id: "f1",
            imagen: "data:image/png;base64,FOTO",
            comentario: "Extintor y batefuego junto al grupo electrógeno.",
          },
        ],
      }),
    );

    const imagenes = bloques.filter((b) => b.tipo === "imagen");
    expect(imagenes[0]).toMatchObject({
      pie: "Extintor y batefuego junto al grupo electrógeno.",
    });
  });

  it("embebe las firmas con su nombre y su papel", () => {
    const { bloques } = construirDocumento(
      datosDelPdf({
        firmas: [
          { nombre: "Ana", rol: "coordinador", firma: "data:image/png;base64,FIRMA" },
          { nombre: "Luis Jefe", rol: "recibido", firma: "data:image/png;base64,FIRMA2" },
        ],
      }),
    );

    const firmas = bloques.filter((b) => b.tipo === "firma");
    expect(firmas).toHaveLength(2);
    const texto = textoDe(bloques);
    expect(texto).toContain("Coordinador de seguridad y salud");
    expect(texto).toContain("Recibido por");
  });

  it("omite las secciones que no aplican (sin fotos, sin resumen, sin receptor)", () => {
    const { bloques } = construirDocumento(datosDelPdf());
    const texto = textoDe(bloques);

    expect(texto).not.toContain("Fotografías");
    expect(texto).not.toContain("Calendario de visitas");
    expect(texto).not.toContain("Recibido por");
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
