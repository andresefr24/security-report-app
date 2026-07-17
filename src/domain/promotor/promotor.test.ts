import { describe, it, expect } from "vitest";
import { crearPromotor, type DatosPromotor } from "@/domain/promotor/promotor";

// Datos mínimos válidos: cada test parte de aquí y cambia solo lo que prueba.
function datosValidos(cambios: Partial<DatosPromotor> = {}): DatosPromotor {
  return {
    nombreRazonSocial: "Canal de Isabel II",
    ...cambios,
  };
}

describe("crearPromotor", () => {
  it("crea un promotor cuando los datos mínimos son válidos", () => {
    const resultado = crearPromotor(datosValidos());

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.nombreRazonSocial).toBe("Canal de Isabel II");
    }
  });

  it("genera un id si no se le pasa uno", () => {
    const resultado = crearPromotor(datosValidos());

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.id).toBeTruthy();
    }
  });

  it("genera ids distintos para dos promotores", () => {
    const uno = crearPromotor(datosValidos());
    const otro = crearPromotor(datosValidos({ nombreRazonSocial: "Ayuntamiento de Getafe" }));

    expect(uno.ok && otro.ok).toBe(true);
    if (uno.ok && otro.ok) {
      expect(uno.valor.id).not.toBe(otro.valor.id);
    }
  });

  it("respeta el id que se le pasa (al editar uno existente)", () => {
    const resultado = crearPromotor(datosValidos({ id: "promotor-fijo-1" }));

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.id).toBe("promotor-fijo-1");
    }
  });

  it("genera un id nuevo si le pasan uno vacío (no lo guarda bajo la clave \"\")", () => {
    const resultado = crearPromotor(datosValidos({ id: "" }));

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.id).not.toBe("");
      expect(resultado.valor.id).toBeTruthy();
    }
  });

  it("rechaza un promotor sin nombre o razón social", () => {
    const resultado = crearPromotor(datosValidos({ nombreRazonSocial: "" }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.errores.join(" ")).toContain("razón social");
    }
  });

  it("rechaza una razón social que solo tiene espacios", () => {
    const resultado = crearPromotor(datosValidos({ nombreRazonSocial: "   " }));

    expect(resultado.ok).toBe(false);
  });

  it("rechaza un correo de contacto con formato inválido", () => {
    const resultado = crearPromotor(
      datosValidos({ contacto: { correo: "esto-no-es-correo" } }),
    );

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.errores.join(" ")).toContain("correo");
    }
  });

  it("acepta los datos fiscales y el contacto completos", () => {
    const resultado = crearPromotor(
      datosValidos({
        nif: "A28000000",
        contacto: {
          persona: "Marta Ruiz",
          correo: "marta@canaldeisabelsegunda.es",
          telefono: "600123456",
        },
      }),
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.nif).toBe("A28000000");
      expect(resultado.valor.contacto?.persona).toBe("Marta Ruiz");
    }
  });
});
