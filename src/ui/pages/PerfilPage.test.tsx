import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PerfilPage } from "@/ui/pages/PerfilPage";
import { ConfigurarPerfil } from "@/application/use-cases/configurar-perfil";
import { CoordinadorRepositoryEnMemoria } from "@/test/fakes";

// El campo de firma usa <canvas>, que jsdom no dibuja. Lo sustituimos por un
// botón que, al pulsarlo, simula que el usuario ha firmado.
vi.mock("@/ui/components/campo-firma", () => ({
  CampoFirma: ({ onChange }: { onChange: (v: string | undefined) => void }) => (
    <button type="button" onClick={() => onChange("data:image/png;base64,FIRMA")}>
      firmar (test)
    </button>
  ),
}));

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

  it("guarda el texto de la cabecera del informe", async () => {
    // Es lo que va arriba a la derecha del documento, donde antes estaban los
    // códigos de calidad que no les decían nada.
    render(<PerfilPage configurarPerfil={configurarPerfil} />);
    await screen.findByLabelText(/Nombre y apellidos/i);

    fireEvent.change(screen.getByLabelText(/Nombre y apellidos/i), {
      target: { value: "Ana García López" },
    });
    fireEvent.change(screen.getByLabelText(/registro de la CAM/i), {
      target: { value: "3306" },
    });
    fireEvent.change(screen.getByLabelText(/Texto de la cabecera/i), {
      target: { value: "ING. CSS TPF Getinsa Euroestudios" },
    });
    fireEvent.click(screen.getByText("firmar (test)"));
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText(/Guardado en el dispositivo/i)).toBeInTheDocument();
    expect(repo.guardado?.textoCabecera).toBe("ING. CSS TPF Getinsa Euroestudios");
  });

  it("ofrece subir un logotipo para esa misma esquina", async () => {
    render(<PerfilPage configurarPerfil={configurarPerfil} />);
    await screen.findByLabelText(/Nombre y apellidos/i);

    expect(screen.getByRole("button", { name: /Añadir logotipo/i })).toBeInTheDocument();
    expect(
      screen.getByText(/en el recuadro que antes llevaba los códigos/i),
    ).toBeInTheDocument();
  });

  it("trae puesto el logotipo de un perfil ya guardado", async () => {
    await configurarPerfil.ejecutar({
      nombreCompleto: "Luis Pérez Ruiz",
      numeroRegistroIrsst: "4500",
      firma: "data:image/png;base64,PREVIA",
      logo: "data:image/png;base64,LOGO",
    });

    render(<PerfilPage configurarPerfil={configurarPerfil} />);

    const imagen = await screen.findByAltText<HTMLImageElement>("Tu logotipo");
    expect(imagen.src).toContain("LOGO");
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
