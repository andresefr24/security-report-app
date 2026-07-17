import { describe, it, expect, beforeEach } from "vitest";
import { ConfigurarPerfil } from "@/application/use-cases/configurar-perfil";
import { CoordinadorRepositoryEnMemoria } from "@/test/fakes";

describe("ConfigurarPerfil", () => {
  let repo: CoordinadorRepositoryEnMemoria;
  let caso: ConfigurarPerfil;

  beforeEach(() => {
    repo = new CoordinadorRepositoryEnMemoria();
    caso = new ConfigurarPerfil(repo);
  });

  it("guarda el perfil cuando los datos son válidos", async () => {
    const resultado = await caso.ejecutar({
      nombreCompleto: "Ana García López",
      numeroRegistroIrsst: "3306",
    });

    expect(resultado.ok).toBe(true);
    // El perfil quedó realmente guardado en el repositorio.
    expect(repo.guardado?.nombreCompleto).toBe("Ana García López");
    expect(repo.guardado?.numeroRegistroIrsst).toBe("3306");
  });

  it("no guarda nada cuando los datos son inválidos (sin registro IRSST)", async () => {
    const resultado = await caso.ejecutar({
      nombreCompleto: "Ana García López",
      numeroRegistroIrsst: "",
    });

    expect(resultado.ok).toBe(false);
    // Clave: al fallar la validación, el repositorio sigue vacío.
    expect(repo.guardado).toBeNull();
  });

  it("devuelve null al cargar si aún no hay perfil", async () => {
    expect(await caso.cargar()).toBeNull();
  });

  it("devuelve el perfil guardado al cargar", async () => {
    await caso.ejecutar({
      nombreCompleto: "Luis Pérez Ruiz",
      numeroRegistroIrsst: "4500",
    });

    const cargado = await caso.cargar();
    expect(cargado?.nombreCompleto).toBe("Luis Pérez Ruiz");
    expect(cargado?.numeroRegistroIrsst).toBe("4500");
  });
});
