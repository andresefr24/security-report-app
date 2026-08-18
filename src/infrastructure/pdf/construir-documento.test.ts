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
      switch (b.tipo) {
        case "cabecera":
          return b.filas
            .map((f) => `${f.etiqueta} ${f.valor} ${f.etiqueta2 ?? ""} ${f.valor2 ?? ""}`)
            .join("\n");
        case "rotulo":
          return b.lineas.join("\n");
        case "parrafo":
          return b.texto;
        case "filaFotos":
          return b.fotos.map((f) => f.comentario ?? "").join("\n");
        case "firmas":
          return [b.izquierda, b.derecha]
            .filter((f) => f !== undefined)
            .map((f) => `${f.titulo} ${f.lineas.join(" ")}`)
            .join("\n");
        case "distribucion":
          return `${b.titulo} ${b.destinatarios.join(" ")}`;
      }
    })
    .join("\n");
}

describe("construirDocumento", () => {
  describe("cabecera", () => {
    it("lleva la obra, el promotor y la fecha con los rótulos del informe real", () => {
      const { bloques } = construirDocumento(datosDelPdf());
      const texto = textoDe(bloques);

      expect(texto).toContain("Obra: OB-2026-014");
      expect(texto).toContain("Entidad Promotora: Canal de Isabel II");
      expect(texto).toContain("Fecha:");
      expect(texto).toContain("01/07/2026");
    });

    it("lleva el contratista de la obra", () => {
      const { bloques } = construirDocumento(datosDelPdf({}, { contratista: "API Movilidad" }));

      expect(textoDe(bloques)).toContain("Contratista: API Movilidad");
    });

    it("toma el emisor del perfil del coordinador, nunca de la plantilla", () => {
      const { bloques } = construirDocumento(datosDelPdf());
      const texto = textoDe(bloques);

      expect(texto).toContain("Emisor: Ana García López");
      expect(texto).toContain("TPS Ingeniería");
    });

    it("nombra a quien recibe el informe, con su empresa", () => {
      const { bloques } = construirDocumento(
        datosDelPdf({ receptor: { nombre: "Luis Jefe", empresa: "Constructora SL" } }),
      );
      const texto = textoDe(bloques);

      expect(texto).toContain("Receptor: Luis Jefe");
      expect(texto).toContain("Constructora SL");
    });

    it("deriva el nº de documento de la fecha, sin pedírselo al coordinador", () => {
      const { bloques } = construirDocumento(datosDelPdf());

      expect(textoDe(bloques)).toContain("20260701");
    });

    it("dice 'No consta' si el promotor ya no está, en vez de mentir", () => {
      const datos = { ...datosDelPdf(), promotor: null };

      expect(textoDe(construirDocumento(datos).bloques)).toContain("No consta");
    });
  });

  describe("cuerpo", () => {
    it("encabeza cada actividad con los rótulos del informe real", () => {
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
      const texto = textoDe(bloques);

      // "Situación de la actuación" desapareció: los coordinadores lo llaman
      // ubicación, y así lo pidieron.
      expect(texto).toContain("Ubicación: (M-103) PK 03+500 - Glorieta de Cobeña");
      expect(texto).not.toContain("SITUACIÓN DE LA ACTUACIÓN");
      expect(texto).toContain("DESCRIPCIÓN DE LA ACTIVIDAD: Colocación de chapa metálica.");
    });

    it("pinta una sección por cada actividad", () => {
      const { bloques } = construirDocumento(
        datosDelPdf({
          actividades: [
            { id: "a1", descripcion: "Desbroce mecánico." },
            { id: "a2", descripcion: "Limpieza de calzada." },
          ],
        }),
      );

      expect(bloques.filter((b) => b.tipo === "rotulo")).toHaveLength(2);
    });

    it("lleva el calendario de la semana cuando lo hay", () => {
      const { bloques } = construirDocumento(
        datosDelPdf({ resumenSemana: "Semana del 03 al 07 de agosto de 2026." }),
      );
      const texto = textoDe(bloques);

      expect(texto).toContain("CALENDARIO DE VISITAS Y TRABAJOS EN EJECUCIÓN");
      expect(texto).toContain("Semana del 03 al 07 de agosto de 2026.");
    });

    it("omite el calendario y la situación general si están vacíos", () => {
      const texto = textoDe(construirDocumento(datosDelPdf()).bloques);

      expect(texto).not.toContain("CALENDARIO DE VISITAS");
      expect(texto).not.toContain("SITUACIÓN DE LA OBRA");
    });
  });

  describe("cabecera con los datos de la obra", () => {
    const obraCompleta = {
      ubicacion: "Pº del Tren Talgo, 10, 28290 Las Rozas de Madrid",
      cifContratista: "A28017986",
      plazoEjecucion: "18 meses",
      presupuestoEjecucion: "27.470.256,11 €",
      presupuestoEss: "189.523,06 €",
      fechaInicio: "2024-04-11",
    };

    it("lleva ubicación, plazo, presupuestos y CIF", () => {
      const texto = textoDe(construirDocumento(datosDelPdf({}, obraCompleta)).bloques);

      expect(texto).toContain("Ubicación: Pº del Tren Talgo, 10, 28290 Las Rozas de Madrid");
      expect(texto).toContain("Plazo de ejecución: 18 meses");
      expect(texto).toContain("Presupuesto de ejecución: 27.470.256,11 €");
      expect(texto).toContain("Presupuesto ESS: 189.523,06 €");
      expect(texto).toContain("CIF: A28017986");
    });

    it("sustituye la frase de contexto por el aviso de alcance", () => {
      const texto = textoDe(construirDocumento(datosDelPdf()).bloques);

      expect(texto).toContain("no tienen carácter exhaustivo");
      expect(texto).not.toContain("Después de realizar la visita de coordinación");
    });
  });

  describe("fotos", () => {
    function conFotos(cuantas: number): BloqueDocumento[] {
      return construirDocumento(
        datosDelPdf({
          actividades: [
            {
              id: "a1",
              descripcion: "Desbroce.",
              fotos: Array.from({ length: cuantas }, (_, i) => ({
                id: `f${i}`,
                imagen: `data:image/png;base64,FOTO${i}`,
              })),
            },
          ],
        }),
      ).bloques;
    }

    it("agrupa las fotos de dos en dos, como pidió el stakeholder", () => {
      const filas = conFotos(3).filter((b) => b.tipo === "filaFotos");

      expect(filas).toHaveLength(2);
      expect(filas[0].fotos).toHaveLength(2);
      expect(filas[1].fotos).toHaveLength(1);
    });

    it("numera las fotos seguidas en todo el informe, no por actividad", () => {
      const { bloques } = construirDocumento(
        datosDelPdf({
          actividades: [
            {
              id: "a1",
              descripcion: "Desbroce.",
              fotos: [
                { id: "f1", imagen: "data:image/png;base64,A" },
                { id: "f2", imagen: "data:image/png;base64,B" },
              ],
            },
            {
              id: "a2",
              descripcion: "Limpieza.",
              fotos: [{ id: "f3", imagen: "data:image/png;base64,C" }],
            },
          ],
        }),
      );

      const numeros = bloques
        .filter((b) => b.tipo === "filaFotos")
        .flatMap((b) => b.fotos.map((f) => f.numero));
      // La primera foto de la SEGUNDA actividad es la 3, no vuelve a la 1.
      expect(numeros).toEqual(["Foto 1", "Foto 2", "Foto 3"]);
    });

    it("lleva el comentario de cada foto", () => {
      const { bloques } = construirDocumento(
        datosDelPdf({
          actividades: [
            {
              id: "a1",
              descripcion: "Desbroce.",
              fotos: [
                {
                  id: "f1",
                  imagen: "data:image/png;base64,FOTO",
                  comentario: "Extintor y batefuego junto al grupo electrógeno.",
                },
              ],
            },
          ],
        }),
      );

      expect(textoDe(bloques)).toContain("Extintor y batefuego junto al grupo electrógeno.");
    });

    it("una actividad sin fotos no genera ninguna fila", () => {
      expect(conFotos(0).filter((b) => b.tipo === "filaFotos")).toHaveLength(0);
    });
  });

  describe("firmas y distribución", () => {
    it("pone la firma del coordinador con su nº IRSST (lo que da validez legal)", () => {
      const { bloques } = construirDocumento(
        datosDelPdf({
          firmas: [
            { nombre: "Ana García López", rol: "coordinador", firma: "data:image/png;base64,F" },
          ],
        }),
      );

      const firmas = bloques.find((b) => b.tipo === "firmas");
      expect(firmas?.izquierda.imagen).toBe("data:image/png;base64,F");
      expect(firmas?.izquierda.lineas.join(" ")).toContain("IRSST 3306");
      expect(firmas?.izquierda.lineas.join(" ")).toContain("Fdo. Ana García López");
    });

    it("deja el recuadro de 'recibido por' aunque nadie lo haya firmado", () => {
      const { bloques } = construirDocumento(datosDelPdf());

      const firmas = bloques.find((b) => b.tipo === "firmas");
      expect(firmas?.derecha?.titulo).toBe("Recibido por:");
      expect(firmas?.derecha?.imagen).toBeUndefined();
    });

    it("lista a quién se le envía, tomándolo de la obra", () => {
      const { bloques } = construirDocumento(
        datosDelPdf(
          {},
          {
            listaDistribucion: [
              { nombre: "Carlos Díaz", correo: "carlos@ejemplo.es", rol: "contratista" },
            ],
          },
        ),
      );
      const texto = textoDe(bloques);

      expect(texto).toContain("Enviado por e-mail a:");
      expect(texto).toContain("Carlos Díaz — carlos@ejemplo.es");
    });

    it("omite la distribución si la obra no tiene destinatarios", () => {
      const { bloques } = construirDocumento(datosDelPdf());

      expect(bloques.filter((b) => b.tipo === "distribucion")).toHaveLength(0);
    });
  });

  it("lleva el título nuevo y, a su derecha, quién emite el informe", () => {
    const { cabeceraPagina, emisorCabecera } = construirDocumento(datosDelPdf());

    expect(cabeceraPagina.titulo.join(" ")).toBe(
      "INFORME DE VISITA DEL COORDINADOR DE SEGURIDAD Y SALUD",
    );
    expect(cabeceraPagina.formato.join(" ")).toContain("G13a- SSFE");
    // El emisor sale del perfil, nunca fijado en la plantilla.
    expect(emisorCabecera).toBe("ING. CSS TPS Ingeniería");
  });

  it("el título identifica la obra y la fecha (sirve para el nombre del archivo)", () => {
    const { titulo } = construirDocumento(datosDelPdf());

    expect(titulo).toContain("OB-2026-014");
    expect(titulo).toContain("2026");
  });
});
