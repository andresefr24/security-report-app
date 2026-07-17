import { describe, it, expect, beforeEach } from "vitest";
import { CrearProyecto } from "@/application/use-cases/crear-proyecto";
import { ListarProyectos } from "@/application/use-cases/listar-proyectos";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { type Proyecto } from "@/domain/proyecto/proyecto";
import { type Promotor } from "@/domain/promotor/promotor";
import { type ProyectoRepository } from "@/domain/ports/proyecto-repository";
import { type PromotorRepository } from "@/domain/ports/promotor-repository";
import { type Id } from "@/domain/shared/id";

class PromotorRepositoryEnMemoria implements PromotorRepository {
  readonly guardados = new Map<Id, Promotor>();
  async guardar(promotor: Promotor): Promise<void> {
    this.guardados.set(promotor.id, promotor);
  }
  async obtenerPorId(id: Id): Promise<Promotor | null> {
    return this.guardados.get(id) ?? null;
  }
  async listar(): Promise<Promotor[]> {
    return [...this.guardados.values()];
  }
}

class ProyectoRepositoryEnMemoria implements ProyectoRepository {
  readonly guardados = new Map<Id, Proyecto>();
  async guardar(proyecto: Proyecto): Promise<void> {
    this.guardados.set(proyecto.id, proyecto);
  }
  async obtenerPorId(id: Id): Promise<Proyecto | null> {
    return this.guardados.get(id) ?? null;
  }
  async listar(): Promise<Proyecto[]> {
    return [...this.guardados.values()];
  }
  async listarPorPromotor(promotorId: Id): Promise<Proyecto[]> {
    return [...this.guardados.values()].filter((p) => p.promotorId === promotorId);
  }
}

describe("Casos de uso de obras", () => {
  let proyectos: ProyectoRepositoryEnMemoria;
  let promotores: PromotorRepositoryEnMemoria;

  beforeEach(() => {
    proyectos = new ProyectoRepositoryEnMemoria();
    promotores = new PromotorRepositoryEnMemoria();
  });

  /** Da de alta un promotor de verdad y devuelve su id. */
  async function unPromotor(nombreRazonSocial = "Canal de Isabel II"): Promise<Id> {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    return alta.valor.id;
  }

  describe("CrearProyecto", () => {
    it("guarda la obra cuando los datos son válidos y el promotor existe", async () => {
      const promotorId = await unPromotor();

      const resultado = await new CrearProyecto(proyectos, promotores).ejecutar({
        codigoObra: "OB-001",
        promotorId,
        frecuenciaVisita: "semanal",
      });

      expect(resultado.ok).toBe(true);
      expect(proyectos.guardados.size).toBe(1);
      // Guarda la referencia, no una copia de los datos del promotor.
      if (resultado.ok) expect(resultado.valor.promotorId).toBe(promotorId);
    });

    it("no guarda la obra si el promotor no existe", async () => {
      const resultado = await new CrearProyecto(proyectos, promotores).ejecutar({
        codigoObra: "OB-001",
        promotorId: "promotor-inventado",
        frecuenciaVisita: "semanal",
      });

      expect(resultado.ok).toBe(false);
      if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("ya no existe");
      expect(proyectos.guardados.size).toBe(0);
    });

    it("no guarda nada cuando los datos son inválidos", async () => {
      const promotorId = await unPromotor();

      const resultado = await new CrearProyecto(proyectos, promotores).ejecutar({
        codigoObra: "",
        promotorId,
        frecuenciaVisita: "semanal",
      });

      expect(resultado.ok).toBe(false);
      expect(proyectos.guardados.size).toBe(0);
    });
  });

  describe("ListarProyectos", () => {
    it("devuelve una lista vacía cuando no hay obras", async () => {
      expect(await new ListarProyectos(proyectos, promotores).ejecutar()).toEqual([]);
    });

    it("resuelve el promotor de cada obra a partir de su id", async () => {
      const promotorId = await unPromotor("Ayuntamiento de Getafe");
      await new CrearProyecto(proyectos, promotores).ejecutar({
        codigoObra: "OB-001",
        promotorId,
        frecuenciaVisita: "diaria",
      });

      const lista = await new ListarProyectos(proyectos, promotores).ejecutar();

      expect(lista).toHaveLength(1);
      expect(lista[0].proyecto.codigoObra).toBe("OB-001");
      expect(lista[0].promotor?.nombreRazonSocial).toBe("Ayuntamiento de Getafe");
    });

    it("devuelve promotor null si la obra apunta a uno que ya no está", async () => {
      const promotorId = await unPromotor();
      await new CrearProyecto(proyectos, promotores).ejecutar({
        codigoObra: "OB-001",
        promotorId,
        frecuenciaVisita: "diaria",
      });
      // El promotor desaparece después de crear la obra.
      promotores.guardados.clear();

      const lista = await new ListarProyectos(proyectos, promotores).ejecutar();

      expect(lista[0].promotor).toBeNull();
    });
  });
});
