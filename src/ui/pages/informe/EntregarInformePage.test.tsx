import { describe, it, expect, beforeEach, vi } from "vitest";
import { StrictMode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { EntregarInformePage } from "@/ui/pages/informe/EntregarInformePage";
import { FinalizarInforme } from "@/application/use-cases/finalizar-informe";
import { GenerarPdfDelInforme } from "@/application/use-cases/generar-pdf-del-informe";
import { ConfigurarPerfil } from "@/application/use-cases/configurar-perfil";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { CrearProyecto } from "@/application/use-cases/crear-proyecto";
import { CrearBorradorInforme } from "@/application/use-cases/crear-borrador-informe";
import { GuardarInforme } from "@/application/use-cases/guardar-informe";
import { type DatosInforme } from "@/domain/informe/informe";
import { type SharePort, type ResultadoCompartir } from "@/domain/ports/share-port";
import { type Id } from "@/domain/shared/id";
import { FUTURE_PROVIDER, FUTURE_ROUTER } from "@/app/opciones-router";
import {
  CoordinadorRepositoryEnMemoria,
  InformeRepositoryEnMemoria,
  PdfPortFalso,
  PromotorRepositoryEnMemoria,
  ProyectoRepositoryEnMemoria,
} from "@/test/fakes";

const FIRMA_COORDINADOR = {
  nombre: "Ana Coordinadora",
  rol: "coordinador" as const,
  firma: "data:image/png;base64,AAAA",
};

/** Fake del SharePort: registra lo que se le pide y responde lo que le digamos. */
class SharePortFalso implements SharePort {
  compartidos: string[] = [];
  descargados: string[] = [];
  constructor(
    private readonly puede = true,
    private readonly respuesta: ResultadoCompartir = { tipo: "compartido" },
  ) {}
  sePuedeCompartir(): boolean {
    return this.puede;
  }
  async compartir(_pdf: Blob, nombre: string): Promise<ResultadoCompartir> {
    this.compartidos.push(nombre);
    return this.respuesta;
  }
  descargar(_pdf: Blob, nombre: string): void {
    this.descargados.push(nombre);
  }
}

describe("EntregarInformePage", () => {
  let informes: InformeRepositoryEnMemoria;
  let proyectos: ProyectoRepositoryEnMemoria;
  let promotores: PromotorRepositoryEnMemoria;
  let coordinadores: CoordinadorRepositoryEnMemoria;

  beforeEach(() => {
    informes = new InformeRepositoryEnMemoria();
    proyectos = new ProyectoRepositoryEnMemoria();
    promotores = new PromotorRepositoryEnMemoria();
    coordinadores = new CoordinadorRepositoryEnMemoria();
    URL.createObjectURL = vi.fn(() => "blob:falsa");
    URL.revokeObjectURL = vi.fn();
  });

  /** Monta perfil + promotor + obra + informe; devuelve el id del informe. */
  async function unInforme(cambios: Partial<DatosInforme> = {}): Promise<Id> {
    await new ConfigurarPerfil(coordinadores).ejecutar({
      nombreCompleto: "Ana García López",
      numeroRegistroIrsst: "3306",
    });
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Canal" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    const obra = await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-001",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
      listaDistribucion: [{ correo: "marta@canal.es", rol: "promotor" }],
    });
    if (!obra.ok) throw new Error("crear la obra debería funcionar");
    const borrador = await new CrearBorradorInforme(informes, proyectos).ejecutar(obra.valor.id);
    if (!borrador.ok) throw new Error("el borrador debería crearse");
    await new GuardarInforme(informes).ejecutar({ ...borrador.valor, ...cambios });
    return borrador.valor.id;
  }

  /**
   * `estricto` monta dentro de <StrictMode>, que es como arranca la app en
   * desarrollo: monta, limpia y vuelve a montar.
   */
  function montar(informeId: Id, compartir: SharePort, { estricto = false } = {}) {
    const router = createMemoryRouter(
      [
        {
          path: "/informes/:id/entregar",
          element: (
            <EntregarInformePage
              finalizarInforme={new FinalizarInforme(informes)}
              generarPdfDelInforme={
                new GenerarPdfDelInforme(
                  informes,
                  proyectos,
                  promotores,
                  coordinadores,
                  new PdfPortFalso(),
                )
              }
              compartir={compartir}
            />
          ),
        },
        { path: "/informes/:id", element: <p>Wizard del informe</p> },
        { path: "/obras", element: <p>Listado de obras</p> },
        { path: "/perfil", element: <p>Pantalla de perfil</p> },
      ],
      { initialEntries: [`/informes/${informeId}/entregar`], future: FUTURE_ROUTER },
    );
    const app = <RouterProvider router={router} future={FUTURE_PROVIDER} />;
    return render(estricto ? <StrictMode>{app}</StrictMode> : app);
  }

  it("prepara el informe también en desarrollo, con el doble montaje de StrictMode", async () => {
    const informeId = await unInforme({
      actividades: [{ id: "a1", descripcion: "Visita sin incidencias." }],
      firmas: [FIRMA_COORDINADOR],
    });

    montar(informeId, new SharePortFalso(), { estricto: true });

    // Si se queda en "Preparando el informe…" es que el trabajo terminó pero
    // nadie lo recogió (pasó de verdad: solo se veía con `npm run dev`).
    expect(await screen.findByText("Informe listo")).toBeInTheDocument();
  });

  it("cierra el informe y muestra el PDF listo para compartir", async () => {
    const informeId = await unInforme({
      actividades: [{ id: "a1", descripcion: "Visita sin incidencias." }],
      firmas: [FIRMA_COORDINADOR],
    });

    montar(informeId, new SharePortFalso());

    expect(await screen.findByText("Informe listo")).toBeInTheDocument();
    // El informe queda cerrado de verdad.
    expect(informes.guardados.get(informeId)?.estado).toBe("finalizado");
  });

  it("avisa de lo que falta y deja volver al informe, sin cerrarlo", async () => {
    const informeId = await unInforme({ actividades: [{ id: "a1", descripcion: "Sin firmar" }] });

    montar(informeId, new SharePortFalso());

    expect(await screen.findByText(/Aún no se puede cerrar/i)).toBeInTheDocument();
    expect(screen.getByText(/Falta la firma del coordinador/i)).toBeInTheDocument();
    expect(informes.guardados.get(informeId)?.estado).toBe("borrador");

    fireEvent.click(screen.getByRole("button", { name: /Volver al informe/i }));
    expect(await screen.findByText("Wizard del informe")).toBeInTheDocument();
  });

  it("comparte el PDF con el nombre del archivo", async () => {
    const informeId = await unInforme({
      actividades: [{ id: "a1", descripcion: "Visita sin incidencias." }],
      firmas: [FIRMA_COORDINADOR],
    });
    const compartir = new SharePortFalso();

    montar(informeId, compartir);
    await screen.findByText("Informe listo");
    fireEvent.click(screen.getByRole("button", { name: "Compartir" }));

    await vi.waitFor(() => expect(compartir.compartidos).toHaveLength(1));
    expect(compartir.compartidos[0]).toContain("OB-001");
  });

  it("oculta el botón de compartir si el dispositivo no puede (caso iOS)", async () => {
    const informeId = await unInforme({
      actividades: [{ id: "a1", descripcion: "Visita sin incidencias." }],
      firmas: [FIRMA_COORDINADOR],
    });

    montar(informeId, new SharePortFalso(false));
    await screen.findByText("Informe listo");

    expect(screen.queryByRole("button", { name: "Compartir" })).not.toBeInTheDocument();
    // Descargar sigue estando siempre.
    expect(screen.getByRole("button", { name: "Descargar" })).toBeInTheDocument();
  });

  it("avisa si no se pudo compartir y se descargó en su lugar", async () => {
    const informeId = await unInforme({
      actividades: [{ id: "a1", descripcion: "Visita sin incidencias." }],
      firmas: [FIRMA_COORDINADOR],
    });

    montar(informeId, new SharePortFalso(true, { tipo: "descargado" }));
    await screen.findByText("Informe listo");
    fireEvent.click(screen.getByRole("button", { name: "Compartir" }));

    expect(await screen.findByText(/se ha descargado el archivo/i)).toBeInTheDocument();
  });

  it("muestra los destinatarios de la obra y avisa de que la app no envía correos", async () => {
    const informeId = await unInforme({
      actividades: [{ id: "a1", descripcion: "Visita sin incidencias." }],
      firmas: [FIRMA_COORDINADOR],
    });

    montar(informeId, new SharePortFalso());
    await screen.findByText("Informe listo");

    expect(screen.getByText("marta@canal.es")).toBeInTheDocument();
    expect(screen.getByText(/no envía correos/i)).toBeInTheDocument();
  });

  it("no genera el PDF si el coordinador no tiene perfil, y le lleva a rellenarlo", async () => {
    const informeId = await unInforme({
      actividades: [{ id: "a1", descripcion: "Visita sin incidencias." }],
      firmas: [FIRMA_COORDINADOR],
    });
    coordinadores.guardado = null;

    montar(informeId, new SharePortFalso());

    expect(await screen.findByText(/Rellena tu perfil/i)).toBeInTheDocument();
    // No basta con decirlo: tiene que haber salida (no un callejón sin salida).
    fireEvent.click(screen.getByRole("button", { name: /Ir a mi perfil/i }));
    expect(await screen.findByText("Pantalla de perfil")).toBeInTheDocument();
  });
});
