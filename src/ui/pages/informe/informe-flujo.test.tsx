import { describe, it, expect, beforeEach, vi } from "vitest";
import { StrictMode } from "react";
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

  /**
   * `estricto` monta dentro de <StrictMode>, que en desarrollo hace lo que hace
   * React de verdad al arrancar la app: montar, limpiar y volver a montar. Sin
   * esto no se ve el cuelgue de la pantalla puente.
   */
  function montar(rutaInicial: string, { estricto = false } = {}) {
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
    const app = <RouterProvider router={router} future={FUTURE_PROVIDER} />;
    return render(estricto ? <StrictMode>{app}</StrictMode> : app);
  }

  it("abre el wizard también en desarrollo, con el doble montaje de StrictMode", async () => {
    const obraId = await unaObra();

    montar(`/obras/${obraId}/informes/nuevo`, { estricto: true });

    // Si la pantalla puente se queda en "Creando el informe…" es que el borrador
    // se creó pero nadie navegó (pasó de verdad: se veía solo con `npm run dev`).
    expect(await screen.findByText("Paso 1 de 3")).toBeInTheDocument();
    // Y un solo borrador, no dos: el guard sigue haciendo su trabajo.
    expect(informes.guardados.size).toBe(1);
  });

  it("crea el borrador y abre el wizard en el paso 1", async () => {
    const obraId = await unaObra();

    montar(`/obras/${obraId}/informes/nuevo`);

    expect(await screen.findByText("Paso 1 de 3")).toBeInTheDocument();
    expect(screen.getByText("Datos de la visita")).toBeInTheDocument();
    // El borrador quedó guardado.
    expect(informes.guardados.size).toBe(1);
  });

  it("el paso 1 solo pide la fecha y la hora de la visita", async () => {
    const obraId = await unaObra();
    montar(`/obras/${obraId}/informes/nuevo`);
    await screen.findByText("Paso 1 de 3");

    expect(screen.getByLabelText(/Fecha y hora de la visita/i)).toBeInTheDocument();
    // Lo de "quién recibe el informe" se quitó: ya sale del promotor y de la
    // obra, y quien lo recibe en mano se recoge al firmar.
    expect(screen.queryByLabelText(/^Nombre$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Empresa o entidad/i)).not.toBeInTheDocument();
  });

  it("escribe una observación en el paso 2 y la autoguarda", async () => {
    const obraId = await unaObra();
    montar(`/obras/${obraId}/informes/nuevo`);
    await screen.findByText("Paso 1 de 3");

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    await screen.findByText("Paso 2 de 3");
    expect(screen.getByText("Situación y observaciones")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Añadir observación" }));
    fireEvent.change(screen.getByLabelText(/^Título$/i), {
      target: { value: "Limpieza de calzada con barredora." },
    });
    fireEvent.click(screen.getByRole("button", { name: "MEDIDA REQUERIDA" }));
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    await screen.findByText("Paso 3 de 3");

    const guardado = [...informes.guardados.values()][0];
    expect(guardado.observaciones?.[0].titulo).toBe("Limpieza de calzada con barredora.");
    expect(guardado.observaciones?.[0].estado).toBe("medida-requerida");
  });

  it("muestra un error si la obra no existe", async () => {
    montar("/obras/obra-fantasma/informes/nuevo");

    expect(await screen.findByText(/ya no existe/i)).toBeInTheDocument();
  });
});
