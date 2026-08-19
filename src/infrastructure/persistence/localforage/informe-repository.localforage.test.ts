// Test de INTEGRACIÓN del adaptador de informes: localForage → IndexedDB
// (con fake-indexeddb, porque jsdom no trae IndexedDB).
import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { crearInforme, type DatosInforme, type Informe } from "@/domain/informe/informe";
import { LocalForageInformeRepository } from "@/infrastructure/persistence/localforage/informe-repository.localforage";
import { cuarentena } from "@/infrastructure/persistence/cuarentena";

function informeDePrueba(cambios: Partial<DatosInforme> = {}): Informe {
  const resultado = crearInforme({
    proyectoId: "obra-1",
    fechaHora: "2026-07-01T09:30",
    ...cambios,
  });
  if (!resultado.ok) throw new Error("los datos de prueba deberían ser válidos");
  return resultado.valor;
}

describe("LocalForageInformeRepository", () => {
  let repo: LocalForageInformeRepository;

  beforeEach(async () => {
    repo = new LocalForageInformeRepository();
    await repo["caja"].clear();
    await cuarentena.vaciar();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("devuelve null al buscar un informe que no existe", async () => {
    expect(await repo.obtenerPorId("no-existe")).toBeNull();
  });

  it("guarda un informe con sus fotos y firmas y lo recupera", async () => {
    const informe = informeDePrueba({
      situacion: "Visita sin incidencias.",
      actividades: [
        {
          id: "a1",
          descripcion: "Desbroce de márgenes.",
          fotos: [{ id: "f1", imagen: "data:image/png;base64,AAAA" }],
        },
      ],
      firmas: [{ nombre: "Ana", rol: "coordinador", firma: "data:image/png;base64,BBBB" }],
    });
    await repo.guardar(informe);

    const recuperado = await repo.obtenerPorId(informe.id);
    expect(recuperado?.situacion).toBe("Visita sin incidencias.");
    expect(recuperado?.actividades?.[0].fotos?.[0].imagen).toBe("data:image/png;base64,AAAA");
    expect(recuperado?.firmas?.[0].rol).toBe("coordinador");
  });

  it("sella con la versión de hoy lo que guarda", async () => {
    const informe = informeDePrueba();
    await repo.guardar(informe);

    const enDisco = await repo["caja"].getItem<{ schemaVersion?: number }>(informe.id);
    expect(enDisco?.schemaVersion).toBe(1);
  });

  it("lee los informes sin sello que ya están en el dispositivo", async () => {
    // Lo que hay hoy en los móviles de los coordinadores: la forma es la de
    // ahora (el modelo v2 entró antes de que lo usaran), solo falta el sello.
    await repo["caja"].setItem("informe-viejo", {
      id: "informe-viejo",
      proyectoId: "obra-1",
      fechaHora: "2026-08-16T09:30",
      actividades: [{ id: "a1", descripcion: "Grupo electrógeno sin extintores." }],
    });

    const recuperado = await repo.obtenerPorId("informe-viejo");

    expect(recuperado?.actividades?.[0].descripcion).toBe("Grupo electrógeno sin extintores.");
  });

  it("guardar con el mismo id reemplaza (autoguardado del wizard)", async () => {
    const informe = informeDePrueba({ situacion: "Primer borrador" });
    await repo.guardar(informe);
    await repo.guardar({ ...informe, situacion: "Segundo borrador" } as Informe);

    const recuperado = await repo.obtenerPorId(informe.id);
    expect(recuperado?.situacion).toBe("Segundo borrador");
  });

  it("lista solo los informes de la obra indicada, del más reciente al más antiguo", async () => {
    await repo.guardar(informeDePrueba({ proyectoId: "obra-1", fechaHora: "2026-07-01T09:00" }));
    await repo.guardar(informeDePrueba({ proyectoId: "obra-1", fechaHora: "2026-07-03T09:00" }));
    await repo.guardar(informeDePrueba({ proyectoId: "obra-2", fechaHora: "2026-07-02T09:00" }));

    const deLaObra1 = await repo.listarPorProyecto("obra-1");
    expect(deLaObra1).toHaveLength(2);
    expect(deLaObra1.map((i) => i.fechaHora)).toEqual(["2026-07-03T09:00", "2026-07-01T09:00"]);
  });

  it("descarta del listado lo que no supere la re-validación", async () => {
    await repo.guardar(informeDePrueba({ proyectoId: "obra-1" }));
    // Sin proyectoId: corrupto.
    await repo["caja"].setItem("corrupto", { id: "corrupto", fechaHora: "2026-07-01T09:00" });

    const lista = await repo.listarPorProyecto("obra-1");
    expect(lista).toHaveLength(1);
  });

  it("aparta el borrador viejo que ya no valida, en vez de tirarlo", async () => {
    // Un borrador de ANTES del rework: tenía `contenido` en vez de actividades.
    // Hasta ahora zod lo descartaba al releer y desaparecía sin que nadie se
    // enterase; ahora se aparta con su motivo.
    await repo["caja"].setItem("borrador-antiguo", {
      id: "borrador-antiguo",
      proyectoId: "obra-1",
      fechaHora: "2026-07-01T09:30",
      contenido: "Visita sin incidencias.",
      firmas: [{ nombre: "Ana", rol: "contratista", firma: "data:image/png;base64,AAAA" }],
    });

    const lista = await repo.listarPorProyecto("obra-1");

    expect(lista).toHaveLength(0);
    const apartadas = await cuarentena.listar();
    expect(apartadas).toHaveLength(1);
    expect(apartadas[0].agregado).toBe("informe");
    expect(apartadas[0].cruda).toMatchObject({ contenido: "Visita sin incidencias." });
  });
});
