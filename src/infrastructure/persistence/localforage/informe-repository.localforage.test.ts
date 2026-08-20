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
      observaciones: [
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
    expect(recuperado?.observaciones?.[0].fotos?.[0].imagen).toBe("data:image/png;base64,AAAA");
    expect(recuperado?.firmas?.[0].rol).toBe("coordinador");
  });

  it("sella con la versión de hoy lo que guarda", async () => {
    const informe = informeDePrueba();
    await repo.guardar(informe);

    const enDisco = await repo["caja"].getItem<{ schemaVersion?: number }>(informe.id);
    // Cuatro escalones: el sello, el paso a observación, la retirada del
    // receptor y la de las firmas de "recibido".
    expect(enDisco?.schemaVersion).toBe(4);
  });

  it("convierte en observaciones las actividades de los informes ya guardados", async () => {
    // ESTE es el informe que Nicolás y Miren tienen hoy en el móvil: sin sello y
    // con `actividades`. Sin el escalón v1→v2, zod lo descartaría entero.
    await repo["caja"].setItem("informe-viejo", {
      id: "informe-viejo",
      proyectoId: "obra-1",
      fechaHora: "2026-08-16T09:30",
      actividades: [
        {
          id: "a1",
          ubicacion: "Junto a las casetas",
          descripcion: "Grupo electrógeno sin extintores.",
          fotos: [{ id: "f1", imagen: "data:image/png;base64,AAAA", comentario: "El equipo." }],
        },
      ],
    });

    const recuperado = await repo.obtenerPorId("informe-viejo");

    // El texto que escribieron sigue entero, ahora dentro de una observación.
    expect(recuperado?.observaciones).toHaveLength(1);
    expect(recuperado?.observaciones?.[0].descripcion).toBe("Grupo electrógeno sin extintores.");
    expect(recuperado?.observaciones?.[0].ubicacion).toBe("Junto a las casetas");
    expect(recuperado?.observaciones?.[0].fotos?.[0].comentario).toBe("El equipo.");
    // El título se queda vacío: no hay de dónde sacarlo sin inventárselo.
    expect(recuperado?.observaciones?.[0].titulo).toBeUndefined();
  });

  it("lo que estaba marcado como incidencia pasa a 'medida requerida'", async () => {
    await repo["caja"].setItem("informe-incidencia", {
      id: "informe-incidencia",
      proyectoId: "obra-1",
      fechaHora: "2026-08-16T09:30",
      actividades: [{ id: "a1", descripcion: "Extensión IP-20.", tipo: "incidencia" }],
    });

    const recuperado = await repo.obtenerPorId("informe-incidencia");

    expect(recuperado?.observaciones?.[0].estado).toBe("medida-requerida");
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

  it("tira la firma de 'recibido' de los informes ya guardados, sin perder el resto", async () => {
    await repo["caja"].setItem("informe-con-recibido", {
      id: "informe-con-recibido",
      proyectoId: "obra-1",
      fechaHora: "2026-08-16T09:30",
      observaciones: [{ id: "o1", titulo: "Grupo electrógeno" }],
      firmas: [
        { nombre: "Ana", rol: "coordinador", firma: "data:image/png;base64,AAAA" },
        { nombre: "Luis", rol: "recibido", firma: "data:image/png;base64,BBBB" },
      ],
    });

    const recuperado = await repo.obtenerPorId("informe-con-recibido");

    // Sin el escalón, ese rol ya no valida y el informe ENTERO caería en
    // cuarentena; así solo se va la firma que sobra.
    expect(recuperado?.firmas).toHaveLength(1);
    expect(recuperado?.firmas?.[0].rol).toBe("coordinador");
    expect(recuperado?.observaciones).toHaveLength(1);
  });

  it("aparta el borrador viejo que ya no valida, en vez de tirarlo", async () => {
    // Un borrador de ANTES del rework: tenía `contenido` en vez de observaciones.
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
