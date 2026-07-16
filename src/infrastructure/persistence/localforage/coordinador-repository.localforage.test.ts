// Test de INTEGRACIÓN del adaptador localForage.
//
// A diferencia de un test unitario (que usaría un fake), este ejerce el camino
// real de localForage → IndexedDB. Como jsdom no trae IndexedDB, importamos
// fake-indexeddb solo aquí, para darle uno "de mentira" pero con comportamiento
// real. Así probamos que el cableado con la librería funciona de verdad.
import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import { crearCoordinador, type Coordinador } from "@/domain/coordinador/coordinador";
import { LocalForageCoordinadorRepository } from "@/infrastructure/persistence/localforage/coordinador-repository.localforage";

// Ayudante: crea un Coordinador ya validado para las pruebas.
function coordinadorDePrueba(): Coordinador {
  const resultado = crearCoordinador({
    nombreCompleto: "Ana García López",
    numeroRegistroIrsst: "3306",
    numeroColegiado: "12345",
    contacto: { correo: "ana@tps-ingenieria.es", empresa: "TPS Ingeniería" },
    firma: "data:image/png;base64,AAAA",
  });
  if (!resultado.ok) throw new Error("los datos de prueba deberían ser válidos");
  return resultado.valor;
}

describe("LocalForageCoordinadorRepository", () => {
  let repo: LocalForageCoordinadorRepository;

  beforeEach(async () => {
    repo = new LocalForageCoordinadorRepository();
    // Cada test parte de una caja vacía para que no se pisen entre sí.
    await repo["caja"].clear();
  });

  it("devuelve null cuando aún no se ha guardado ningún perfil", async () => {
    expect(await repo.obtener()).toBeNull();
  });

  it("guarda un perfil y lo recupera igual (incluida la firma)", async () => {
    const coordinador = coordinadorDePrueba();
    await repo.guardar(coordinador);

    const recuperado = await repo.obtener();
    expect(recuperado).not.toBeNull();
    expect(recuperado?.nombreCompleto).toBe("Ana García López");
    expect(recuperado?.numeroRegistroIrsst).toBe("3306");
    expect(recuperado?.numeroColegiado).toBe("12345");
    expect(recuperado?.contacto?.empresa).toBe("TPS Ingeniería");
    expect(recuperado?.firma).toBe("data:image/png;base64,AAAA");
  });

  it("reemplaza el perfil anterior al guardar de nuevo (perfil único)", async () => {
    await repo.guardar(coordinadorDePrueba());

    const otro = crearCoordinador({
      nombreCompleto: "Luis Pérez Ruiz",
      numeroRegistroIrsst: "4500",
    });
    if (!otro.ok) throw new Error("datos inválidos en el test");
    await repo.guardar(otro.valor);

    const recuperado = await repo.obtener();
    expect(recuperado?.nombreCompleto).toBe("Luis Pérez Ruiz");
    expect(recuperado?.numeroRegistroIrsst).toBe("4500");
  });

  it("devuelve null si lo guardado no supera la re-validación (datos corruptos)", async () => {
    // Simulamos datos corruptos escribiendo directamente en la caja, saltándonos
    // guardar(): un perfil sin el registro IRSST obligatorio.
    await repo["caja"].setItem("perfil", { nombreCompleto: "Sin registro" });

    expect(await repo.obtener()).toBeNull();
  });
});
