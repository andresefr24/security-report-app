// Test de INTEGRACIÓN del adaptador de informes: localForage → IndexedDB
// (con fake-indexeddb, porque jsdom no trae IndexedDB).
import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import { crearInforme, type DatosInforme, type Informe } from "@/domain/informe/informe";
import { LocalForageInformeRepository } from "@/infrastructure/persistence/localforage/informe-repository.localforage";

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
  });

  it("devuelve null al buscar un informe que no existe", async () => {
    expect(await repo.obtenerPorId("no-existe")).toBeNull();
  });

  it("guarda un informe con sus fotos y firmas y lo recupera", async () => {
    const informe = informeDePrueba({
      contenido: "Visita sin incidencias.",
      fotos: [{ id: "f1", imagen: "data:image/png;base64,AAAA" }],
      firmas: [{ nombre: "Ana", rol: "coordinador", firma: "data:image/png;base64,BBBB" }],
    });
    await repo.guardar(informe);

    const recuperado = await repo.obtenerPorId(informe.id);
    expect(recuperado?.contenido).toBe("Visita sin incidencias.");
    expect(recuperado?.fotos?.[0].imagen).toBe("data:image/png;base64,AAAA");
    expect(recuperado?.firmas?.[0].rol).toBe("coordinador");
  });

  it("guardar con el mismo id reemplaza (autoguardado del wizard)", async () => {
    const informe = informeDePrueba({ contenido: "Primer borrador" });
    await repo.guardar(informe);
    await repo.guardar({ ...informe, contenido: "Segundo borrador" } as Informe);

    const recuperado = await repo.obtenerPorId(informe.id);
    expect(recuperado?.contenido).toBe("Segundo borrador");
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
});
