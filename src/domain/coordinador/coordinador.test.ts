import { describe, it, expect } from "vitest";
import { crearCoordinador, type DatosCoordinador } from "@/domain/coordinador/coordinador";

// Datos mínimos válidos: un ayudante para no repetir en cada test. Cada prueba
// parte de aquí y cambia solo lo que quiere probar.
function datosValidos(cambios: Partial<DatosCoordinador> = {}): DatosCoordinador {
  return {
    nombreCompleto: "Ana García López",
    numeroRegistroIrsst: "3306",
    ...cambios,
  };
}

describe("crearCoordinador", () => {
  it("crea un coordinador cuando los datos mínimos son válidos", () => {
    const resultado = crearCoordinador(datosValidos());

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.nombreCompleto).toBe("Ana García López");
      expect(resultado.valor.numeroRegistroIrsst).toBe("3306");
    }
  });

  it("rechaza un coordinador sin número de registro IRSST (la regla legal)", () => {
    const resultado = crearCoordinador(datosValidos({ numeroRegistroIrsst: "" }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.errores.join(" ")).toContain("IRSST");
    }
  });

  it("rechaza un registro IRSST que solo tiene espacios", () => {
    const resultado = crearCoordinador(datosValidos({ numeroRegistroIrsst: "   " }));

    expect(resultado.ok).toBe(false);
  });

  it("rechaza un coordinador sin nombre", () => {
    const resultado = crearCoordinador(datosValidos({ nombreCompleto: "" }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.errores.join(" ")).toContain("nombre");
    }
  });

  it("mantiene separados el registro IRSST y el número de colegiado", () => {
    const resultado = crearCoordinador(
      datosValidos({ numeroRegistroIrsst: "3306", numeroColegiado: "12345" }),
    );

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      // Son campos distintos: ni se copian ni se confunden entre sí.
      expect(resultado.valor.numeroRegistroIrsst).toBe("3306");
      expect(resultado.valor.numeroColegiado).toBe("12345");
      expect(resultado.valor.numeroRegistroIrsst).not.toBe(resultado.valor.numeroColegiado);
    }
  });

  it("acepta un coordinador sin firma (la firma es opcional en el dominio)", () => {
    const resultado = crearCoordinador(datosValidos());

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.firma).toBeUndefined();
    }
  });

  it("rechaza un correo con formato inválido", () => {
    const resultado = crearCoordinador(datosValidos({ contacto: { correo: "esto-no-es-correo" } }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.errores.join(" ")).toContain("correo");
    }
  });

  it("acepta un correo bien formado dentro de los datos de contacto", () => {
    const resultado = crearCoordinador(
      datosValidos({ contacto: { correo: "ana@tps-ingenieria.es", empresa: "TPS Ingeniería" } }),
    );

    expect(resultado.ok).toBe(true);
  });
});
