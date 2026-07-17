import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ObrasPage } from "@/ui/pages/ObrasPage";
import { ListarProyectos } from "@/application/use-cases/listar-proyectos";
import { CrearProyecto } from "@/application/use-cases/crear-proyecto";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { PromotorRepositoryEnMemoria, ProyectoRepositoryEnMemoria } from "@/test/fakes";

describe("ObrasPage", () => {
  let proyectos: ProyectoRepositoryEnMemoria;
  let promotores: PromotorRepositoryEnMemoria;

  beforeEach(() => {
    proyectos = new ProyectoRepositoryEnMemoria();
    promotores = new PromotorRepositoryEnMemoria();
  });

  function montar() {
    return render(
      <MemoryRouter>
        <ObrasPage listarProyectos={new ListarProyectos(proyectos, promotores)} />
      </MemoryRouter>,
    );
  }

  it("muestra el estado vacío con salida cuando no hay obras", async () => {
    montar();

    expect(await screen.findByText(/Aún no tienes obras/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Nueva obra/i })).toBeInTheDocument();
  });

  it("muestra cada obra con el nombre de su promotor", async () => {
    const alta = await new AltaPromotor(promotores).ejecutar({
      nombreRazonSocial: "Canal de Isabel II",
    });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-2026-014",
      promotorId: alta.valor.id,
      descripcion: "Centro cívico Los Molinos",
      frecuenciaVisita: "diaria",
    });

    montar();

    expect(await screen.findByText("OB-2026-014")).toBeInTheDocument();
    expect(screen.getByText("Centro cívico Los Molinos")).toBeInTheDocument();
    // El nombre del promotor se resuelve desde su id, no está copiado en la obra.
    expect(screen.getByText("Canal de Isabel II")).toBeInTheDocument();
    expect(screen.getByText(/Visita diaria/i)).toBeInTheDocument();
  });

  it("avisa si la obra apunta a un promotor que ya no está", async () => {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Se irá" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-001",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });
    promotores.guardados.clear();

    montar();

    expect(await screen.findByText(/promotor de esta obra ya no está registrado/i)).toBeInTheDocument();
  });
});
