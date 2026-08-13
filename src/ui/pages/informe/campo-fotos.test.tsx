import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CampoFotos } from "@/ui/pages/informe/campo-fotos";
import { type Foto } from "@/domain/informe/informe";

// La compresión real usa canvas/Web Workers, que no van en jsdom. La mockeamos:
// devuelve una imagen fija, y probamos la LÓGICA (añadir/comentar/borrar).
vi.mock("@/ui/pages/informe/comprimir-foto", () => ({
  comprimirFoto: vi.fn().mockResolvedValue("data:image/jpeg;base64,COMPRIMIDA"),
}));

function Arnes({ inicial = [] }: { inicial?: Foto[] }) {
  const [fotos, setFotos] = useState<Foto[]>(inicial);
  return (
    <CampoFotos fotos={fotos} onChange={setFotos} idPrefijo="a1" numeroActividad={1} />
  );
}

const UNA_FOTO: Foto[] = [{ id: "f1", imagen: "data:image/png;base64,AAAA" }];

describe("CampoFotos", () => {
  it("añade una foto comprimida al elegir un archivo", async () => {
    render(<Arnes />);

    const archivo = new File(["contenido"], "obra.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText(/Seleccionar foto/i), {
      target: { files: [archivo] },
    });

    const imagen = await screen.findByAltText<HTMLImageElement>(/Foto 1 de la actividad 1/i);
    expect(imagen.src).toContain("COMPRIMIDA");
  });

  it("deja elegir foto de la galería, no solo hacerla con la cámara", () => {
    render(<Arnes />);

    // Con el atributo `capture` el móvil abre la cámara directamente y no da
    // acceso al carrete. El stakeholder pidió poder subir fotos ya hechas.
    expect(screen.getByLabelText(/Seleccionar foto/i)).not.toHaveAttribute("capture");
  });

  it("guarda el comentario que se escribe bajo una foto", () => {
    render(<Arnes inicial={UNA_FOTO} />);

    fireEvent.change(screen.getByLabelText(/Comentario de la foto 1/i), {
      target: { value: "Extintor y batefuego junto al grupo electrógeno." },
    });

    expect(screen.getByLabelText<HTMLTextAreaElement>(/Comentario de la foto 1/i).value).toBe(
      "Extintor y batefuego junto al grupo electrógeno.",
    );
  });

  it("el comentario de la foto es opcional: arranca vacío", () => {
    render(<Arnes inicial={UNA_FOTO} />);

    expect(screen.getByLabelText<HTMLTextAreaElement>(/Comentario de la foto 1/i).value).toBe("");
  });

  it("borra una foto de la lista", () => {
    render(<Arnes inicial={UNA_FOTO} />);

    expect(screen.getByAltText(/Foto 1 de la actividad 1/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Borrar foto 1/i }));
    expect(screen.queryByAltText(/Foto 1 de la actividad 1/i)).not.toBeInTheDocument();
  });
});
