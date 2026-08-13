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
  it("muestra solo dos ranuras: el coordinador y quien recibe", () => {
    render(<Arnes inicial={base} />);

    expect(screen.getByText("Firma del coordinador")).toBeInTheDocument();
    expect(screen.getByText("Recibido por (opcional)")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Nombre de quien firma/i)).toHaveLength(2);
  });

  it("avisa de que falta la firma del coordinador, la única obligatoria", () => {
    render(<Arnes inicial={base} />);

    const aviso = screen.getByText(/Faltan firmas obligatorias/i);
    expect(aviso).toHaveTextContent("el coordinador");
    expect(aviso).not.toHaveTextContent("quien recibe");
  });

  it("trae puesto el nombre del receptor escrito en el paso de datos", () => {
    render(<Arnes inicial={{ ...base, receptor: { nombre: "Luis Jefe" } }} />);

    expect(screen.getByDisplayValue("Luis Jefe")).toBeInTheDocument();
  });

  it("solo escribe en el informe las firmas completas (nombre + trazo)", () => {
    render(<Arnes inicial={base} />);

    // Aún no hay ninguna firma completa.
    expect(screen.getByTestId("num-firmas")).toHaveTextContent("0");

    // Firmamos sin nombre: sigue sin ser completa.
    fireEvent.click(screen.getAllByRole("button", { name: "firmar" })[0]);
    expect(screen.getByTestId("num-firmas")).toHaveTextContent("0");

    // Ponemos el nombre: ahora sí está completa y entra en el informe.
    fireEvent.change(screen.getAllByLabelText(/Nombre de quien firma/i)[0], {
      target: { value: "Ana Coordinadora" },
    });
    expect(screen.getByTestId("num-firmas")).toHaveTextContent("1");
  });

  it("recoge la firma de quien recibe sin perder la del coordinador", () => {
    render(
      <Arnes
        inicial={{
          ...base,
          firmas: [
            { nombre: "Ana Coordinadora", rol: "coordinador", firma: "data:image/png;base64,YA" },
          ],
        }}
      />,
    );

    expect(screen.getByTestId("num-firmas")).toHaveTextContent("1");

    // Firmamos ahora la de quien recibe (segunda ranura).
    fireEvent.change(screen.getAllByLabelText(/Nombre de quien firma/i)[1], {
      target: { value: "Luis Jefe" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "firmar" })[1]);

    expect(screen.getByTestId("num-firmas")).toHaveTextContent("2");
  });

  it("deja de avisar cuando la firma del coordinador está completa", () => {
    render(<Arnes inicial={base} />);

    fireEvent.change(screen.getAllByLabelText(/Nombre de quien firma/i)[0], {
      target: { value: "Ana Coordinadora" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "firmar" })[0]);

    expect(screen.queryByText(/Faltan firmas obligatorias/i)).not.toBeInTheDocument();
  });
});
