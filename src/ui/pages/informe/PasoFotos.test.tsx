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

    const imagen = await screen.findByAltText<HTMLImageElement>("Foto de la visita");
    expect(imagen.src).toContain("COMPRIMIDA");
  });

  it("borra una foto de la rejilla", async () => {
    render(
      <Arnes
        inicial={{ ...base, fotos: [{ id: "f1", imagen: "data:image/png;base64,AAAA" }] }}
      />,
    );

    expect(screen.getByAltText("Foto de la visita")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Borrar" }));
    expect(screen.queryByAltText("Foto de la visita")).not.toBeInTheDocument();
  });
});
