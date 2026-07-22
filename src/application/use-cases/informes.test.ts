import { describe, it, expect, beforeEach } from "vitest";
import { CrearBorradorInforme } from "@/application/use-cases/crear-borrador-informe";
import { GuardarInforme } from "@/application/use-cases/guardar-informe";
import { ObtenerInforme } from "@/application/use-cases/obtener-informe";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { CrearProyecto } from "@/application/use-cases/crear-proyecto";
import { type Id } from "@/domain/shared/id";
import {
  InformeRepositoryEnMemoria,
  ProyectoRepositoryEnMemoria,
  PromotorRepositoryEnMemoria,
} from "@/test/fakes";

describe("Casos de uso de informes", () => {
  let informes: InformeRepositoryEnMemoria;
  let proyectos: ProyectoRepositoryEnMemoria;
  let promotores: PromotorRepositoryEnMemoria;

  beforeEach(() => {
    informes = new InformeRepositoryEnMemoria();
    proyectos = new ProyectoRepositoryEnMemoria();
    promotores = new PromotorRepositoryEnMemoria();
  });

  /** Da de alta un promotor y una obra de verdad; devuelve el id de la obra. */
  async function unaObra(): Promise<Id> {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Canal" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    const obra = await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-001",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });
    if (!obra.ok) throw new Error("crear la obra debería funcionar");
    return obra.valor.id;
  }

  describe("CrearBorradorInforme", () => {
    it("crea un borrador cuando la obra existe", async () => {
      const proyectoId = await unaObra();

      const resultado = await new CrearBorradorInforme(informes, proyectos).ejecutar(proyectoId);

      expect(resultado.ok).toBe(true);
      expect(informes.guardados.size).toBe(1);
      if (resultado.ok) {
        expect(resultado.valor.proyectoId).toBe(proyectoId);
        expect(resultado.valor.estado).toBe("borrador");
      }
    });

    it("no crea el informe si la obra no existe", async () => {
      const resultado = await new CrearBorradorInforme(informes, proyectos).ejecutar("obra-fantasma");

      expect(resultado.ok).toBe(false);
      if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("ya no existe");
      expect(informes.guardados.size).toBe(0);
    });
  });

  describe("GuardarInforme (autoguardado)", () => {
    it("persiste el informe con lo nuevo de cada paso", async () => {
      const proyectoId = await unaObra();
      const borrador = await new CrearBorradorInforme(informes, proyectos).ejecutar(proyectoId);
      if (!borrador.ok) throw new Error("el borrador debería crearse");

      const guardado = await new GuardarInforme(informes).ejecutar({
        ...borrador.valor,
        contenido: "Visita sin incidencias.",
      });

      expect(guardado.ok).toBe(true);
      // No se duplica: sigue siendo el mismo informe, actualizado.
      expect(informes.guardados.size).toBe(1);
      expect(informes.guardados.get(borrador.valor.id)?.contenido).toBe("Visita sin incidencias.");
    });

    it("no guarda si los datos son inválidos (una firma sin trazo)", async () => {
      const proyectoId = await unaObra();
      const borrador = await new CrearBorradorInforme(informes, proyectos).ejecutar(proyectoId);
      if (!borrador.ok) throw new Error("el borrador debería crearse");
      informes.guardados.clear();

      const guardado = await new GuardarInforme(informes).ejecutar({
        ...borrador.valor,
        firmas: [{ nombre: "Ana", rol: "coordinador", firma: "" }],
      });

      expect(guardado.ok).toBe(false);
      expect(informes.guardados.size).toBe(0);
    });
  });

  describe("ObtenerInforme", () => {
    it("devuelve null si el informe no existe", async () => {
      expect(await new ObtenerInforme(informes).ejecutar("no-existe")).toBeNull();
    });

    it("recupera un borrador para retomarlo donde se dejó", async () => {
      const proyectoId = await unaObra();
      const borrador = await new CrearBorradorInforme(informes, proyectos).ejecutar(proyectoId);
      if (!borrador.ok) throw new Error("el borrador debería crearse");
      await new GuardarInforme(informes).ejecutar({
        ...borrador.valor,
        contenido: "A medias…",
      });

      const recuperado = await new ObtenerInforme(informes).ejecutar(borrador.valor.id);
      expect(recuperado?.contenido).toBe("A medias…");
    });
  });
});
