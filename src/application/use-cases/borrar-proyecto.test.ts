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

  it("NO borra una obra con informes: son la evidencia de las visitas", async () => {
    const id = await unaObra();
    await new CrearBorradorInforme(informes, proyectos).ejecutar(id);

    const resultado = await new BorrarProyecto(proyectos, informes).ejecutar(id);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("Bórralo primero");
    expect(proyectos.guardados.has(id)).toBe(true);
  });

  it("cuenta los informes en plural cuando hay más de uno", async () => {
    const id = await unaObra();
    await new CrearBorradorInforme(informes, proyectos).ejecutar(id);
    await new CrearBorradorInforme(informes, proyectos).ejecutar(id);

    const resultado = await new BorrarProyecto(proyectos, informes).ejecutar(id);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("2 informes");
  });

  it("no cuenta los informes de OTRA obra", async () => {
    const id = await unaObra();
    const otra = await unaObra();
    await new CrearBorradorInforme(informes, proyectos).ejecutar(otra);

    expect((await new BorrarProyecto(proyectos, informes).ejecutar(id)).ok).toBe(true);
  });

  it("avisa si la obra ya no existe", async () => {
    const resultado = await new BorrarProyecto(proyectos, informes).ejecutar("obra-fantasma");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("ya no existe");
  });
});
