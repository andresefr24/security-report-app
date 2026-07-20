// Test de INTEGRACIÓN del adaptador de promotores: ejerce el camino real de
// localForage → IndexedDB (con fake-indexeddb, porque jsdom no trae IndexedDB).
import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import { crearPromotor, type DatosPromotor, type Promotor } from "@/domain/promotor/promotor";
import { LocalForagePromotorRepository } from "@/infrastructure/persistence/localforage/promotor-repository.localforage";

// Ayudante: crea un Promotor ya validado para las pruebas.
function promotorDePrueba(datos: DatosPromotor): Promotor {
  const resultado = crearPromotor(datos);
  if (!resultado.ok) throw new Error("los datos de prueba deberían ser válidos");
  return resultado.valor;
}

describe("LocalForagePromotorRepository", () => {
  let repo: LocalForagePromotorRepository;

  beforeEach(async () => {
    repo = new LocalForagePromotorRepository();
    await repo["caja"].clear();
  });

  it("devuelve null al buscar un promotor que no existe", async () => {
    expect(await repo.obtenerPorId("no-existe")).toBeNull();
  });

  it("devuelve una lista vacía cuando no hay promotores", async () => {
    expect(await repo.listar()).toEqual([]);
  });

  it("guarda un promotor y lo recupera por su id", async () => {
    const promotor = promotorDePrueba({
      nombreRazonSocial: "Canal de Isabel II",
      nif: "A28000000",
      contacto: { persona: "Marta Ruiz", correo: "marta@canal.es" },
    });
    await repo.guardar(promotor);

    const recuperado = await repo.obtenerPorId(promotor.id);
    expect(recuperado?.nombreRazonSocial).toBe("Canal de Isabel II");
    expect(recuperado?.nif).toBe("A28000000");
    expect(recuperado?.contacto?.persona).toBe("Marta Ruiz");
  });

  it("lista todos los promotores guardados, en orden alfabético", async () => {
    await repo.guardar(promotorDePrueba({ nombreRazonSocial: "Zeta Obras" }));
    await repo.guardar(promotorDePrueba({ nombreRazonSocial: "Ayuntamiento de Getafe" }));

    const lista = await repo.listar();
    expect(lista).toHaveLength(2);
    expect(lista.map((p) => p.nombreRazonSocial)).toEqual([
      "Ayuntamiento de Getafe",
      "Zeta Obras",
    ]);
  });

  it("guardar con el mismo id reemplaza (editar, no duplicar)", async () => {
    const promotor = promotorDePrueba({ nombreRazonSocial: "Nombre viejo" });
    await repo.guardar(promotor);

    // Mismo id, datos nuevos.
    await repo.guardar(promotorDePrueba({ id: promotor.id, nombreRazonSocial: "Nombre nuevo" }));

    const lista = await repo.listar();
    expect(lista).toHaveLength(1);
    expect(lista[0].nombreRazonSocial).toBe("Nombre nuevo");
  });

  it("descarta del listado lo que no supere la re-validación (datos corruptos)", async () => {
    await repo.guardar(promotorDePrueba({ nombreRazonSocial: "Promotor bueno" }));
    // Escribimos directamente en la caja, saltándonos guardar(): sin razón social.
    await repo["caja"].setItem("corrupto", { id: "corrupto", nif: "X" });

    const lista = await repo.listar();
    expect(lista).toHaveLength(1);
    expect(lista[0].nombreRazonSocial).toBe("Promotor bueno");
    expect(await repo.obtenerPorId("corrupto")).toBeNull();
  });
});
