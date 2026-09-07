import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasoFirmas } from "@/ui/pages/informe/PasoFirmas";
import { type DatosInforme } from "@/domain/informe/informe";

// El campo de firma usa <canvas> (no va en jsdom): lo sustituimos por un botón
// que simula el trazo. Cada caja tiene el suyo.
vi.mock("@/ui/components/campo-firma", () => ({
  CampoFirma: ({ onChange }: { onChange: (v: string | undefined) => void }) => (
    <button type="button" onClick={() => onChange("data:image/png;base64,TRAZO")}>
      firmar
    </button>
  ),
}));

vi.mock("@/ui/pages/informe/comprimir-foto", () => ({
  comprimirFoto: vi.fn().mockResolvedValue("data:image/jpeg;base64,FIRMAENFOTO"),
}));

function Arnes({ inicial }: { inicial: DatosInforme }) {
  const [informe, setInforme] = useState<DatosInforme>(inicial);
  return (
    <>
      <PasoFirmas
        informe={informe}
        actualizar={(parcial) => setInforme((actual) => ({ ...actual, ...parcial }))}
      />
      <p data-testid="firmas">
        {(informe.firmas ?? []).map((f) => `${f.rol}:${f.nombre ?? "-"}:${f.firma}`).join("|")}
      </p>
    </>
  );
}

const base: DatosInforme = { proyectoId: "obra-1" };

describe("PasoFirmas", () => {
  it("ofrece las dos cajas: la del coordinador y la de quien recibe", () => {
    render(<Arnes inicial={base} />);

    expect(screen.getByText("Firma del coordinador")).toBeInTheDocument();
    expect(screen.getByText("Recibido por (opcional)")).toBeInTheDocument();
  });

  it("avisa mientras falte la del coordinador, y solo esa", () => {
    render(<Arnes inicial={base} />);

    expect(screen.getByText(/Falta tu firma/i)).toBeInTheDocument();

    // Firmar la de "recibido" (la segunda) no quita el aviso.
    fireEvent.click(screen.getAllByRole("button", { name: "firmar" })[1]);
    expect(screen.getByText(/Falta tu firma/i)).toBeInTheDocument();

    // La del coordinador sí.
    fireEvent.click(screen.getAllByRole("button", { name: "firmar" })[0]);
    expect(screen.queryByText(/Falta tu firma/i)).not.toBeInTheDocument();
  });

  it("una firma vale sin nombre: lo que la hace existir es el trazo", () => {
    render(<Arnes inicial={base} />);

    fireEvent.click(screen.getAllByRole("button", { name: "firmar" })[0]);

    expect(screen.getByTestId("firmas")).toHaveTextContent(
      "coordinador:-:data:image/png;base64,TRAZO",
    );
  });

  it("el nombre solo se guarda si de verdad se escribe", () => {
    render(<Arnes inicial={base} />);

    fireEvent.change(screen.getAllByLabelText(/Nombre de quien firma/i)[0], {
      target: { value: "Ana Coordinadora" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "firmar" })[0]);

    expect(screen.getByTestId("firmas")).toHaveTextContent("coordinador:Ana Coordinadora:");
  });

  it("en la caja de recibido, el nombre solo YA cuenta: no se pierde", () => {
    // Pasó en obra: el encargado daba su nombre, no firmaba en el momento, y el
    // nombre desaparecía sin avisar. La caja salía vacía en el PDF.
    render(<Arnes inicial={base} />);

    fireEvent.change(screen.getAllByLabelText(/Nombre de quien firma/i)[1], {
      target: { value: "Luis Encargado" },
    });

    expect(screen.getByTestId("firmas")).toHaveTextContent("recibido:Luis Encargado:");
  });

  it("un nombre sin trazo en la del coordinador no cierra el informe", () => {
    // Se guarda (no se pierde nada), pero el aviso sigue: cerrar exige el trazo.
    render(<Arnes inicial={base} />);

    fireEvent.change(screen.getAllByLabelText(/Nombre de quien firma/i)[0], {
      target: { value: "Ana Coordinadora" },
    });

    expect(screen.getByText(/Falta tu firma/i)).toBeInTheDocument();
  });

  it("dice que con el nombre basta en la caja de quien recibe", () => {
    render(<Arnes inicial={base} />);

    expect(screen.getByText(/Con poner su nombre basta/i)).toBeInTheDocument();
  });

  it("acepta una foto de la firma en vez del trazo", async () => {
    render(<Arnes inicial={base} />);

    const archivo = new File(["x"], "firma.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText(/Subir foto de la firma de Firma del coordinador/i), {
      target: { files: [archivo] },
    });

    expect(await screen.findByAltText(/Firma de Firma del coordinador/i)).toBeInTheDocument();
    expect(screen.getByTestId("firmas")).toHaveTextContent("FIRMAENFOTO");
  });

  it("se puede quitar la foto para volver a firmar a mano", async () => {
    render(<Arnes inicial={base} />);

    const archivo = new File(["x"], "firma.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText(/Subir foto de la firma de Firma del coordinador/i), {
      target: { files: [archivo] },
    });
    await screen.findByAltText(/Firma de Firma del coordinador/i);

    fireEvent.click(screen.getByRole("button", { name: /Quitar la foto y firmar a mano/i }));

    expect(screen.queryByAltText(/Firma de Firma del coordinador/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "firmar" })).toHaveLength(2);
  });

  it("recoge las dos firmas a la vez", () => {
    render(<Arnes inicial={base} />);

    fireEvent.click(screen.getAllByRole("button", { name: "firmar" })[0]);
    fireEvent.change(screen.getAllByLabelText(/Nombre de quien firma/i)[1], {
      target: { value: "Luis Jefe" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "firmar" })[1]);

    const firmas = screen.getByTestId("firmas").textContent ?? "";
    expect(firmas).toContain("coordinador:");
    expect(firmas).toContain("recibido:Luis Jefe:");
  });

  it("trae puestas las firmas ya guardadas", () => {
    render(
      <Arnes
        inicial={{
          ...base,
          firmas: [
            { nombre: "Ana", rol: "coordinador", firma: "data:image/png;base64,YA" },
          ],
        }}
      />,
    );

    expect(screen.getByDisplayValue("Ana")).toBeInTheDocument();
    expect(screen.queryByText(/Falta tu firma/i)).not.toBeInTheDocument();
  });
});
