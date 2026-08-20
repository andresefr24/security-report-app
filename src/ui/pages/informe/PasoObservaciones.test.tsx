import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasoObservaciones, numerar } from "@/ui/pages/informe/PasoObservaciones";
import { type DatosInforme } from "@/domain/informe/informe";

vi.mock("@/ui/pages/informe/comprimir-foto", () => ({
  comprimirFoto: vi.fn().mockResolvedValue("data:image/jpeg;base64,COMPRIMIDA"),
}));

function Arnes({ inicial }: { inicial: DatosInforme }) {
  const [informe, setInforme] = useState<DatosInforme>(inicial);
  return (
    <>
      <PasoObservaciones
        informe={informe}
        actualizar={(parcial) => setInforme((actual) => ({ ...actual, ...parcial }))}
      />
      <p data-testid="estado-1">{informe.observaciones?.[0]?.estado ?? "sin estado"}</p>
    </>
  );
}

const base: DatosInforme = { proyectoId: "obra-1" };

describe("PasoObservaciones", () => {
  it("arranca sin observaciones y lo dice", () => {
    render(<Arnes inicial={base} />);

    expect(screen.getByText(/Aún no has añadido observaciones/i)).toBeInTheDocument();
  });

  it("añade una observación y recoge su título, dónde y la explicación", () => {
    render(<Arnes inicial={base} />);

    fireEvent.click(screen.getByRole("button", { name: "Añadir observación" }));

    fireEvent.change(screen.getByLabelText(/^Título$/i), {
      target: { value: "Grupo electrógeno sin medios de extinción" },
    });
    fireEvent.change(screen.getByLabelText(/Dónde/i), {
      target: { value: "Junto a las casetas" },
    });
    fireEvent.change(screen.getByLabelText(/Explicación/i), {
      target: { value: "Se requiere la instalación de extintores." },
    });

    expect(screen.getByDisplayValue("Grupo electrógeno sin medios de extinción")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Junto a las casetas")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Se requiere la instalación de extintores.")).toBeInTheDocument();
  });

  it("ofrece exactamente los tres estados, ni uno más", () => {
    render(<Arnes inicial={{ ...base, observaciones: [{ id: "o1" }] }} />);

    expect(screen.getByRole("button", { name: "MEDIDA REQUERIDA" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OBSERVACIÓN PREVENTIVA" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SUBSANADO" })).toBeInTheDocument();
  });

  it("marca el estado al pulsar su botón, sin teclear nada", () => {
    render(<Arnes inicial={{ ...base, observaciones: [{ id: "o1" }] }} />);
    expect(screen.getByTestId("estado-1")).toHaveTextContent("sin estado");

    fireEvent.click(screen.getByRole("button", { name: "SUBSANADO" }));

    expect(screen.getByTestId("estado-1")).toHaveTextContent("subsanado");
    expect(screen.getByRole("button", { name: "SUBSANADO" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("volver a pulsar el estado elegido lo quita: el estado es opcional", () => {
    render(<Arnes inicial={{ ...base, observaciones: [{ id: "o1", estado: "subsanado" }] }} />);

    fireEvent.click(screen.getByRole("button", { name: "SUBSANADO" }));

    expect(screen.getByTestId("estado-1")).toHaveTextContent("sin estado");
  });

  it("cambiar de estado sustituye al anterior, no los suma", () => {
    render(<Arnes inicial={{ ...base, observaciones: [{ id: "o1", estado: "subsanado" }] }} />);

    fireEvent.click(screen.getByRole("button", { name: "MEDIDA REQUERIDA" }));

    expect(screen.getByTestId("estado-1")).toHaveTextContent("medida-requerida");
    expect(screen.getByRole("button", { name: "SUBSANADO" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("añade varias observaciones, que es la gracia del modelo", () => {
    render(<Arnes inicial={base} />);

    fireEvent.click(screen.getByRole("button", { name: "Añadir observación" }));
    fireEvent.click(screen.getByRole("button", { name: "Añadir observación" }));

    expect(screen.getByText("Observación 1")).toBeInTheDocument();
    expect(screen.getByText("Observación 2")).toBeInTheDocument();
  });

  it("quita la observación que se indica y deja las demás", () => {
    render(
      <Arnes
        inicial={{
          ...base,
          observaciones: [
            { id: "o1", titulo: "Desbroce mecánico." },
            { id: "o2", titulo: "Limpieza de calzada." },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Quitar observación 1" }));

    expect(screen.queryByDisplayValue("Desbroce mecánico.")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Limpieza de calzada.")).toBeInTheDocument();
  });

  it("cada observación tiene sus propias fotos", async () => {
    render(
      <Arnes
        inicial={{
          ...base,
          observaciones: [
            { id: "o1", titulo: "Desbroce." },
            { id: "o2", titulo: "Limpieza." },
          ],
        }}
      />,
    );

    const archivo = new File(["contenido"], "obra.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("Seleccionar foto de la actividad 2"), {
      target: { files: [archivo] },
    });

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
  it("enlaza una observación con la anterior y le hereda el título", () => {
    render(
      <Arnes
        inicial={{
          ...base,
          observaciones: [
            { id: "o1", titulo: "Grupo electrógeno sin extintores", estado: "medida-requerida" },
            { id: "o2" },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Es continuación de la anterior/i }));

    // Las dos son la observación 1: el hallazgo y cómo quedó.
    expect(screen.getAllByText(/^Observación 1/)).toHaveLength(2);
    // Y no hay que reescribir el título.
    expect(screen.getAllByDisplayValue("Grupo electrógeno sin extintores")).toHaveLength(2);
  });

  it("la primera observación no ofrece enlazarse: no hay ninguna encima", () => {
    render(<Arnes inicial={{ ...base, observaciones: [{ id: "o1" }] }} />);

    expect(
      screen.queryByRole("button", { name: /Es continuación de la anterior/i }),
    ).not.toBeInTheDocument();
  });
});

describe("numerar", () => {
  it("numera de una en una cuando ninguna continúa a otra", () => {
    expect(numerar([{}, {}, {}])).toEqual([1, 2, 3]);
  });

  it("una continuación repite el número de la de arriba", () => {
    expect(numerar([{}, { continuaAnterior: true }, {}])).toEqual([1, 1, 2]);
  });

  it("varias seguidas comparten el mismo número", () => {
    expect(
      numerar([{}, { continuaAnterior: true }, { continuaAnterior: true }, {}]),
    ).toEqual([1, 1, 1, 2]);
  });

  it("la primera no puede continuar a nadie, aunque venga marcada", () => {
    expect(numerar([{ continuaAnterior: true }, {}])).toEqual([1, 2]);
  });
});
