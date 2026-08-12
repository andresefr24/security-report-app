import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasoFotos } from "@/ui/pages/informe/PasoFotos";
import { type DatosInforme } from "@/domain/informe/informe";

// La compresión real usa canvas/Web Workers, que no van en jsdom. La mockeamos:
// devuelve una imagen fija, y probamos la LÓGICA (añadir/borrar del informe).
vi.mock("@/ui/pages/informe/comprimir-foto", () => ({
  comprimirFoto: vi.fn().mockResolvedValue("data:image/jpeg;base64,COMPRIMIDA"),
}));

function Arnes({ inicial }: { inicial: DatosInforme }) {
  const [informe, setInforme] = useState<DatosInforme>(inicial);
  return (
    <PasoFotos
      informe={informe}
      actualizar={(parcial) => setInforme((actual) => ({ ...actual, ...parcial }))}
    />
  );
}

const base: DatosInforme = { proyectoId: "obra-1" };

describe("PasoFotos", () => {
  it("muestra el estado vacío cuando no hay fotos", () => {
    render(<Arnes inicial={base} />);
    expect(screen.getByText(/Aún no has añadido fotos/i)).toBeInTheDocument();
  });

  it("añade una foto comprimida al elegir un archivo", async () => {
    render(<Arnes inicial={base} />);

    const archivo = new File(["contenido"], "obra.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("Seleccionar foto"), {
      target: { files: [archivo] },
    });

    const imagen = await screen.findByAltText<HTMLImageElement>("Foto 1 de la visita");
    expect(imagen.src).toContain("COMPRIMIDA");
  });

  it("deja elegir foto de la galería, no solo hacerla con la cámara", () => {
    render(<Arnes inicial={base} />);

    // Con el atributo `capture` el móvil abre la cámara directamente y no da
    // acceso al carrete. El stakeholder pidió poder subir fotos ya hechas.
    expect(screen.getByLabelText("Seleccionar foto")).not.toHaveAttribute("capture");
  });

  it("guarda el comentario que se escribe bajo una foto", () => {
    render(
      <Arnes inicial={{ ...base, fotos: [{ id: "f1", imagen: "data:image/png;base64,AAAA" }] }} />,
    );

    fireEvent.change(screen.getByLabelText(/Comentario de la foto 1/i), {
      target: { value: "Extintor y batefuego junto al grupo electrógeno." },
    });

    expect(screen.getByLabelText<HTMLTextAreaElement>(/Comentario de la foto 1/i).value).toBe(
      "Extintor y batefuego junto al grupo electrógeno.",
    );
  });

  it("el comentario de la foto es opcional: arranca vacío", () => {
    render(
      <Arnes inicial={{ ...base, fotos: [{ id: "f1", imagen: "data:image/png;base64,AAAA" }] }} />,
    );

    expect(screen.getByLabelText<HTMLTextAreaElement>(/Comentario de la foto 1/i).value).toBe("");
  });

  it("borra una foto de la lista", () => {
    render(
      <Arnes inicial={{ ...base, fotos: [{ id: "f1", imagen: "data:image/png;base64,AAAA" }] }} />,
    );

    expect(screen.getByAltText("Foto 1 de la visita")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Borrar foto 1" }));
    expect(screen.queryByAltText("Foto 1 de la visita")).not.toBeInTheDocument();
  });
});
