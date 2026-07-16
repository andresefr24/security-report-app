import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PerfilPage } from "@/ui/pages/PerfilPage";
import { ConfigurarPerfil } from "@/application/use-cases/configurar-perfil";
import { type Coordinador } from "@/domain/coordinador/coordinador";
import { type CoordinadorRepository } from "@/domain/ports/coordinador-repository";

// El campo de firma usa <canvas>, que jsdom no dibuja. Lo sustituimos por un
// botón que, al pulsarlo, simula que el usuario ha firmado.
vi.mock("@/ui/components/campo-firma", () => ({
  CampoFirma: ({ onChange }: { onChange: (v: string | undefined) => void }) => (
    <button type="button" onClick={() => onChange("data:image/png;base64,FIRMA")}>
      firmar (test)
    </button>
  ),
}));

// Repositorio en memoria para no depender de localForage en este test de UI.
class CoordinadorRepositoryEnMemoria implements CoordinadorRepository {
  guardado: Coordinador | null = null;
  async guardar(coordinador: Coordinador): Promise<void> {
    this.guardado = coordinador;
  }
  async obtener(): Promise<Coordinador | null> {
    return this.guardado;
  }
}

describe("PerfilPage", () => {
  let repo: CoordinadorRepositoryEnMemoria;
  let configurarPerfil: ConfigurarPerfil;

  beforeEach(() => {
    repo = new CoordinadorRepositoryEnMemoria();
    configurarPerfil = new ConfigurarPerfil(repo);
  });

  it("muestra un error y no guarda si faltan los campos obligatorios", async () => {
    render(<PerfilPage configurarPerfil={configurarPerfil} />);
    // Esperamos a que el formulario aparezca (tras cargar el perfil).
    await screen.findByLabelText(/Nombre y apellidos/i);

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText(/IRSST.*obligatorio/i)).toBeInTheDocument();
    expect(repo.guardado).toBeNull();
  });

  it("guarda el perfil cuando se rellenan los datos y la firma", async () => {
    render(<PerfilPage configurarPerfil={configurarPerfil} />);
    await screen.findByLabelText(/Nombre y apellidos/i);

    fireEvent.change(screen.getByLabelText(/Nombre y apellidos/i), {
      target: { value: "Ana García López" },
    });
    fireEvent.change(screen.getByLabelText(/registro de la CAM/i), {
      target: { value: "3306" },
    });
    fireEvent.click(screen.getByText("firmar (test)"));

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText(/Guardado en el dispositivo/i)).toBeInTheDocument();
    expect(repo.guardado?.nombreCompleto).toBe("Ana García López");
    expect(repo.guardado?.numeroRegistroIrsst).toBe("3306");
    expect(repo.guardado?.firma).toBe("data:image/png;base64,FIRMA");
  });

  it("precarga los datos de un perfil ya guardado", async () => {
    await configurarPerfil.ejecutar({
      nombreCompleto: "Luis Pérez Ruiz",
      numeroRegistroIrsst: "4500",
      firma: "data:image/png;base64,PREVIA",
    });

    render(<PerfilPage configurarPerfil={configurarPerfil} />);

    const nombre = await screen.findByLabelText<HTMLInputElement>(/Nombre y apellidos/i);
    expect(nombre.value).toBe("Luis Pérez Ruiz");
  });
});
