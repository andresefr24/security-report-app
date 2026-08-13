// Pantalla de listado de obras.
//
// Muestra el NOMBRE del promotor de cada obra, que el caso de uso resuelve a
// partir del promotorId (la obra no guarda copia de sus datos, decisions#d5).
// Si el promotor ya no está, la tarjeta lo avisa en vez de mentir.
//
// Cada obra lista además SUS INFORMES, con enlace para retomar el que quedó a
// medias: sin eso, "Nuevo informe" siempre crearía uno nuevo y no habría forma
// de volver a un borrador (el "hecho cuando" del M3).

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  type ListarProyectos,
  type ObraConPromotor,
} from "@/application/use-cases/listar-proyectos";
import { type ListarInformes } from "@/application/use-cases/listar-informes";
import { type BorrarInforme } from "@/application/use-cases/borrar-informe";
import { type Informe } from "@/domain/informe/informe";
import { type Id } from "@/domain/shared/id";
import { Button } from "@/ui/components/button";
import { Card } from "@/ui/components/card";
import { ETIQUETAS_FRECUENCIA } from "@/ui/pages/obra-campos";

/** Concuerda el singular: "1 destinatario", pero "0 / 2 destinatarios". */
function textoDestinatarios(cuantos: number): string {
  return cuantos === 1 ? "1 destinatario" : `${cuantos} destinatarios`;
}

/** "2026-07-01T09:30" -> "1 de julio de 2026, 9:30" (legible para el coordinador). */
function fechaLegible(fechaHora: string): string {
  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) return fechaHora;
  return fecha.toLocaleString("es", { dateStyle: "long", timeStyle: "short" });
}

export interface ObrasPageProps {
  listarProyectos: ListarProyectos;
  listarInformes: ListarInformes;
  borrarInforme: BorrarInforme;
}

export function ObrasPage({ listarProyectos, listarInformes, borrarInforme }: ObrasPageProps) {
  const [obras, setObras] = useState<ObraConPromotor[]>([]);
  const [informesPorObra, setInformesPorObra] = useState<Record<Id, Informe[]>>({});
  const [cargando, setCargando] = useState(true);
  // Qué borrador está esperando confirmación. Borrar es irreversible, así que se
  // hace en dos toques: "Borrar" y luego "Sí, borrar". Sin ventanas del
  // navegador, que en el móvil salen diminutas.
  const [porConfirmar, setPorConfirmar] = useState<Id | null>(null);

  async function confirmarBorrado(obraId: Id, informeId: Id) {
    const resultado = await borrarInforme.ejecutar(informeId);
    setPorConfirmar(null);
    if (!resultado.ok) return;
    setInformesPorObra((actual) => ({
      ...actual,
      [obraId]: (actual[obraId] ?? []).filter((i) => i.id !== informeId),
    }));
  }

  useEffect(() => {
    let activo = true;
    listarProyectos.ejecutar().then(async (lista) => {
      if (!activo) return;
      setObras(lista);
      setCargando(false);

      // Los informes de cada obra, en paralelo (no uno detrás de otro).
      const pares = await Promise.all(
        lista.map(async ({ proyecto }) => [proyecto.id, await listarInformes.ejecutar(proyecto.id)] as const),
      );
      if (activo) setInformesPorObra(Object.fromEntries(pares));
    });
    return () => {
      activo = false;
    };
  }, [listarProyectos, listarInformes]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-[28px] font-semibold text-foreground">Obras</h1>
        <p className="text-[18px] text-muted-foreground">
          Las obras que coordinas. De cada una salen sus informes de visita.
        </p>
      </header>

      {cargando ? (
        <p className="text-[18px] text-muted-foreground">Cargando…</p>
      ) : obras.length === 0 ? (
        <Card className="space-y-4 p-6">
          <p className="text-[18px]">Aún no tienes obras. Crea la primera.</p>
          <Button asChild className="h-[52px] w-full text-[18px]">
            <Link to="/obras/nueva">Nueva obra</Link>
          </Button>
        </Card>
      ) : (
        <>
          <Button asChild className="h-[52px] w-full text-[18px]">
            <Link to="/obras/nueva">Nueva obra</Link>
          </Button>

          <ul className="space-y-3">
            {obras.map(({ proyecto, promotor }) => (
              <li key={proyecto.id}>
                <Card className="space-y-1 p-5">
                  <p className="text-[22px] font-semibold">{proyecto.codigoObra}</p>
                  {proyecto.descripcion && (
                    <p className="text-[18px]">{proyecto.descripcion}</p>
                  )}
                  <p className="text-[16px] text-muted-foreground">
                    {promotor ? (
                      promotor.nombreRazonSocial
                    ) : (
                      <span className="text-destructive">
                        El promotor de esta obra ya no está registrado.
                      </span>
                    )}
                  </p>
                  <p className="text-[16px] text-muted-foreground">
                    Visita {ETIQUETAS_FRECUENCIA[proyecto.frecuenciaVisita].toLowerCase()} ·{" "}
                    {textoDestinatarios(proyecto.listaDistribucion?.length ?? 0)}
                  </p>
                  {(informesPorObra[proyecto.id] ?? []).length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[16px] font-semibold">Informes de esta obra</p>
                      <ul className="space-y-2">
                        {informesPorObra[proyecto.id].map((informe) => (
                          <li key={informe.id} className="space-y-2">
                            <Button
                              asChild
                              variant="outline"
                              className="h-[52px] w-full justify-start text-[18px]"
                            >
                              <Link to={`/informes/${informe.id}`}>
                                {fechaLegible(informe.fechaHora)}
                                {informe.estado === "borrador" && " · Borrador"}
                              </Link>
                            </Button>

                            {/* Solo los borradores se pueden tirar: uno cerrado
                                está firmado y es evidencia de la visita. */}
                            {informe.estado === "borrador" &&
                              (porConfirmar === informe.id ? (
                                <div className="space-y-2 rounded-md bg-secondary p-3">
                                  <p className="text-[16px]">
                                    ¿Seguro que quieres borrar este borrador? No se puede
                                    deshacer.
                                  </p>
                                  <Button
                                    variant="secondary"
                                    onClick={() => confirmarBorrado(proyecto.id, informe.id)}
                                    className="h-[52px] w-full text-[18px]"
                                  >
                                    Sí, borrar el borrador
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setPorConfirmar(null)}
                                    className="h-[52px] w-full text-[18px]"
                                  >
                                    No, dejarlo
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="secondary"
                                  onClick={() => setPorConfirmar(informe.id)}
                                  className="h-[52px] w-full text-[18px]"
                                >
                                  Borrar borrador del {fechaLegible(informe.fechaHora)}
                                </Button>
                              ))}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button asChild className="mt-2 h-[52px] w-full text-[18px]">
                    <Link to={`/obras/${proyecto.id}/informes/nuevo`}>Nuevo informe</Link>
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
