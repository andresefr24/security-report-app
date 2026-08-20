import { describe, it, expect, beforeEach } from "vitest";
import { EditarProyecto } from "@/application/use-cases/editar-proyecto";
import { CrearProyecto } from "@/application/use-cases/crear-proyecto";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { type Id } from "@/domain/shared/id";
import { ProyectoRepositoryEnMemoria, PromotorRepositoryEnMemoria } from "@/test/fakes";

describe("EditarProyecto", () => {
  let proyectos: ProyectoRepositoryEnMemoria;
  let promotores: PromotorRepositoryEnMemoria;
  let promotorId: Id;

  beforeEach(async () => {
    proyectos = new ProyectoRepositoryEnMemoria();
    promotores = new PromotorRepositoryEnMemoria();
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Canal" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    promotorId = alta.valor.id;
  });

  async function unaObra(): Promise<Id> {
    const obra = await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-001",
      promotorId,
      frecuenciaVisita: "semanal",
    });
    if (!obra.ok) throw new Error("crear la obra debería funcionar");
    return obra.valor.id;
  }

  it("guarda los cambios sin duplicar la obra", async () => {
    const id = await unaObra();

    const resultado = await new EditarProyecto(proyectos, promotores).ejecutar({
      id,
      codigoObra: "OB-001",
      promotorId,
      frecuenciaVisita: "semanal",
      ubicacion: "Pº del Tren Talgo, 10",
      correos: "marta@canal.es; jefe@contrata.es",
    });

    expect(resultado.ok).toBe(true);
    expect(proyectos.guardados.size).toBe(1);
    expect(proyectos.guardados.get(id)?.ubicacion).toBe("Pº del Tren Talgo, 10");
    expect(proyectos.guardados.get(id)?.correos).toBe("marta@canal.es; jefe@contrata.es");
  });

  it("carga la obra para rellenar el formulario", async () => {
    const id = await unaObra();

    expect((await new EditarProyecto(proyectos, promotores).cargar(id))?.codigoObra).toBe("OB-001");
  });

  it("NO da de alta una obra por la puerta de atrás con un id inventado", async () => {
    const resultado = await new EditarProyecto(proyectos, promotores).ejecutar({
      id: "obra-fantasma",
      codigoObra: "OB-INVENTADA",
      promotorId,
      frecuenciaVisita: "semanal",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("ya no existe");
    expect(proyectos.guardados.size).toBe(0);
  });

  it("avisa si el promotor elegido ya no existe", async () => {
    const id = await unaObra();

    const resultado = await new EditarProyecto(proyectos, promotores).ejecutar({
      id,
      codigoObra: "OB-001",
      promotorId: "promotor-fantasma",
      frecuenciaVisita: "semanal",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("promotor");
  });

  it("sigue aplicando las reglas del dominio al editar", async () => {
    const id = await unaObra();

    const resultado = await new EditarProyecto(proyectos, promotores).ejecutar({
      id,
      codigoObra: "   ",
      promotorId,
      frecuenciaVisita: "semanal",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("código de obra");
  });
});
