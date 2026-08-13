import { describe, it, expect } from "vitest";
import { crearProyecto, type DatosProyecto } from "@/domain/proyecto/proyecto";

// Datos mínimos válidos: los tres obligatorios (código, promotor y frecuencia).
function datosValidos(cambios: Partial<DatosProyecto> = {}): DatosProyecto {
  return {
    codigoObra: "OB-2026-014",
    promotorId: "promotor-1",
    frecuenciaVisita: "semanal",
    ...cambios,
  };
}

describe("crearProyecto", () => {
  it("crea una obra con los datos mínimos", () => {
    const resultado = crearProyecto(datosValidos());

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.codigoObra).toBe("OB-2026-014");
      expect(resultado.valor.promotorId).toBe("promotor-1");
      expect(resultado.valor.id).toBeTruthy();
    }
  });

  it("guarda el promotor por id, no una copia de sus datos", () => {
    const resultado = crearProyecto(datosValidos({ promotorId: "promotor-42" }));

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.promotorId).toBe("promotor-42");
      // La obra no tiene ningún campo con datos del promotor dentro.
      expect(resultado.valor).not.toHaveProperty("promotor");
      expect(resultado.valor).not.toHaveProperty("nombreRazonSocial");
    }
  });

  it("rechaza una obra sin código", () => {
    const resultado = crearProyecto(datosValidos({ codigoObra: "" }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("código de obra");
  });

  it("rechaza una obra sin promotor", () => {
    const resultado = crearProyecto(datosValidos({ promotorId: "" }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("promotor");
  });

  it("rechaza una frecuencia de visita que no sea diaria o semanal", () => {
    const resultado = crearProyecto(
      datosValidos({ frecuenciaVisita: "mensual" as never }),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("frecuencia");
  });

  it("acepta una obra sin destinatarios (se añaden después)", () => {
    const resultado = crearProyecto(datosValidos({ listaDistribucion: [] }));

    expect(resultado.ok).toBe(true);
  });

  it("acepta destinatarios bien formados con su rol", () => {
    const resultado = crearProyecto(
      datosValidos({
        listaDistribucion: [
          { nombre: "Marta Ruiz", correo: "marta@canal.es", rol: "promotor" },
          { correo: "jefe@contrata.es", rol: "contratista" },
        ],
      }),
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.listaDistribucion).toHaveLength(2);
      expect(resultado.valor.listaDistribucion?.[1].rol).toBe("contratista");
    }
  });

  it("rechaza un destinatario con el correo mal escrito", () => {
    const resultado = crearProyecto(
      datosValidos({
        listaDistribucion: [{ correo: "esto-no-es-correo", rol: "promotor" }],
      }),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("formato");
  });

  it("rechaza un destinatario sin correo", () => {
    const resultado = crearProyecto(
      datosValidos({ listaDistribucion: [{ correo: "", rol: "promotor" }] }),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("obligatorio");
  });

  it("respeta el id que se le pasa (al editar una obra existente)", () => {
    const resultado = crearProyecto(datosValidos({ id: "obra-fija-1" }));

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.valor.id).toBe("obra-fija-1");
  });

  it("genera un id nuevo si le pasan uno vacío (no lo guarda bajo la clave \"\")", () => {
    const resultado = crearProyecto(datosValidos({ id: "" }));

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.id).not.toBe("");
      expect(resultado.valor.id).toBeTruthy();
    }
  });

  it("acepta los campos opcionales (descripción, contratista, plazo y presupuesto)", () => {
    const resultado = crearProyecto(
      datosValidos({
        descripcion: "Centro cívico deportivo Los Molinos",
        contratista: "API Movilidad",
        fechaInicio: "2026-09-01",
        fechaFin: "2027-03-31",
        presupuesto: "1.250.000 €",
      }),
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.fechaInicio).toBe("2026-09-01");
      expect(resultado.valor.presupuesto).toBe("1.250.000 €");
      expect(resultado.valor.contratista).toBe("API Movilidad");
    }
  });
});
