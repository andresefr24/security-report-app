import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { ObraFormPage } from "@/ui/pages/ObraFormPage";
import { CrearProyecto } from "@/application/use-cases/crear-proyecto";
import { EditarProyecto } from "@/application/use-cases/editar-proyecto";
import { ListarPromotores } from "@/application/use-cases/listar-promotores";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { type Id } from "@/domain/shared/id";
import { PromotorRepositoryEnMemoria, ProyectoRepositoryEnMemoria } from "@/test/fakes";
import { FUTURE_PROVIDER, FUTURE_ROUTER } from "@/app/opciones-router";

function montar(
  proyectos: ProyectoRepositoryEnMemoria,
  promotores: PromotorRepositoryEnMemoria,
  ruta = "/obras/nueva",
) {
  const pagina = (
    <ObraFormPage
      crearProyecto={new CrearProyecto(proyectos, promotores)}
      editarProyecto={new EditarProyecto(proyectos, promotores)}
      listarPromotores={new ListarPromotores(promotores)}
    />
  );
  const router = createMemoryRouter(
    [
      { path: "/obras/nueva", element: pagina },
      { path: "/obras/:id", element: pagina },
      { path: "/obras", element: <p>Listado de obras</p> },
    ],
    { initialEntries: [ruta], future: FUTURE_ROUTER },
  );
  return render(<RouterProvider router={router} future={FUTURE_PROVIDER} />);
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

  it("guarda el contratista, que va en la cabecera de los informes", async () => {
    const promotorId = await unPromotor();
    montar(proyectos, promotores);

    const selector = await screen.findByLabelText(/Promotor/i);
    fireEvent.change(selector, { target: { value: promotorId } });
    fireEvent.change(screen.getByLabelText(/Código de obra/i), {
      target: { value: "OB-2026-014" },
    });
    fireEvent.change(screen.getByLabelText(/^Contratista$/i), {
      target: { value: "API Movilidad" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Listado de obras")).toBeInTheDocument();
    expect([...proyectos.guardados.values()][0].contratista).toBe("API Movilidad");
  });

  it("guarda los datos de obra que pedían los coordinadores", async () => {
    const promotorId = await unPromotor();
    montar(proyectos, promotores);

    const selector = await screen.findByLabelText(/Promotor/i);
    fireEvent.change(selector, { target: { value: promotorId } });
    fireEvent.change(screen.getByLabelText(/Código de obra/i), {
      target: { value: "OB-2026-014" },
    });
    fireEvent.change(screen.getByLabelText(/Ubicación de la obra/i), {
      target: { value: "Pº del Tren Talgo, 10, 28290 Las Rozas de Madrid" },
    });
    fireEvent.change(screen.getByLabelText(/Plazo de ejecución/i), {
      target: { value: "18 meses" },
    });
    fireEvent.change(screen.getByLabelText(/CIF del contratista/i), {
      target: { value: "A28017986" },
    });
    fireEvent.change(screen.getByLabelText(/Presupuesto de ejecución/i), {
      target: { value: "27.470.256,11 €" },
    });
    fireEvent.change(screen.getByLabelText(/Presupuesto del Estudio de Seguridad/i), {
      target: { value: "189.523,06 €" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Listado de obras")).toBeInTheDocument();
    const guardada = [...proyectos.guardados.values()][0];
    expect(guardada.ubicacion).toContain("Tren Talgo");
    expect(guardada.plazoEjecucion).toBe("18 meses");
    expect(guardada.cifContratista).toBe("A28017986");
    expect(guardada.presupuestoEjecucion).toBe("27.470.256,11 €");
    expect(guardada.presupuestoEss).toBe("189.523,06 €");
  });

  it("guarda los correos en un solo campo, separados por punto y coma", async () => {
    const promotorId = await unPromotor();
    montar(proyectos, promotores);

    const selector = await screen.findByLabelText(/Promotor/i);
    fireEvent.change(selector, { target: { value: promotorId } });
    fireEvent.change(screen.getByLabelText(/Código de obra/i), { target: { value: "OB-001" } });
    fireEvent.change(screen.getByLabelText(/^Correos$/i), {
      target: { value: "marta@canal.es; jefe@contrata.es" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Listado de obras")).toBeInTheDocument();
    expect([...proyectos.guardados.values()][0].correos).toBe(
      "marta@canal.es; jefe@contrata.es",
    );
  });

  it("abre una obra existente con sus datos ya puestos y guarda los cambios", async () => {
    const promotorId = await unPromotor();
    const obra = await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-VIEJA",
      promotorId,
      frecuenciaVisita: "semanal",
      correos: "marta@canal.es",
    });
    if (!obra.ok) throw new Error("crear la obra debería funcionar");

    montar(proyectos, promotores, `/obras/${obra.valor.id}`);

    expect(await screen.findByText("Editar obra")).toBeInTheDocument();
    expect(screen.getByLabelText<HTMLInputElement>(/Código de obra/i).value).toBe("OB-VIEJA");

    // Rellenar lo que no existía cuando se dio de alta es justo para lo que
    // hacía falta poder editar.
    fireEvent.change(screen.getByLabelText(/Ubicación de la obra/i), {
      target: { value: "Pº del Tren Talgo, 10" },
    });
    fireEvent.change(screen.getByLabelText(/^Correos$/i), {
      target: { value: "marta@canal.es; jefe@contrata.es" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Listado de obras")).toBeInTheDocument();
    // Se corrige la misma obra, no se crea otra.
    expect(proyectos.guardados.size).toBe(1);
    const guardada = proyectos.guardados.get(obra.valor.id);
    expect(guardada?.ubicacion).toBe("Pº del Tren Talgo, 10");
    expect(guardada?.correos).toBe("marta@canal.es; jefe@contrata.es");
  });

  it("avisa si la obra que se intenta editar ya no existe", async () => {
    await unPromotor();

    montar(proyectos, promotores, "/obras/obra-fantasma");

    expect(await screen.findByText(/Esa obra ya no existe/i)).toBeInTheDocument();
  });
});
