// Pantalla de listado de obras.
//
// Muestra el NOMBRE del promotor de cada obra, que el caso de uso resuelve a
// partir del promotorId (la obra no guarda copia de sus datos, decisions#d5).
// Si el promotor ya no está, la tarjeta lo avisa en vez de mentir.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  type ListarProyectos,
  type ObraConPromotor,
} from "@/application/use-cases/listar-proyectos";
import { Button } from "@/ui/components/button";
import { Card } from "@/ui/components/card";
import { ETIQUETAS_FRECUENCIA } from "@/ui/pages/obra-campos";

/** Concuerda el singular: "1 destinatario", pero "0 / 2 destinatarios". */
function textoDestinatarios(cuantos: number): string {
  return cuantos === 1 ? "1 destinatario" : `${cuantos} destinatarios`;
}

export interface ObrasPageProps {
  listarProyectos: ListarProyectos;
}

export function ObrasPage({ listarProyectos }: ObrasPageProps) {
  const [obras, setObras] = useState<ObraConPromotor[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    listarProyectos.ejecutar().then((lista) => {
      if (!activo) return;
      setObras(lista);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [listarProyectos]);

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
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
