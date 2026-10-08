import { describe, it, expect, beforeEach } from "vitest";
import { ObservacionesPendientes } from "@/application/use-cases/observaciones-pendientes";
import { crearInforme, type DatosInforme } from "@/domain/informe/informe";
import { InformeRepositoryEnMemoria } from "@/test/fakes";

describe("ObservacionesPendientes", () => {
  let informes: InformeRepositoryEnMemoria;

  beforeEach(() => {
    informes = new InformeRepositoryEnMemoria();
  });

  /** Guarda un informe de la obra 1 y devuelve su id. */
  async function unInforme(datos: Partial<DatosInforme>): Promise<string> {
    const informe = crearInforme({ proyectoId: "obra-1", ...datos });
    if (!informe.ok) throw new Error("el informe de prueba debería ser válido");
    await informes.guardar(informe.valor);
    return informe.valor.id;
  }

  const pendientes = () => new ObservacionesPendientes(informes).ejecutar("obra-1");

  it("no devuelve nada si la obra aún no tiene informes", async () => {
    expect(await pendientes()).toEqual([]);
  });

  it("trae lo que quedó como medida requerida o como OPS", async () => {
    await unInforme({
      estado: "finalizado",
      fechaHora: "2026-08-17T09:00",
      observaciones: [
        { id: "o1", titulo: "Acopio junto al borde del talud", estado: "medida-requerida" },
        { id: "o2", titulo: "Viga a baja altura", estado: "observacion-preventiva" },
      ],
    });

    const resultado = await pendientes();

    expect(resultado).toHaveLength(2);
    expect(resultado.map((p) => p.observacion.titulo)).toEqual([
      "Acopio junto al borde del talud",
      "Viga a baja altura",
    ]);
  });

  it("deja fuera lo subsanado: eso ya está cerrado", async () => {
    await unInforme({
      estado: "finalizado",
      fechaHora: "2026-08-17T09:00",
      observaciones: [
        { id: "o1", titulo: "Arreglado el mismo día", estado: "subsanado" },
        { id: "o2", titulo: "Sigue sin rodapié", estado: "medida-requerida" },
      ],
    });

    const resultado = await pendientes();

    expect(resultado).toHaveLength(1);
    expect(resultado[0].observacion.titulo).toBe("Sigue sin rodapié");
  });

  it("deja fuera las que no llevan estado: no afirman que haya nada pendiente", async () => {
    // "Visita sin incidencias reseñables" es una de estas. Arrastrarla no
    // significaría nada y ensuciaría la lista.
    await unInforme({
      estado: "finalizado",
      fechaHora: "2026-08-17T09:00",
      observaciones: [{ id: "o1", titulo: "Visita sin incidencias reseñables." }],
    });

    expect(await pendientes()).toEqual([]);
  });

  it("ignora los borradores: un informe sin cerrar no es evidencia de nada", async () => {
    await unInforme({
      estado: "borrador",
      fechaHora: "2026-08-24T09:00",
      observaciones: [{ id: "o1", titulo: "A medias", estado: "medida-requerida" }],
    });

    expect(await pendientes()).toEqual([]);
  });

  it("mira solo el último informe cerrado, no todo el historial", async () => {
    await unInforme({
      estado: "finalizado",
      fechaHora: "2026-08-10T09:00",
      observaciones: [{ id: "vieja", titulo: "De hace dos semanas", estado: "medida-requerida" }],
    });
    await unInforme({
      estado: "finalizado",
      fechaHora: "2026-08-17T09:00",
      observaciones: [{ id: "nueva", titulo: "De la última visita", estado: "medida-requerida" }],
    });

    const resultado = await pendientes();

    // Si algo sigue abierto, viaja de informe en informe: el último ya lo lleva.
    expect(resultado).toHaveLength(1);
    expect(resultado[0].observacion.titulo).toBe("De la última visita");
  });

  it("el origen es la visita donde se señaló, con su informe", async () => {
    const id = await unInforme({
      estado: "finalizado",
      fechaHora: "2026-08-17T09:00",
      observaciones: [{ id: "o1", titulo: "Acopio junto al talud", estado: "medida-requerida" }],
    });

    const [primera] = await pendientes();

    expect(primera.origen).toEqual({ informeId: id, fecha: "2026-08-17T09:00" });
  });

  it("una observación ya arrastrada CONSERVA su fecha original", async () => {
    // El caso que importa: si algo lleva tres semanas abierto, lo que pesa es
    // que se vio el día 3, no que se copió el día 17. Esa antigüedad es la que
    // sale impresa en el informe.
    await unInforme({
      estado: "finalizado",
      fechaHora: "2026-08-17T09:00",
      observaciones: [
        {
          id: "o1",
          titulo: "Sigue el acopio junto al talud",
          estado: "medida-requerida",
          vieneDe: { informeId: "informe-del-3", fecha: "2026-08-03T09:00" },
        },
      ],
    });

    const [primera] = await pendientes();

    expect(primera.origen).toEqual({ informeId: "informe-del-3", fecha: "2026-08-03T09:00" });
  });

  it("no toca los informes: solo mira", async () => {
    await unInforme({
      estado: "finalizado",
      fechaHora: "2026-08-17T09:00",
      observaciones: [{ id: "o1", titulo: "Pendiente", estado: "medida-requerida" }],
    });
    const antes = JSON.stringify([...informes.guardados.values()]);

    await pendientes();

    expect(JSON.stringify([...informes.guardados.values()])).toBe(antes);
  });
});
