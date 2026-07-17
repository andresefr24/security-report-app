import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { PromotorFormPage } from "@/ui/pages/PromotorFormPage";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { EditarPromotor } from "@/application/use-cases/editar-promotor";
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

// La pantalla usa useParams/useNavigate, así que la montamos dentro de un router
// de memoria (no necesita navegador real). `ruta` simula la URL de entrada.
function montar(repo: PromotorRepositoryEnMemoria, ruta: string) {
  const pagina = (
    <PromotorFormPage
      altaPromotor={new AltaPromotor(repo)}
      editarPromotor={new EditarPromotor(repo)}
    />
  );
  const router = createMemoryRouter(
    [
      { path: "/promotores/nuevo", element: pagina },
      { path: "/promotores/:id", element: pagina },
      { path: "/promotores", element: <p>Listado</p> },
    ],
    { initialEntries: [ruta] },
  );
  return render(<RouterProvider router={router} />);
}

describe("PromotorFormPage", () => {
  let repo: PromotorRepositoryEnMemoria;

  beforeEach(() => {
    repo = new PromotorRepositoryEnMemoria();
  });

  it("muestra un error y no guarda si falta la razón social", async () => {
    montar(repo, "/promotores/nuevo");

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText(/razón social/i)).toBeInTheDocument();
    expect(repo.guardados.size).toBe(0);
  });

  it("da de alta un promotor y vuelve al listado", async () => {
    montar(repo, "/promotores/nuevo");

    fireEvent.change(screen.getByLabelText(/Nombre o razón social/i), {
      target: { value: "Canal de Isabel II" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    // Al guardar navega al listado.
    expect(await screen.findByText("Listado")).toBeInTheDocument();
    expect([...repo.guardados.values()][0].nombreRazonSocial).toBe("Canal de Isabel II");
  });

  it("precarga los datos al editar un promotor existente", async () => {
    const alta = await new AltaPromotor(repo).ejecutar({
      nombreRazonSocial: "Nombre viejo",
      nif: "A28000000",
    });
    if (!alta.ok) throw new Error("el alta debería funcionar");

    montar(repo, `/promotores/${alta.valor.id}`);

    const nombre = await screen.findByLabelText<HTMLInputElement>(/Nombre o razón social/i);
    expect(nombre.value).toBe("Nombre viejo");
  });

  it("al editar actualiza el promotor en vez de duplicarlo", async () => {
    const alta = await new AltaPromotor(repo).ejecutar({ nombreRazonSocial: "Nombre viejo" });
    if (!alta.ok) throw new Error("el alta debería funcionar");

    montar(repo, `/promotores/${alta.valor.id}`);
    const nombre = await screen.findByLabelText(/Nombre o razón social/i);

    fireEvent.change(nombre, { target: { value: "Nombre nuevo" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Listado")).toBeInTheDocument();
    expect(repo.guardados.size).toBe(1);
    expect(repo.guardados.get(alta.valor.id)?.nombreRazonSocial).toBe("Nombre nuevo");
  });
});
