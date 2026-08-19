// Test de INTEGRACIÓN del adaptador de obras: ejerce localForage → IndexedDB
// (con fake-indexeddb, porque jsdom no trae IndexedDB).
import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import { crearProyecto, type DatosProyecto, type Proyecto } from "@/domain/proyecto/proyecto";
import { LocalForageProyectoRepository } from "@/infrastructure/persistence/localforage/proyecto-repository.localforage";

function proyectoDePrueba(cambios: Partial<DatosProyecto> = {}): Proyecto {
  const resultado = crearProyecto({
    codigoObra: "OB-001",
    promotorId: "promotor-1",
    frecuenciaVisita: "semanal",
    ...cambios,
  });
  if (!resultado.ok) throw new Error("los datos de prueba deberían ser válidos");
  return resultado.valor;
}

describe("LocalForageProyectoRepository", () => {
  let repo: LocalForageProyectoRepository;

  beforeEach(async () => {
    repo = new LocalForageProyectoRepository();
    await repo["caja"].clear();
  });

  it("devuelve null al buscar una obra que no existe", async () => {
    expect(await repo.obtenerPorId("no-existe")).toBeNull();
  });

  it("guarda una obra y la recupera con su lista de distribución", async () => {
    const proyecto = proyectoDePrueba({
      descripcion: "Centro cívico Los Molinos",
      listaDistribucion: [{ correo: "marta@canal.es", rol: "promotor" }],
    });
    await repo.guardar(proyecto);

    const recuperada = await repo.obtenerPorId(proyecto.id);
    expect(recuperada?.codigoObra).toBe("OB-001");
    expect(recuperada?.descripcion).toBe("Centro cívico Los Molinos");
    expect(recuperada?.listaDistribucion?.[0].correo).toBe("marta@canal.es");
    expect(recuperada?.listaDistribucion?.[0].rol).toBe("promotor");
  });

  it("lista todas las obras ordenadas por código", async () => {
    await repo.guardar(proyectoDePrueba({ codigoObra: "OB-002" }));
    await repo.guardar(proyectoDePrueba({ codigoObra: "OB-001" }));

    const lista = await repo.listar();
    expect(lista.map((p) => p.codigoObra)).toEqual(["OB-001", "OB-002"]);
  });

  it("lista solo las obras del promotor indicado", async () => {
    await repo.guardar(proyectoDePrueba({ codigoObra: "OB-A", promotorId: "promotor-1" }));
    await repo.guardar(proyectoDePrueba({ codigoObra: "OB-B", promotorId: "promotor-2" }));
    await repo.guardar(proyectoDePrueba({ codigoObra: "OB-C", promotorId: "promotor-1" }));

    const suyas = await repo.listarPorPromotor("promotor-1");
    expect(suyas.map((p) => p.codigoObra)).toEqual(["OB-A", "OB-C"]);
  });

  it("guardar con el mismo id reemplaza (editar, no duplicar)", async () => {
    const proyecto = proyectoDePrueba({ codigoObra: "OB-001" });
    await repo.guardar(proyecto);
    await repo.guardar(proyectoDePrueba({ id: proyecto.id, codigoObra: "OB-999" }));

    const lista = await repo.listar();
    expect(lista).toHaveLength(1);
    expect(lista[0].codigoObra).toBe("OB-999");
  });

  it("sella con la versión de hoy lo que guarda", async () => {
    const obra = proyectoDePrueba();
    await repo.guardar(obra);

    const enDisco = await repo["caja"].getItem<{ schemaVersion?: number }>(obra.id);
    expect(enDisco?.schemaVersion).toBe(1);
  });

  it("conserva el presupuesto de las obras guardadas con el nombre viejo del campo", async () => {
    // Una obra tal y como la guardó la app ANTES de separar los dos
    // presupuestos: el campo se llamaba `presupuesto` a secas. Los
    // coordinadores tienen obras así en su dispositivo.
    await repo["caja"].setItem("obra-vieja", {
      id: "obra-vieja",
      codigoObra: "OB-VIEJA",
      promotorId: "promotor-1",
      frecuenciaVisita: "semanal",
      presupuesto: "27.470.256,11 €",
    });

    const recuperada = await repo.obtenerPorId("obra-vieja");

    expect(recuperada?.presupuestoEjecucion).toBe("27.470.256,11 €");
  });

  it("una obra sin sello se trata como v0 y sube por todos los escalones", async () => {
    await repo["caja"].setItem("obra-vieja", {
      id: "obra-vieja",
      codigoObra: "OB-VIEJA",
      promotorId: "promotor-1",
      frecuenciaVisita: "semanal",
      presupuesto: "1.000 €",
    });

    // Al releerla ya viene con la forma de hoy…
    const recuperada = await repo.obtenerPorId("obra-vieja");
    expect(recuperada?.presupuestoEjecucion).toBe("1.000 €");

    // …y al volver a guardarla queda sellada, así que la próxima lectura no
    // tiene que migrar nada.
    if (!recuperada) throw new Error("debería existir");
    await repo.guardar(recuperada);
    const enDisco = await repo["caja"].getItem<{ schemaVersion?: number; presupuesto?: string }>(
      "obra-vieja",
    );
    expect(enDisco?.schemaVersion).toBe(1);
    expect(enDisco?.presupuesto).toBeUndefined();
  });

  it("no pisa el presupuesto nuevo si la obra ya tiene los dos campos", async () => {
    await repo["caja"].setItem("obra-mixta", {
      id: "obra-mixta",
      codigoObra: "OB-MIXTA",
      promotorId: "promotor-1",
      frecuenciaVisita: "semanal",
      presupuesto: "el viejo",
      presupuestoEjecucion: "el nuevo",
    });

    const recuperada = await repo.obtenerPorId("obra-mixta");

    expect(recuperada?.presupuestoEjecucion).toBe("el nuevo");
  });

  it("descarta del listado lo que no supere la re-validación", async () => {
    await repo.guardar(proyectoDePrueba({ codigoObra: "OB-buena" }));
    // Sin promotorId ni frecuencia: corrupta.
    await repo["caja"].setItem("corrupta", { id: "corrupta", codigoObra: "OB-mala" });

    const lista = await repo.listar();
    expect(lista).toHaveLength(1);
    expect(lista[0].codigoObra).toBe("OB-buena");
  });
});
