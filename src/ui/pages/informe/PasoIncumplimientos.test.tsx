import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasoIncumplimientos } from "@/ui/pages/informe/PasoIncumplimientos";
import { type DatosInforme } from "@/domain/informe/informe";

function Arnes({ inicial }: { inicial: DatosInforme }) {
  const [informe, setInforme] = useState<DatosInforme>(inicial);
  return (
    <PasoIncumplimientos
      informe={informe}
      actualizar={(parcial) => setInforme((actual) => ({ ...actual, ...parcial }))}
    />
  );
}

const base: DatosInforme = { proyectoId: "obra-1" };

describe("PasoIncumplimientos", () => {
  it("parte sin incumplimientos", () => {
    render(<Arnes inicial={base} />);
    expect(screen.getByText(/No has anotado incumplimientos/i)).toBeInTheDocument();
  });

  it("añade un incumplimiento y deja rellenar subcontrata y descripción", () => {
    render(<Arnes inicial={base} />);

    fireEvent.click(screen.getByRole("button", { name: /Añadir incumplimiento/i }));

    const subcontrata = screen.getByLabelText<HTMLInputElement>(/Subcontrata afectada/i);
    fireEvent.change(subcontrata, { target: { value: "Ferralla SL" } });
    expect(subcontrata.value).toBe("Ferralla SL");
  });

  it("quita un incumplimiento", () => {
    render(
      <Arnes
        inicial={{
          ...base,
          incumplimientos: [{ id: "i1", subcontrata: "Ferralla SL", descripcion: "Sin arnés." }],
        }}
      />,
    );

    expect(screen.getByDisplayValue("Ferralla SL")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Quitar incumplimiento/i }));
    expect(screen.queryByDisplayValue("Ferralla SL")).not.toBeInTheDocument();
  });
});
