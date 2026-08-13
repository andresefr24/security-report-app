import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasoActividades } from "@/ui/pages/informe/PasoActividades";
import { type DatosInforme } from "@/domain/informe/informe";

vi.mock("@/ui/pages/informe/comprimir-foto", () => ({
  comprimirFoto: vi.fn().mockResolvedValue("data:image/jpeg;base64,COMPRIMIDA"),
}));

function Arnes({ inicial }: { inicial: DatosInforme }) {
  const [informe, setInforme] = useState<DatosInforme>(inicial);
  return (
    <PasoActividades
      informe={informe}
      actualizar={(parcial) => setInforme((actual) => ({ ...actual, ...parcial }))}
    />
  );
}

const base: DatosInforme = { proyectoId: "obra-1" };

describe("PasoActividades", () => {
  it("arranca sin actividades y lo dice", () => {
    render(<Arnes inicial={base} />);

    expect(screen.getByText(/Aún no has añadido actividades/i)).toBeInTheDocument();
  });

  it("añade una actividad y recoge dónde y qué pasó", () => {
    render(<Arnes inicial={base} />);

    fireEvent.click(screen.getByRole("button", { name: "Añadir actividad" }));

    fireEvent.change(screen.getByLabelText(/Dónde/i), {
      target: { value: "(M-103) PK 03+500" },
    });
    fireEvent.change(screen.getByLabelText(/Qué pasó/i), {
      target: { value: "Colocación de chapa metálica." },
    });

    expect(screen.getByLabelText<HTMLInputElement>(/Dónde/i).value).toBe("(M-103) PK 03+500");
    expect(screen.getByLabelText<HTMLTextAreaElement>(/Qué pasó/i).value).toBe(
      "Colocación de chapa metálica.",
    );
  });

  it("añade varias actividades, que es la gracia del modelo nuevo", () => {
    render(<Arnes inicial={base} />);

    fireEvent.click(screen.getByRole("button", { name: "Añadir actividad" }));
    fireEvent.click(screen.getByRole("button", { name: "Añadir actividad" }));

    expect(screen.getByText("Actividad 1")).toBeInTheDocument();
    expect(screen.getByText("Actividad 2")).toBeInTheDocument();
  });

  it("quita la actividad que se indica y deja las demás", () => {
    render(
      <Arnes
        inicial={{
          ...base,
          actividades: [
            { id: "a1", descripcion: "Desbroce mecánico." },
            { id: "a2", descripcion: "Limpieza de calzada." },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Quitar actividad 1" }));

    expect(screen.queryByDisplayValue("Desbroce mecánico.")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Limpieza de calzada.")).toBeInTheDocument();
  });

  it("cada actividad tiene sus propias fotos", async () => {
    render(
      <Arnes
        inicial={{
          ...base,
          actividades: [
            { id: "a1", descripcion: "Desbroce." },
            { id: "a2", descripcion: "Limpieza." },
          ],
        }}
      />,
    );

    const archivo = new File(["contenido"], "obra.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("Seleccionar foto de la actividad 2"), {
      target: { files: [archivo] },
    });

    // La foto entra en la actividad 2 y la 1 se queda sin fotos.
    expect(await screen.findByAltText("Foto 1 de la actividad 2")).toBeInTheDocument();
    expect(screen.queryByAltText("Foto 1 de la actividad 1")).not.toBeInTheDocument();
  });

  it("guarda el resumen de la semana y la situación, ambos opcionales", () => {
    render(<Arnes inicial={base} />);

    fireEvent.change(screen.getByLabelText(/Calendario de la semana/i), {
      target: { value: "Semana del 3 al 7 de agosto." },
    });
    fireEvent.change(screen.getByLabelText(/Situación general de la obra/i), {
      target: { value: "La obra avanza según programación." },
    });

    expect(screen.getByDisplayValue("Semana del 3 al 7 de agosto.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("La obra avanza según programación.")).toBeInTheDocument();
  });
});
