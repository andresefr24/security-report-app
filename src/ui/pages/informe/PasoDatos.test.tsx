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

  it("recoge quién recibe el informe: nombre y empresa", () => {
    render(<Arnes inicial={base} />);

    const nombre = screen.getByLabelText<HTMLInputElement>(/^Nombre$/i);
    fireEvent.change(nombre, { target: { value: "Luis Jefe" } });
    expect(nombre.value).toBe("Luis Jefe");

    const empresa = screen.getByLabelText<HTMLInputElement>(/Empresa o entidad/i);
    fireEvent.change(empresa, { target: { value: "Constructora SL" } });
    expect(empresa.value).toBe("Constructora SL");
  });

  it("muestra el receptor ya guardado", () => {
    render(
      <Arnes
        inicial={{ ...base, receptor: { nombre: "Luis Jefe", empresa: "Constructora SL" } }}
      />,
    );

    expect(screen.getByDisplayValue("Luis Jefe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Constructora SL")).toBeInTheDocument();
  });

  it("deja el receptor en blanco: nunca es obligatorio", () => {
    render(<Arnes inicial={base} />);

    expect(screen.getByLabelText<HTMLInputElement>(/^Nombre$/i).value).toBe("");
  });
});
