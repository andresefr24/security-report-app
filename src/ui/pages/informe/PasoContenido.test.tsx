import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasoContenido } from "@/ui/pages/informe/PasoContenido";
import { type DatosInforme } from "@/domain/informe/informe";

function Arnes({ inicial }: { inicial: DatosInforme }) {
  const [informe, setInforme] = useState<DatosInforme>(inicial);
  return (
    <PasoContenido
      informe={informe}
      actualizar={(parcial) => setInforme((actual) => ({ ...actual, ...parcial }))}
    />
  );
}

const base: DatosInforme = { proyectoId: "obra-1" };

describe("PasoContenido", () => {
  it("muestra el contenido ya escrito y permite editarlo", () => {
    render(<Arnes inicial={{ ...base, contenido: "Texto previo" }} />);

    const area = screen.getByLabelText<HTMLTextAreaElement>(/Contenido del informe/i);
    expect(area.value).toBe("Texto previo");

    fireEvent.change(area, { target: { value: "Visita sin incidencias." } });
    expect(area.value).toBe("Visita sin incidencias.");
  });

  it("parte vacío si el borrador aún no tiene contenido", () => {
    render(<Arnes inicial={base} />);
    expect(screen.getByLabelText<HTMLTextAreaElement>(/Contenido del informe/i).value).toBe("");
  });
});
