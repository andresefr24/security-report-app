import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasoObservaciones, numerar } from "@/ui/pages/informe/PasoObservaciones";
import { ObservacionesPendientes } from "@/application/use-cases/observaciones-pendientes";
import { crearInforme, type DatosInforme } from "@/domain/informe/informe";
import { InformeRepositoryEnMemoria } from "@/test/fakes";

vi.mock("@/ui/pages/informe/comprimir-foto", () => ({
  comprimirFoto: vi.fn().mockResolvedValue("data:image/jpeg;base64,COMPRIMIDA"),
}));

function Arnes({
  inicial,
  informes = new InformeRepositoryEnMemoria(),
}: {
  inicial: DatosInforme;
  informes?: InformeRepositoryEnMemoria;
}) {
  const [informe, setInforme] = useState<DatosInforme>(inicial);
  // El caso de uso se crea UNA vez, como en la app de verdad (lo monta el
  // composition root). Creándolo en cada render, el efecto que consulta los
  // pendientes se dispararía otra vez con cada tecla.
  const [pendientes] = useState(() => new ObservacionesPendientes(informes));
  return (
    <>
      <PasoObservaciones
        informe={informe}
        actualizar={(parcial) => setInforme((actual) => ({ ...actual, ...parcial }))}
        observacionesPendientes={pendientes}
      />
      <p data-testid="estado-1">{informe.observaciones?.[0]?.estado ?? "sin estado"}</p>
      <p data-testid="observaciones">
        {(informe.observaciones ?? [])
          .map((o) => `${o.titulo ?? "-"}|${o.vieneDe?.fecha ?? "sin origen"}|${o.fotos?.length ?? 0}`)
          .join("//")}
      </p>
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

    expect(screen.getByRole("button", { name: "Medida requerida" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Observación Preventiva de Seguridad (OPS)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Subsanado" })).toBeInTheDocument();
  });

  it("marca el estado al pulsar su botón, sin teclear nada", () => {
    render(<Arnes inicial={{ ...base, observaciones: [{ id: "o1" }] }} />);
    expect(screen.getByTestId("estado-1")).toHaveTextContent("sin estado");

    fireEvent.click(screen.getByRole("button", { name: "Subsanado" }));

    expect(screen.getByTestId("estado-1")).toHaveTextContent("subsanado");
    expect(screen.getByRole("button", { name: "Subsanado" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("volver a pulsar el estado elegido lo quita: el estado es opcional", () => {
    render(<Arnes inicial={{ ...base, observaciones: [{ id: "o1", estado: "subsanado" }] }} />);

    fireEvent.click(screen.getByRole("button", { name: "Subsanado" }));

    expect(screen.getByTestId("estado-1")).toHaveTextContent("sin estado");
  });

  it("cambiar de estado sustituye al anterior, no los suma", () => {
    render(<Arnes inicial={{ ...base, observaciones: [{ id: "o1", estado: "subsanado" }] }} />);

    fireEvent.click(screen.getByRole("button", { name: "Medida requerida" }));

    expect(screen.getByTestId("estado-1")).toHaveTextContent("medida-requerida");
    expect(screen.getByRole("button", { name: "Subsanado" })).toHaveAttribute(
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

describe("PasoObservaciones · lo que quedó pendiente", () => {
  /** Una obra con un informe cerrado que dejó cosas abiertas. */
  async function conVisitaAnterior() {
    const informes = new InformeRepositoryEnMemoria();
    const anterior = crearInforme({
      proyectoId: "obra-1",
      estado: "finalizado",
      fechaHora: "2026-08-17T09:00",
      observaciones: [
        {
          id: "o1",
          titulo: "Acopio junto al borde del talud",
          ubicacion: "Estribo 1",
          estado: "medida-requerida",
          fotos: [{ id: "f1", imagen: "data:image/png;base64,FOTOVIEJA" }],
        },
        { id: "o2", titulo: "Viga a baja altura", estado: "observacion-preventiva" },
        { id: "o3", titulo: "Rodapié repuesto", estado: "subsanado" },
      ],
    });
    if (!anterior.ok) throw new Error("el informe anterior debería ser válido");
    await informes.guardar(anterior.valor);
    return informes;
  }

  it("no enseña nada si la obra no tiene visitas anteriores", async () => {
    render(<Arnes inicial={base} />);

    await screen.findByText(/Aún no has añadido observaciones/i);
    expect(screen.queryByText(/sin resolver/i)).not.toBeInTheDocument();
  });

  it("ofrece lo que quedó abierto, con la fecha en que se señaló", async () => {
    render(<Arnes inicial={base} informes={await conVisitaAnterior()} />);

    expect(await screen.findByText(/Quedaron 2 observaciones sin resolver/i)).toBeInTheDocument();
    expect(screen.getByText("Acopio junto al borde del talud")).toBeInTheDocument();
    expect(screen.getAllByText(/Señalada el 17\/08\/2026/)).toHaveLength(2);
    // Lo subsanado no se ofrece: está cerrado.
    expect(screen.queryByText("Rodapié repuesto")).not.toBeInTheDocument();
  });

  it("no trae nada mientras no se señale ninguna", async () => {
    render(<Arnes inicial={base} informes={await conVisitaAnterior()} />);
    await screen.findByText(/sin resolver/i);

    const boton = screen.getByRole("button", { name: /Señala las que sigan pendientes/i });

    expect(boton).toBeDisabled();
    expect(screen.getByTestId("observaciones")).toHaveTextContent("");
  });

  it("la trae con su origen y SIN las fotos del otro día", async () => {
    render(<Arnes inicial={base} informes={await conVisitaAnterior()} />);
    await screen.findByText(/sin resolver/i);

    fireEvent.click(screen.getByRole("button", { name: /Acopio junto al borde del talud/i }));
    fireEvent.click(screen.getByRole("button", { name: /Traer 1 observación/i }));

    // Conserva el título y de cuándo viene; las fotos se quedan en su informe.
    expect(screen.getByTestId("observaciones")).toHaveTextContent(
      "Acopio junto al borde del talud|2026-08-17T09:00|0",
    );
  });

  it("una vez traída desaparece de la lista, para no duplicarla", async () => {
    render(<Arnes inicial={base} informes={await conVisitaAnterior()} />);
    await screen.findByText(/Quedaron 2 observaciones/i);

    fireEvent.click(screen.getByRole("button", { name: /Viga a baja altura/i }));
    fireEvent.click(screen.getByRole("button", { name: /Traer 1 observación/i }));

    expect(await screen.findByText(/Quedó 1 observación sin resolver/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Viga a baja altura/i })).not.toBeInTheDocument();
  });

  it("se pueden traer varias de una vez", async () => {
    render(<Arnes inicial={base} informes={await conVisitaAnterior()} />);
    await screen.findByText(/sin resolver/i);

    fireEvent.click(screen.getByRole("button", { name: /Acopio junto al borde del talud/i }));
    fireEvent.click(screen.getByRole("button", { name: /Viga a baja altura/i }));
    fireEvent.click(screen.getByRole("button", { name: /Traer 2 observaciones/i }));

    const traidas = screen.getByTestId("observaciones").textContent ?? "";
    expect(traidas).toContain("Acopio junto al borde del talud");
    expect(traidas).toContain("Viga a baja altura");
    expect(screen.queryByText(/sin resolver/i)).not.toBeInTheDocument();
  });
});
