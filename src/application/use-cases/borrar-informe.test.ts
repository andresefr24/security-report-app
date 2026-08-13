import { describe, it, expect, beforeEach } from "vitest";
import { BorrarInforme } from "@/application/use-cases/borrar-informe";
import { CrearBorradorInforme } from "@/application/use-cases/crear-borrador-informe";
import { GuardarInforme } from "@/application/use-cases/guardar-informe";
import { CrearProyecto } from "@/application/use-cases/crear-proyecto";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { type Id } from "@/domain/shared/id";
import {
  InformeRepositoryEnMemoria,
  ProyectoRepositoryEnMemoria,
  PromotorRepositoryEnMemoria,
} from "@/test/fakes";

describe("BorrarInforme", () => {
  let informes: InformeRepositoryEnMemoria;
  let proyectos: ProyectoRepositoryEnMemoria;
  let promotores: PromotorRepositoryEnMemoria;

  beforeEach(() => {
    informes = new InformeRepositoryEnMemoria();
    proyectos = new ProyectoRepositoryEnMemoria();
    promotores = new PromotorRepositoryEnMemoria();
  });

  /** Un borrador recién creado, como el que deja "Nuevo informe". */
  async function unBorrador(): Promise<Id> {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Canal" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    const obra = await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-001",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });
    if (!obra.ok) throw new Error("crear la obra debería funcionar");
    const borrador = await new CrearBorradorInforme(informes, proyectos).ejecutar(obra.valor.id);
    if (!borrador.ok) throw new Error("el borrador debería crearse");
    return borrador.valor.id;
  }

  it("borra un borrador y lo quita de la obra", async () => {
    const id = await unBorrador();

    const resultado = await new BorrarInforme(informes).ejecutar(id);

    expect(resultado.ok).toBe(true);
    expect(informes.guardados.has(id)).toBe(false);
  });

  it("NO borra un informe cerrado: está firmado y es evidencia legal", async () => {
    const id = await unBorrador();
    const guardado = informes.guardados.get(id);
    if (!guardado) throw new Error("el borrador debería estar guardado");
    await new GuardarInforme(informes).ejecutar({ ...guardado, estado: "finalizado" });

    const resultado = await new BorrarInforme(informes).ejecutar(id);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("no se puede borrar");
    // Y sigue ahí.
    expect(informes.guardados.has(id)).toBe(true);
  });

  it("avisa si el informe ya no existe", async () => {
    const resultado = await new BorrarInforme(informes).ejecutar("informe-fantasma");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("ya no existe");
  });
});
