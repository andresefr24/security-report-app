import { describe, it, expect, beforeEach } from "vitest";
import { BorrarProyecto } from "@/application/use-cases/borrar-proyecto";
import { CrearProyecto } from "@/application/use-cases/crear-proyecto";
import { CrearBorradorInforme } from "@/application/use-cases/crear-borrador-informe";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { type Id } from "@/domain/shared/id";
import {
  InformeRepositoryEnMemoria,
  ProyectoRepositoryEnMemoria,
  PromotorRepositoryEnMemoria,
} from "@/test/fakes";

describe("BorrarProyecto", () => {
  let proyectos: ProyectoRepositoryEnMemoria;
  let informes: InformeRepositoryEnMemoria;
  let promotores: PromotorRepositoryEnMemoria;

  beforeEach(() => {
    proyectos = new ProyectoRepositoryEnMemoria();
    informes = new InformeRepositoryEnMemoria();
    promotores = new PromotorRepositoryEnMemoria();
  });

  async function unaObra(): Promise<Id> {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Canal" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    const obra = await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-001",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });
    if (!obra.ok) throw new Error("crear la obra debería funcionar");
    return obra.valor.id;
  }

  it("borra una obra que no tiene informes", async () => {
    const id = await unaObra();

    const resultado = await new BorrarProyecto(proyectos, informes).ejecutar(id);

    expect(resultado.ok).toBe(true);
    expect(proyectos.guardados.has(id)).toBe(false);
  });

  it("borra la obra CON sus informes: si no, no habría forma de quitarla", async () => {
    const id = await unaObra();
    await new CrearBorradorInforme(informes, proyectos).ejecutar(id);
    await new CrearBorradorInforme(informes, proyectos).ejecutar(id);

    const resultado = await new BorrarProyecto(proyectos, informes).ejecutar(id);

    expect(resultado.ok).toBe(true);
    expect(proyectos.guardados.has(id)).toBe(false);
    expect(informes.guardados.size).toBe(0);
  });

  it("no toca los informes de OTRA obra", async () => {
    const id = await unaObra();
    const otra = await unaObra();
    await new CrearBorradorInforme(informes, proyectos).ejecutar(otra);

    await new BorrarProyecto(proyectos, informes).ejecutar(id);

    expect(proyectos.guardados.has(otra)).toBe(true);
    expect(informes.guardados.size).toBe(1);
  });

  it("dice cuántos informes se va a llevar por delante, para poder avisar", async () => {
    const id = await unaObra();
    await new CrearBorradorInforme(informes, proyectos).ejecutar(id);
    await new CrearBorradorInforme(informes, proyectos).ejecutar(id);

    expect(await new BorrarProyecto(proyectos, informes).cuantosInformes(id)).toBe(2);
  });

  it("avisa si la obra ya no existe", async () => {
    const resultado = await new BorrarProyecto(proyectos, informes).ejecutar("obra-fantasma");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("ya no existe");
  });
});
