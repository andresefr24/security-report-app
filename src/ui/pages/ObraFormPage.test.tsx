import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { ObraFormPage } from "@/ui/pages/ObraFormPage";
import { CrearProyecto } from "@/application/use-cases/crear-proyecto";
import { ListarPromotores } from "@/application/use-cases/listar-promotores";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { type Proyecto } from "@/domain/proyecto/proyecto";
import { type Promotor } from "@/domain/promotor/promotor";
import { type ProyectoRepository } from "@/domain/ports/proyecto-repository";
import { type PromotorRepository } from "@/domain/ports/promotor-repository";
import { type Id } from "@/domain/shared/id";

class PromotorRepositoryEnMemoria implements PromotorRepository {
  readonly guardados = new Map<Id, Promotor>();
  async guardar(p: Promotor): Promise<void> {
    this.guardados.set(p.id, p);
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
  async guardar(p: Proyecto): Promise<void> {
    this.guardados.set(p.id, p);
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

function montar(proyectos: ProyectoRepositoryEnMemoria, promotores: PromotorRepositoryEnMemoria) {
  const router = createMemoryRouter(
    [
      {
        path: "/obras/nueva",
        element: (
          <ObraFormPage
            crearProyecto={new CrearProyecto(proyectos, promotores)}
            listarPromotores={new ListarPromotores(promotores)}
          />
        ),
      },
      { path: "/obras", element: <p>Listado de obras</p> },
    ],
    { initialEntries: ["/obras/nueva"] },
  );
  return render(<RouterProvider router={router} />);
}

describe("ObraFormPage", () => {
  let proyectos: ProyectoRepositoryEnMemoria;
  let promotores: PromotorRepositoryEnMemoria;

  beforeEach(() => {
    proyectos = new ProyectoRepositoryEnMemoria();
    promotores = new PromotorRepositoryEnMemoria();
  });

  async function unPromotor(nombreRazonSocial = "Canal de Isabel II"): Promise<Id> {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    return alta.valor.id;
  }

  it("si no hay promotores, pide registrar uno antes de crear la obra", async () => {
    montar(proyectos, promotores);

    expect(await screen.findByText(/necesitas registrar a su promotor/i)).toBeInTheDocument();
  });

  it("muestra los promotores registrados para poder elegir uno", async () => {
    await unPromotor("Ayuntamiento de Getafe");
    montar(proyectos, promotores);

    const selector = await screen.findByLabelText<HTMLSelectElement>(/Promotor/i);
    expect(selector).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Ayuntamiento de Getafe" })).toBeInTheDocument();
  });

  it("no guarda si falta el código de obra o el promotor", async () => {
    await unPromotor();
    montar(proyectos, promotores);
    await screen.findByLabelText(/Promotor/i);

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText(/código de obra es obligatorio/i)).toBeInTheDocument();
    expect(proyectos.guardados.size).toBe(0);
  });

  it("crea la obra guardando el id del promotor, no sus datos", async () => {
    const promotorId = await unPromotor();
    montar(proyectos, promotores);

    const selector = await screen.findByLabelText(/Promotor/i);
    fireEvent.change(selector, { target: { value: promotorId } });
    fireEvent.change(screen.getByLabelText(/Código de obra/i), {
      target: { value: "OB-2026-014" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Listado de obras")).toBeInTheDocument();
    const guardada = [...proyectos.guardados.values()][0];
    expect(guardada.codigoObra).toBe("OB-2026-014");
    expect(guardada.promotorId).toBe(promotorId);
    expect(guardada).not.toHaveProperty("nombreRazonSocial");
  });

  it("añade un destinatario a la lista de distribución y lo guarda con su rol", async () => {
    const promotorId = await unPromotor();
    montar(proyectos, promotores);

    const selector = await screen.findByLabelText(/Promotor/i);
    fireEvent.change(selector, { target: { value: promotorId } });
    fireEvent.change(screen.getByLabelText(/Código de obra/i), { target: { value: "OB-001" } });

    fireEvent.click(screen.getByRole("button", { name: /Añadir destinatario/i }));
    fireEvent.change(screen.getByLabelText(/^Correo$/i), {
      target: { value: "marta@canal.es" },
    });
    fireEvent.change(screen.getByLabelText(/^Rol$/i), { target: { value: "contratista" } });

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Listado de obras")).toBeInTheDocument();
    const guardada = [...proyectos.guardados.values()][0];
    expect(guardada.listaDistribucion).toHaveLength(1);
    expect(guardada.listaDistribucion?.[0].correo).toBe("marta@canal.es");
    expect(guardada.listaDistribucion?.[0].rol).toBe("contratista");
  });

  it("no guarda si un destinatario tiene el correo mal escrito", async () => {
    const promotorId = await unPromotor();
    montar(proyectos, promotores);

    const selector = await screen.findByLabelText(/Promotor/i);
    fireEvent.change(selector, { target: { value: promotorId } });
    fireEvent.change(screen.getByLabelText(/Código de obra/i), { target: { value: "OB-001" } });

    fireEvent.click(screen.getByRole("button", { name: /Añadir destinatario/i }));
    fireEvent.change(screen.getByLabelText(/^Correo$/i), { target: { value: "no-es-correo" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText(/formato válido/i)).toBeInTheDocument();
    expect(proyectos.guardados.size).toBe(0);
  });
});
