import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ObrasPage } from "@/ui/pages/ObrasPage";
import { ListarProyectos } from "@/application/use-cases/listar-proyectos";
import { CrearProyecto } from "@/application/use-cases/crear-proyecto";
import { AltaPromotor } from "@/application/use-cases/alta-promotor";
import { ListarInformes } from "@/application/use-cases/listar-informes";
import { BorrarInforme } from "@/application/use-cases/borrar-informe";
import { BorrarProyecto } from "@/application/use-cases/borrar-proyecto";
import { CrearBorradorInforme } from "@/application/use-cases/crear-borrador-informe";
import { FUTURE_COMPONENTE } from "@/app/opciones-router";
import {
  InformeRepositoryEnMemoria,
  PromotorRepositoryEnMemoria,
  ProyectoRepositoryEnMemoria,
} from "@/test/fakes";

describe("ObrasPage", () => {
  let proyectos: ProyectoRepositoryEnMemoria;
  let promotores: PromotorRepositoryEnMemoria;
  let informes: InformeRepositoryEnMemoria;

  beforeEach(() => {
    proyectos = new ProyectoRepositoryEnMemoria();
    promotores = new PromotorRepositoryEnMemoria();
    informes = new InformeRepositoryEnMemoria();
  });

  function montar() {
    return render(
      <MemoryRouter future={FUTURE_COMPONENTE}>
        <ObrasPage
          listarProyectos={new ListarProyectos(proyectos, promotores)}
          listarInformes={new ListarInformes(informes)}
          borrarInforme={new BorrarInforme(informes)}
          borrarProyecto={new BorrarProyecto(proyectos, informes)}
        />
      </MemoryRouter>,
    );
  }

  it("muestra el estado vacío con salida cuando no hay obras", async () => {
    montar();

    expect(await screen.findByText(/Aún no tienes obras/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Nueva obra/i })).toBeInTheDocument();
  });

  it("muestra cada obra con el nombre de su promotor", async () => {
    const alta = await new AltaPromotor(promotores).ejecutar({
      nombreRazonSocial: "Canal de Isabel II",
    });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-2026-014",
      promotorId: alta.valor.id,
      descripcion: "Centro cívico Los Molinos",
      frecuenciaVisita: "diaria",
    });

    montar();

    expect(await screen.findByText("OB-2026-014")).toBeInTheDocument();
    expect(screen.getByText("Centro cívico Los Molinos")).toBeInTheDocument();
    // El nombre del promotor se resuelve desde su id, no está copiado en la obra.
    expect(screen.getByText("Canal de Isabel II")).toBeInTheDocument();
    expect(screen.getByText(/Visita diaria/i)).toBeInTheDocument();
  });

  it("no muestra lista de informes en una obra que no tiene ninguno", async () => {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Promotor" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-001",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });

    montar();

    await screen.findByText("OB-001");
    expect(screen.queryByText(/Informes de esta obra/i)).not.toBeInTheDocument();
  });

  it("lista los informes de la obra con enlace para retomar el borrador", async () => {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Promotor" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    const obra = await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-001",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });
    if (!obra.ok) throw new Error("crear la obra debería funcionar");
    const borrador = await new CrearBorradorInforme(informes, proyectos).ejecutar(obra.valor.id);
    if (!borrador.ok) throw new Error("el borrador debería crearse");

    montar();

    expect(await screen.findByText(/Informes de esta obra/i)).toBeInTheDocument();
    // El enlace lleva al informe empezado, para seguir donde se dejó.
    const enlace = screen.getByRole("link", { name: /Borrador/i });
    expect(enlace).toHaveAttribute("href", `/informes/${borrador.valor.id}`);
  });

  it("borra un borrador, pero pidiendo confirmación antes", async () => {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Promotor" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    const obra = await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-001",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });
    if (!obra.ok) throw new Error("crear la obra debería funcionar");
    const borrador = await new CrearBorradorInforme(informes, proyectos).ejecutar(obra.valor.id);
    if (!borrador.ok) throw new Error("el borrador debería crearse");

    montar();

    // Primer toque: solo pregunta, no borra nada.
    fireEvent.click(await screen.findByRole("button", { name: /Borrar el informe/i }));
    expect(screen.getByText(/¿Seguro que quieres borrar/i)).toBeInTheDocument();
    expect(informes.guardados.size).toBe(1);

    // Segundo toque: ahora sí.
    fireEvent.click(screen.getByRole("button", { name: /Sí, borrar el informe/i }));
    await waitFor(() => expect(informes.guardados.size).toBe(0));
    expect(screen.queryByRole("link", { name: /Borrador/i })).not.toBeInTheDocument();
  });

  it("deja el borrador en paz si se dice que no", async () => {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Promotor" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    const obra = await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-001",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });
    if (!obra.ok) throw new Error("crear la obra debería funcionar");
    await new CrearBorradorInforme(informes, proyectos).ejecutar(obra.valor.id);

    montar();

    fireEvent.click(await screen.findByRole("button", { name: /Borrar el informe/i }));
    fireEvent.click(screen.getByRole("button", { name: /No, dejarlo/i }));

    expect(screen.queryByText(/¿Seguro que quieres borrar/i)).not.toBeInTheDocument();
    expect(informes.guardados.size).toBe(1);
  });

  it("al borrar un informe cerrado avisa de que es la evidencia de esa visita", async () => {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Promotor" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    const obra = await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-001",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });
    if (!obra.ok) throw new Error("crear la obra debería funcionar");
    const borrador = await new CrearBorradorInforme(informes, proyectos).ejecutar(obra.valor.id);
    if (!borrador.ok) throw new Error("el borrador debería crearse");
    await informes.guardar({ ...borrador.valor, estado: "finalizado" });

    montar();

    await screen.findByText(/Informes de esta obra/i);
    fireEvent.click(screen.getByRole("button", { name: /Borrar el informe/i }));

    // Se puede borrar —si no, la obra quedaría atrapada— pero se le dice lo que
    // está a punto de perder.
    expect(screen.getByText(/evidencia de esa visita/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF/)).toBeInTheDocument();
  });

  it("no mezcla los informes de una obra con los de otra", async () => {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Promotor" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    const crearObra = new CrearProyecto(proyectos, promotores);
    const obraA = await crearObra.ejecutar({
      codigoObra: "OB-A",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });
    const obraB = await crearObra.ejecutar({
      codigoObra: "OB-B",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });
    if (!obraA.ok || !obraB.ok) throw new Error("crear las obras debería funcionar");
    await new CrearBorradorInforme(informes, proyectos).ejecutar(obraA.valor.id);

    montar();

    await screen.findByText("OB-A");
    // Solo la obra A tiene informe: aparece una única lista.
    expect(screen.getAllByText(/Informes de esta obra/i)).toHaveLength(1);
  });

  it("avisa si la obra apunta a un promotor que ya no está", async () => {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Se irá" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-001",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });
    promotores.guardados.clear();

    montar();

    expect(await screen.findByText(/promotor de esta obra ya no está registrado/i)).toBeInTheDocument();
  });
  it("borra una obra vacía, pidiendo confirmación antes", async () => {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Promotor" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-001",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });

    montar();

    fireEvent.click(await screen.findByRole("button", { name: /Borrar la obra OB-001/i }));
    expect(screen.getByText(/¿Seguro que quieres borrar la obra/i)).toBeInTheDocument();
    expect(proyectos.guardados.size).toBe(1);

    fireEvent.click(screen.getByRole("button", { name: /Sí, borrar la obra/i }));

    await waitFor(() => expect(proyectos.guardados.size).toBe(0));
  });

  it("avisa de cuántos informes se lleva la obra por delante, y los borra", async () => {
    const alta = await new AltaPromotor(promotores).ejecutar({ nombreRazonSocial: "Promotor" });
    if (!alta.ok) throw new Error("el alta debería funcionar");
    const obra = await new CrearProyecto(proyectos, promotores).ejecutar({
      codigoObra: "OB-001",
      promotorId: alta.valor.id,
      frecuenciaVisita: "semanal",
    });
    if (!obra.ok) throw new Error("crear la obra debería funcionar");
    await new CrearBorradorInforme(informes, proyectos).ejecutar(obra.valor.id);

    montar();

    fireEvent.click(await screen.findByRole("button", { name: /Borrar la obra OB-001/i }));
    expect(screen.getByText(/Se borrará también su informe/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Sí, borrar la obra/i }));

    await waitFor(() => expect(proyectos.guardados.size).toBe(0));
    expect(informes.guardados.size).toBe(0);
  });
});
