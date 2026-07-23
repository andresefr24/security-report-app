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

  it("añade una persona que atiende la visita y la deja editar", () => {
    render(<Arnes inicial={base} />);

    fireEvent.click(screen.getByRole("button", { name: /Añadir persona/i }));

    const nombre = screen.getByLabelText<HTMLInputElement>(/Nombre/i);
    fireEvent.change(nombre, { target: { value: "Luis Jefe" } });
    expect(nombre.value).toBe("Luis Jefe");
  });

  it("quita una persona de la lista", () => {
    render(<Arnes inicial={{ ...base, personasAtienden: [{ nombre: "Luis Jefe" }] }} />);

    expect(screen.getByDisplayValue("Luis Jefe")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Quitar persona/i }));
    expect(screen.queryByDisplayValue("Luis Jefe")).not.toBeInTheDocument();
  });
});
