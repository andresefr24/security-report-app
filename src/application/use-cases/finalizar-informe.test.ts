import { describe, it, expect, beforeEach } from "vitest";
import { FinalizarInforme } from "@/application/use-cases/finalizar-informe";
import { GuardarInforme } from "@/application/use-cases/guardar-informe";
import { crearBorrador, type DatosInforme, type Informe } from "@/domain/informe/informe";
import { InformeRepositoryEnMemoria } from "@/test/fakes";

const FIRMA_COORDINADOR = {
  nombre: "Ana Coordinadora",
  rol: "coordinador" as const,
  firma: "data:image/png;base64,AAAA",
};

describe("FinalizarInforme", () => {
  let informes: InformeRepositoryEnMemoria;

  beforeEach(() => {
    informes = new InformeRepositoryEnMemoria();
  });

  /** Deja guardado un borrador con los cambios indicados y devuelve su id. */
  async function unBorrador(cambios: Partial<DatosInforme> = {}): Promise<Informe> {
    const borrador = crearBorrador({ proyectoId: "obra-1" });
    if (!borrador.ok) throw new Error("el borrador debería crearse");
    const guardado = await new GuardarInforme(informes).ejecutar({ ...borrador.valor, ...cambios });
    if (!guardado.ok) throw new Error("guardar el borrador debería funcionar");
    return guardado.valor;
  }

  it("finaliza el informe cuando está completo", async () => {
    const borrador = await unBorrador({
      observaciones: [{ id: "o1", titulo: "Visita sin incidencias." }],
      firmas: [FIRMA_COORDINADOR],
    });

    const resultado = await new FinalizarInforme(informes).ejecutar(borrador.id);

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.valor.estado).toBe("finalizado");
    // Y queda guardado como finalizado.
    expect(informes.guardados.get(borrador.id)?.estado).toBe("finalizado");
  });

  it("no finaliza si falta la observación o la firma, y deja el informe intacto", async () => {
    const borrador = await unBorrador({
      observaciones: [{ id: "o1", titulo: "Descrita, pero sin firmar" }],
    });

    const resultado = await new FinalizarInforme(informes).ejecutar(borrador.id);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("firma del coordinador");
    // Sigue siendo un borrador.
    expect(informes.guardados.get(borrador.id)?.estado).toBe("borrador");
  });

  it("finaliza una incidencia con solo la firma del coordinador (nadie más firma)", async () => {
    const borrador = await unBorrador({
      observaciones: [
        { id: "o1", titulo: "Extensión eléctrica IP-20, no apta.", estado: "medida-requerida" },
      ],
      firmas: [FIRMA_COORDINADOR],
    });

    const resultado = await new FinalizarInforme(informes).ejecutar(borrador.id);

    expect(resultado.ok).toBe(true);
  });

  it("falla si el informe ya no existe", async () => {
    const resultado = await new FinalizarInforme(informes).ejecutar("no-existe");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("ya no existe");
  });
});
