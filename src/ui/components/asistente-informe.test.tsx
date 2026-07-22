import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AsistenteInforme, type PasoWizard } from "@/ui/components/asistente-informe";
import { GuardarInforme } from "@/application/use-cases/guardar-informe";
import { ObtenerInforme } from "@/application/use-cases/obtener-informe";
import { crearBorrador } from "@/domain/informe/informe";
import { InformeRepositoryEnMemoria } from "@/test/fakes";

// Dos pasos de prueba: el primero escribe en `contenido`, el segundo es estático.
const pasos: PasoWizard[] = [
  {
    titulo: "Contenido",
    contenido: ({ informe, actualizar }) => (
      <input
        aria-label="contenido"
        value={informe.contenido ?? ""}
        onChange={(e) => actualizar({ contenido: e.target.value })}
      />
    ),
  },
  {
    titulo: "Revisión",
    contenido: () => <p>Último paso</p>,
  },
];

describe("AsistenteInforme", () => {
  let informes: InformeRepositoryEnMemoria;
  let idInforme: string;
  let alFinalizar: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    informes = new InformeRepositoryEnMemoria();
    const borrador = crearBorrador({ proyectoId: "obra-1" });
    if (!borrador.ok) throw new Error("el borrador debería crearse");
    idInforme = borrador.valor.id;
    await informes.guardar(borrador.valor);
    alFinalizar = vi.fn();
  });

  function montar() {
    return render(
      <AsistenteInforme
        informeId={idInforme}
        pasos={pasos}
        obtenerInforme={new ObtenerInforme(informes)}
        guardarInforme={new GuardarInforme(informes)}
        alFinalizar={alFinalizar}
      />,
    );
  }

  it("carga el borrador y muestra el primer paso con su progreso", async () => {
    montar();

    expect(await screen.findByText("Paso 1 de 2")).toBeInTheDocument();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("autoguarda y avanza al pulsar Siguiente", async () => {
    montar();
    await screen.findByLabelText("contenido");

    fireEvent.change(screen.getByLabelText("contenido"), {
      target: { value: "Visita sin incidencias." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

    expect(await screen.findByText("Paso 2 de 2")).toBeInTheDocument();
    // Se guardó de verdad en el repositorio.
    expect(informes.guardados.get(idInforme)?.contenido).toBe("Visita sin incidencias.");
  });

  it("llama a alFinalizar en el último paso", async () => {
    montar();
    await screen.findByLabelText("contenido");

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    await screen.findByText("Paso 2 de 2");
    fireEvent.click(screen.getByRole("button", { name: "Finalizar" }));

    expect(await screen.findByText("Último paso")).toBeInTheDocument();
    // (esperamos al guardado async antes de comprobar la navegación)
    await vi.waitFor(() => expect(alFinalizar).toHaveBeenCalledOnce());
  });

  it("muestra la banda de sin conexión cuando se pierde la red", async () => {
    montar();
    await screen.findByLabelText("contenido");

    act(() => {
      Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
      window.dispatchEvent(new Event("offline"));
    });

    expect(await screen.findByText(/Sin conexión/i)).toBeInTheDocument();

    // Restauramos para no afectar a otros tests.
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
  });
});
