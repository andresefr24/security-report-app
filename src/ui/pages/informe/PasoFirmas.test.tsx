import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasoFirmas } from "@/ui/pages/informe/PasoFirmas";
import { type DatosInforme } from "@/domain/informe/informe";

// El campo de firma usa <canvas> (no va en jsdom). Lo sustituimos por un botón
// que simula firmar.
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
  it("solo pide la firma del coordinador", () => {
    render(<Arnes inicial={base} />);

    expect(screen.getByText("Firma del coordinador")).toBeInTheDocument();
    // "Recibido por" se quitó: nadie firmaba ahí y su hueco salía vacío en el PDF.
    expect(screen.queryByText(/Recibido por/i)).not.toBeInTheDocument();
    expect(screen.getAllByLabelText(/Nombre de quien firma/i)).toHaveLength(1);
  });

  it("avisa mientras falte la firma", () => {
    render(<Arnes inicial={base} />);

    expect(screen.getByText(/Falta tu firma/i)).toBeInTheDocument();
  });

  it("solo escribe en el informe la firma completa (nombre + trazo)", () => {
    render(<Arnes inicial={base} />);
    expect(screen.getByTestId("num-firmas")).toHaveTextContent("0");

    // Firmamos sin nombre: aún no está completa.
    fireEvent.click(screen.getByRole("button", { name: "firmar" }));
    expect(screen.getByTestId("num-firmas")).toHaveTextContent("0");

    // Con el nombre ya entra en el informe.
    fireEvent.change(screen.getByLabelText(/Nombre de quien firma/i), {
      target: { value: "Ana Coordinadora" },
    });
    expect(screen.getByTestId("num-firmas")).toHaveTextContent("1");
  });

  it("trae puesta la firma que ya estaba guardada", () => {
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

    expect(screen.getByDisplayValue("Ana Coordinadora")).toBeInTheDocument();
    expect(screen.queryByText(/Falta tu firma/i)).not.toBeInTheDocument();
  });

  it("deja de avisar cuando la firma está completa", () => {
    render(<Arnes inicial={base} />);

    fireEvent.change(screen.getByLabelText(/Nombre de quien firma/i), {
      target: { value: "Ana Coordinadora" },
    });
    fireEvent.click(screen.getByRole("button", { name: "firmar" }));

    expect(screen.queryByText(/Falta tu firma/i)).not.toBeInTheDocument();
  });
});
