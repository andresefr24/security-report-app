import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PromotoresPage } from "@/ui/pages/PromotoresPage";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { ListarPromotores } from "@/application/use-cases/listar-promotores";
import { type Promotor } from "@/domain/promotor/promotor";
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

// La pantalla usa <Link>, así que necesita un router alrededor.
function montar(repo: PromotorRepositoryEnMemoria) {
  return render(
    <MemoryRouter>
      <PromotoresPage listarPromotores={new ListarPromotores(repo)} />
    </MemoryRouter>,
  );
}

describe("PromotoresPage", () => {
  let repo: PromotorRepositoryEnMemoria;

  beforeEach(() => {
    repo = new PromotorRepositoryEnMemoria();
  });

  it("muestra el estado vacío con salida cuando no hay promotores", async () => {
    montar(repo);

    expect(await screen.findByText(/Aún no tienes promotores/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Nuevo promotor/i })).toBeInTheDocument();
  });

  it("lista los promotores registrados", async () => {
    const alta = new AltaPromotor(repo);
    await alta.ejecutar({ nombreRazonSocial: "Canal de Isabel II", nif: "A28000000" });
    await alta.ejecutar({ nombreRazonSocial: "Ayuntamiento de Getafe" });

    montar(repo);

    expect(await screen.findByText("Canal de Isabel II")).toBeInTheDocument();
    expect(screen.getByText("Ayuntamiento de Getafe")).toBeInTheDocument();
    expect(screen.getByText("A28000000")).toBeInTheDocument();
    // Con datos ya no se muestra el estado vacío.
    expect(screen.queryByText(/Aún no tienes promotores/i)).not.toBeInTheDocument();
  });

  it("cada promotor enlaza a su pantalla de edición", async () => {
    const alta = await new AltaPromotor(repo).ejecutar({ nombreRazonSocial: "Canal de Isabel II" });
    if (!alta.ok) throw new Error("el alta debería funcionar");

    montar(repo);

    const enlace = await screen.findByRole("link", { name: /Canal de Isabel II/i });
    expect(enlace).toHaveAttribute("href", `/promotores/${alta.valor.id}`);
  });
});
