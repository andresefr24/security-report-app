import { describe, it, expect, beforeEach } from "vitest";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { EditarPromotor } from "@/application/use-cases/editar-promotor";
import { ListarPromotores } from "@/application/use-cases/listar-promotores";
import { type Promotor } from "@/domain/promotor/promotor";
import { type PromotorRepository } from "@/domain/ports/promotor-repository";
import { type Id } from "@/domain/shared/id";

// Fake en memoria del puerto: un Map, sin localForage ni IndexedDB. Al implementar
// la misma interfaz que el adaptador real, los casos de uso funcionan igual.
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

describe("Casos de uso de promotores", () => {
  let repo: PromotorRepositoryEnMemoria;

  beforeEach(() => {
    repo = new PromotorRepositoryEnMemoria();
  });

  describe("AltaPromotor", () => {
    it("guarda el promotor cuando los datos son válidos", async () => {
      const resultado = await new AltaPromotor(repo).ejecutar({
        nombreRazonSocial: "Canal de Isabel II",
      });

      expect(resultado.ok).toBe(true);
      expect(repo.guardados.size).toBe(1);
    });

    it("no guarda nada cuando los datos son inválidos", async () => {
      const resultado = await new AltaPromotor(repo).ejecutar({ nombreRazonSocial: "" });

      expect(resultado.ok).toBe(false);
      expect(repo.guardados.size).toBe(0);
    });
  });

  describe("EditarPromotor", () => {
    it("actualiza un promotor existente sin duplicarlo", async () => {
      const alta = await new AltaPromotor(repo).ejecutar({ nombreRazonSocial: "Nombre viejo" });
      if (!alta.ok) throw new Error("el alta debería funcionar");

      const resultado = await new EditarPromotor(repo).ejecutar({
        id: alta.valor.id,
        nombreRazonSocial: "Nombre nuevo",
      });

      expect(resultado.ok).toBe(true);
      expect(repo.guardados.size).toBe(1);
      expect(repo.guardados.get(alta.valor.id)?.nombreRazonSocial).toBe("Nombre nuevo");
    });

    it("falla si el promotor no existe (no lo crea por la puerta de atrás)", async () => {
      const resultado = await new EditarPromotor(repo).ejecutar({
        id: "id-inventado",
        nombreRazonSocial: "Fantasma",
      });

      expect(resultado.ok).toBe(false);
      if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("ya no existe");
      expect(repo.guardados.size).toBe(0);
    });

    it("no guarda si los datos nuevos son inválidos", async () => {
      const alta = await new AltaPromotor(repo).ejecutar({ nombreRazonSocial: "Válido" });
      if (!alta.ok) throw new Error("el alta debería funcionar");

      const resultado = await new EditarPromotor(repo).ejecutar({
        id: alta.valor.id,
        nombreRazonSocial: "",
      });

      expect(resultado.ok).toBe(false);
      // El original sigue intacto.
      expect(repo.guardados.get(alta.valor.id)?.nombreRazonSocial).toBe("Válido");
    });
  });

  describe("ListarPromotores", () => {
    it("devuelve una lista vacía cuando no hay ninguno", async () => {
      expect(await new ListarPromotores(repo).ejecutar()).toEqual([]);
    });

    it("devuelve todos los promotores dados de alta", async () => {
      const alta = new AltaPromotor(repo);
      await alta.ejecutar({ nombreRazonSocial: "Uno" });
      await alta.ejecutar({ nombreRazonSocial: "Dos" });

      expect(await new ListarPromotores(repo).ejecutar()).toHaveLength(2);
    });
  });
});
