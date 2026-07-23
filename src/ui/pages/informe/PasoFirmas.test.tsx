import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasoFirmas } from "@/ui/pages/informe/PasoFirmas";
import { type DatosInforme } from "@/domain/informe/informe";

// El campo de firma usa <canvas> (no va en jsdom). Lo sustituimos por un botón
// que simula firmar, con un texto que identifica a su ranura por el aria-label.
vi.mock("@/ui/components/campo-firma", () => ({
  CampoFirma: ({ onChange }: { onChange: (v: string | undefined) => void }) => (
    <button type="button" onClick={() => onChange("data:image/png;base64,FIRMA")}>
      firmar
    </button>
  ),
}));

function Arnes({ inicial }: { inicial: DatosInforme }) {
  const [informe, setInforme] = useState<DatosInforme>(inicial);
  return (
    <>
      <PasoFirmas
        informe={informe}
        actualizar={(parcial) => setInforme((actual) => ({ ...actual, ...parcial }))}
      />
      <p data-testid="num-firmas">{informe.firmas?.length ?? 0}</p>
    </>
  );
}

const base: DatosInforme = { proyectoId: "obra-1" };

describe("PasoFirmas", () => {
  it("siempre muestra la ranura del coordinador y avisa de que falta su firma", () => {
    render(<Arnes inicial={base} />);

    expect(screen.getByText("Firma del coordinador")).toBeInTheDocument();
    expect(screen.getByText(/Faltan firmas obligatorias/i)).toBeInTheDocument();
  });

  it("muestra una ranura por cada subcontrata con incumplimiento", () => {
    render(
      <Arnes
        inicial={{
          ...base,
          incumplimientos: [{ id: "i1", subcontrata: "Ferralla SL", descripcion: "Sin arnés." }],
        }}
      />,
    );

    expect(screen.getByText("Firma de la subcontrata Ferralla SL")).toBeInTheDocument();
  });

  it("muestra una ranura por cada persona que atiende la visita", () => {
    render(<Arnes inicial={{ ...base, personasAtienden: [{ nombre: "Luis Jefe" }] }} />);

    expect(screen.getByText(/Firma de Luis Jefe \(atiende la visita\)/i)).toBeInTheDocument();
  });

  it("solo escribe en el informe las firmas completas (nombre + trazo)", () => {
    render(<Arnes inicial={base} />);

    // Aún no hay ninguna firma completa.
    expect(screen.getByTestId("num-firmas")).toHaveTextContent("0");

    // Firmamos sin nombre: sigue sin ser completa.
    fireEvent.click(screen.getByRole("button", { name: "firmar" }));
    expect(screen.getByTestId("num-firmas")).toHaveTextContent("0");

    // Ponemos el nombre: ahora sí está completa y entra en el informe.
    fireEvent.change(screen.getByLabelText(/Nombre de quien firma/i), {
      target: { value: "Ana Coordinadora" },
    });
    expect(screen.getByTestId("num-firmas")).toHaveTextContent("1");
  });

  it("da una ranura separada a dos personas que se llaman igual", () => {
    render(
      <Arnes
        inicial={{
          ...base,
          personasAtienden: [
            { id: "p1", nombre: "Juan" },
            { id: "p2", nombre: "Juan" },
          ],
        }}
      />,
    );

    // Dos ranuras "Firma de Juan", no una compartida.
    expect(screen.getAllByText(/Firma de Juan \(atiende la visita\)/i)).toHaveLength(2);
  });

  it("conserva la firma de una subcontrata aunque se firme otra cosa después (anclada por id)", () => {
    render(
      <Arnes
        inicial={{
          ...base,
          incumplimientos: [{ id: "i1", subcontrata: "Ferralla SL", descripcion: "Sin arnés." }],
          firmas: [
            {
              nombre: "Rep. Ferralla",
              rol: "subcontrata",
              subcontrata: "Ferralla SL",
              refId: "i1",
              firma: "data:image/png;base64,YA",
            },
          ],
        }}
      />,
    );

    // Ya hay una firma (la de la subcontrata).
    expect(screen.getByTestId("num-firmas")).toHaveTextContent("1");

    // Firmamos ahora la del coordinador (primera ranura): la de la subcontrata
    // NO debe perderse.
    fireEvent.change(screen.getAllByLabelText(/Nombre de quien firma/i)[0], {
      target: { value: "Ana Coordinadora" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "firmar" })[0]);

    expect(screen.getByTestId("num-firmas")).toHaveTextContent("2");
  });

  it("deja de avisar cuando la firma obligatoria está completa", () => {
    render(<Arnes inicial={base} />);

    fireEvent.change(screen.getByLabelText(/Nombre de quien firma/i), {
      target: { value: "Ana Coordinadora" },
    });
    fireEvent.click(screen.getByRole("button", { name: "firmar" }));

    expect(screen.queryByText(/Faltan firmas obligatorias/i)).not.toBeInTheDocument();
  });
});
