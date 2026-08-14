import { describe, it, expect, beforeEach } from "vitest";
import { GenerarPdfDelInforme } from "@/application/use-cases/generar-pdf-del-informe";
import { ConfigurarPerfil } from "@/application/use-cases/configurar-perfil";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { CrearProyecto } from "@/application/use-cases/crear-proyecto";
import { CrearBorradorInforme } from "@/application/use-cases/crear-borrador-informe";
import { GuardarInforme } from "@/application/use-cases/guardar-informe";
import { type Id } from "@/domain/shared/id";
import {
  CoordinadorRepositoryEnMemoria,
  InformeRepositoryEnMemoria,
  PdfPortFalso,
  PromotorRepositoryEnMemoria,
  ProyectoRepositoryEnMemoria,
} from "@/test/fakes";

describe("GenerarPdfDelInforme", () => {
  let informes: InformeRepositoryEnMemoria;
  let proyectos: ProyectoRepositoryEnMemoria;
  let promotores: PromotorRepositoryEnMemoria;
  let coordinadores: CoordinadorRepositoryEnMemoria;
  let pdf: PdfPortFalso;

  beforeEach(() => {
    informes = new InformeRepositoryEnMemoria();
    proyectos = new ProyectoRepositoryEnMemoria();
    promotores = new PromotorRepositoryEnMemoria();
    coordinadores = new CoordinadorRepositoryEnMemoria();
    pdf = new PdfPortFalso();
  });

  function elCaso() {
    return new GenerarPdfDelInforme(informes, proyectos, promotores, coordinadores, pdf);
  }

  async function unPerfil() {
    const perfil = await new ConfigurarPerfil(coordinadores).ejecutar({
      nombreCompleto: "Ana García López",
      numeroRegistroIrsst: "3306",
    });
    if (!perfil.ok) throw new Error("el perfil debería guardarse");
  }

  /** Deja montada una obra con su promotor y un informe; devuelve el id del informe. */
  async function unInforme(): Promise<Id> {
    const alta = await new AltaPromotor(promotores).ejecutar({
      nombreRazonSocial: "Canal de Isabel II",
    });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    const obra = await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-2026-014",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });
    if (!obra.ok) throw new Error("crear la obra debería funcionar");
    const borrador = await new CrearBorradorInforme(informes, proyectos).ejecutar(obra.valor.id);
    if (!borrador.ok) throw new Error("el borrador debería crearse");
    await new GuardarInforme(informes).ejecutar({
      ...borrador.valor,
      fechaHora: "2026-07-01T09:30",
      actividades: [{ id: "a1", descripcion: "Visita sin incidencias." }],
    });
    return borrador.valor.id;
  }

  it("genera el PDF con el informe, la obra, el promotor y el coordinador", async () => {
    await unPerfil();
    const informeId = await unInforme();

    const resultado = await elCaso().ejecutar(informeId);

    expect(resultado.ok).toBe(true);
    // Al PdfPort le llegaron las cuatro piezas.
    expect(pdf.ultimaLlamada?.informe.id).toBe(informeId);
    expect(pdf.ultimaLlamada?.proyecto.codigoObra).toBe("OB-2026-014");
    expect(pdf.ultimaLlamada?.promotor?.nombreRazonSocial).toBe("Canal de Isabel II");
    expect(pdf.ultimaLlamada?.coordinador.numeroRegistroIrsst).toBe("3306");
  });

  it("nombra el archivo con la obra y la fecha", async () => {
    await unPerfil();
    const informeId = await unInforme();

    const resultado = await elCaso().ejecutar(informeId);

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.valor.nombreArchivo).toBe("Informe OB-2026-014 - 2026-07-01.pdf");
    }
  });

  it("no genera nada si el coordinador aún no tiene perfil", async () => {
    const informeId = await unInforme(); // sin perfil

    const resultado = await elCaso().ejecutar(informeId);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("perfil");
    expect(pdf.ultimaLlamada).toBeNull();
  });

  it("falla si el informe no existe", async () => {
    await unPerfil();

    const resultado = await elCaso().ejecutar("no-existe");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("informe ya no existe");
  });

  it("falla si la obra del informe ya no existe", async () => {
    await unPerfil();
    const informeId = await unInforme();
    proyectos.guardados.clear();

    const resultado = await elCaso().ejecutar(informeId);

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.errores.join(" ")).toContain("obra");
  });

  it("genera el PDF aunque el promotor se haya borrado (el documento lo indicará)", async () => {
    await unPerfil();
    const informeId = await unInforme();
    promotores.guardados.clear();

    const resultado = await elCaso().ejecutar(informeId);

    expect(resultado.ok).toBe(true);
    expect(pdf.ultimaLlamada?.promotor).toBeNull();
  });
});
