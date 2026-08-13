import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { CrearInformePage } from "@/ui/pages/informe/CrearInformePage";
import { InformeWizardPage } from "@/ui/pages/informe/InformeWizardPage";
import { CrearBorradorInforme } from "@/application/use-cases/crear-borrador-informe";
import { GuardarInforme } from "@/application/use-cases/guardar-informe";
import { ObtenerInforme } from "@/application/use-cases/obtener-informe";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { CrearProyecto } from "@/application/use-cases/crear-proyecto";
import { type Id } from "@/domain/shared/id";
import { FUTURE_PROVIDER, FUTURE_ROUTER } from "@/app/opciones-router";
import {
  InformeRepositoryEnMemoria,
  ProyectoRepositoryEnMemoria,
  PromotorRepositoryEnMemoria,
} from "@/test/fakes";

// El último paso monta el campo de firma, que usa <canvas> (no va en jsdom).
// Aquí probamos el recorrido del asistente, no el trazo: lo sustituimos.
vi.mock("@/ui/components/campo-firma", () => ({
  CampoFirma: () => <div>campo de firma</div>,
}));

describe("Flujo del informe (crear borrador → wizard)", () => {
  let informes: InformeRepositoryEnMemoria;
  let proyectos: ProyectoRepositoryEnMemoria;
  let promotores: PromotorRepositoryEnMemoria;

  beforeEach(() => {
    informes = new InformeRepositoryEnMemoria();
    proyectos = new ProyectoRepositoryEnMemoria();
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

  function montar(rutaInicial: string) {
    const router = createMemoryRouter(
      [
        {
          path: "/obras/:obraId/informes/nuevo",
          element: (
            <CrearInformePage
              crearBorradorInforme={new CrearBorradorInforme(informes, proyectos)}
            />
          ),
        },
        {
          path: "/informes/:id",
          element: (
            <InformeWizardPage
              obtenerInforme={new ObtenerInforme(informes)}
              guardarInforme={new GuardarInforme(informes)}
            />
          ),
        },
        { path: "/obras", element: <p>Listado de obras</p> },
      ],
      { initialEntries: [rutaInicial], future: FUTURE_ROUTER },
    );
    return render(<RouterProvider router={router} future={FUTURE_PROVIDER} />);
  }

  it("crea el borrador y abre el wizard en el paso 1", async () => {
    const obraId = await unaObra();

    montar(`/obras/${obraId}/informes/nuevo`);

    expect(await screen.findByText("Paso 1 de 3")).toBeInTheDocument();
    expect(screen.getByText("Datos de la visita")).toBeInTheDocument();
    // El borrador quedó guardado.
    expect(informes.guardados.size).toBe(1);
  });

  it("recorre los pasos y autoguarda lo escrito", async () => {
    const obraId = await unaObra();
    montar(`/obras/${obraId}/informes/nuevo`);
    await screen.findByText("Paso 1 de 3");

    fireEvent.change(screen.getByLabelText(/^Nombre$/i), {
      target: { value: "Luis Jefe" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    await screen.findByText("Paso 2 de 3");

    const guardado = [...informes.guardados.values()][0];
    expect(guardado.receptor?.nombre).toBe("Luis Jefe");
    expect(guardado.estado).toBe("borrador");
  });

  it("escribe una actividad en el paso 2 y la autoguarda", async () => {
    const obraId = await unaObra();
    montar(`/obras/${obraId}/informes/nuevo`);
    await screen.findByText("Paso 1 de 3");

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    await screen.findByText("Paso 2 de 3");
    expect(screen.getByText("Situación y actividades")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Añadir actividad" }));
    fireEvent.change(screen.getByLabelText(/Qué pasó/i), {
      target: { value: "Limpieza de calzada con barredora." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    await screen.findByText("Paso 3 de 3");

    const guardado = [...informes.guardados.values()][0];
    expect(guardado.actividades?.[0].descripcion).toBe("Limpieza de calzada con barredora.");
  });

  it("muestra un error si la obra no existe", async () => {
    montar("/obras/obra-fantasma/informes/nuevo");

    expect(await screen.findByText(/ya no existe/i)).toBeInTheDocument();
  });
});
