import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasoDatos } from "@/ui/pages/informe/PasoDatos";
import { type DatosInforme } from "@/domain/informe/informe";

// El paso es un componente controlado: quien lo usa (el wizard) guarda el estado.
// Este arnés replica eso para poder probar las interacciones de verdad.
function Arnes({ inicial }: { inicial: DatosInforme }) {
  const [informe, setInforme] = useState<DatosInforme>(inicial);
  return (
    <PasoDatos
      informe={informe}
      actualizar={(parcial) => setInforme((actual) => ({ ...actual, ...parcial }))}
    />
  );
}

const base: DatosInforme = { proyectoId: "obra-1", fechaHora: "2026-07-01T09:30" };

describe("PasoDatos", () => {
  it("muestra la fecha/hora del borrador y permite corregirla", () => {
    render(<Arnes inicial={base} />);

    const fecha = screen.getByLabelText<HTMLInputElement>(/Fecha y hora/i);
    expect(fecha.value).toBe("2026-07-01T09:30");

    fireEvent.change(fecha, { target: { value: "2026-07-02T10:00" } });
    expect(fecha.value).toBe("2026-07-02T10:00");
  });

  it("ya no pide quién recibe el informe: eso se recoge al firmar", () => {
    render(<Arnes inicial={base} />);

    expect(screen.queryByLabelText(/^Nombre$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Empresa o entidad/i)).not.toBeInTheDocument();
  });
});
