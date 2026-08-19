// Paso 2 del asistente — Situación y observaciones. El cuerpo del informe.
//
// Cada OBSERVACIÓN es lo que en el documento sale como "OBSERVACIÓN 1 · <título>"
// con su etiqueta de color: un titular corto, dónde fue, qué pasó, en qué estado
// está, y sus fotos con comentario.
//
// El ESTADO se elige con tres botones y no se teclea nunca: la app pone la
// etiqueta y el color. Son los tres que usan en sus informes de verdad
// (docs/plan-informe-ajustes-fases.md, Fase B).
//
// Para finalizar hace falta al menos una observación CON TÍTULO (completitud.ts);
// el resto de campos nunca bloquean.

import { type PropsPaso } from "@/ui/components/asistente-informe";
import { type Observacion } from "@/domain/informe/informe";
import { nuevoId } from "@/domain/shared/id";
import { CampoFotos } from "@/ui/pages/informe/campo-fotos";
import { ESTADOS } from "@/ui/pages/informe/estados-observacion";
import { Button } from "@/ui/components/button";
import { Card } from "@/ui/components/card";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { Textarea } from "@/ui/components/textarea";
import { cn } from "@/lib/utils";

export function PasoObservaciones({ informe, actualizar }: PropsPaso) {
  const observaciones = informe.observaciones ?? [];

  function cambiar(id: string, parcial: Partial<Observacion>) {
    actualizar({
      observaciones: observaciones.map((o) => (o.id === id ? { ...o, ...parcial } : o)),
    });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <Label htmlFor="resumenSemana" className="text-[16px] font-semibold">
          Calendario de la semana (opcional)
        </Label>
        <p className="text-[15px] text-muted-foreground">
          Los días que visitaste y qué se estaba haciendo. Por ejemplo: «Semana del
          3 al 7 de agosto…».
        </p>
        <Textarea
          id="resumenSemana"
          value={informe.resumenSemana ?? ""}
          onChange={(e) => actualizar({ resumenSemana: e.target.value })}
          rows={3}
          className="text-[18px]"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="situacion" className="text-[16px] font-semibold">
          Situación general de la obra (opcional)
        </Label>
        <p className="text-[15px] text-muted-foreground">
          Cómo está la obra en conjunto. Si solo vas a contar observaciones
          sueltas, puedes dejarlo en blanco.
        </p>
        <Textarea
          id="situacion"
          value={informe.situacion ?? ""}
          onChange={(e) => actualizar({ situacion: e.target.value })}
          rows={4}
          className="text-[18px]"
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-[18px] font-semibold">Observaciones</p>
          <p className="text-[15px] text-muted-foreground">
            Una por cada cosa que quieras dejar por escrito. Necesitas al menos
            una, con su título, para poder cerrar el informe.
          </p>
        </div>

        {observaciones.length === 0 && (
          <p className="text-[18px] text-muted-foreground">Aún no has añadido observaciones.</p>
        )}

        {observaciones.map((observacion, indice) => (
          <Card key={observacion.id} className="space-y-4 p-4">
            <p className="text-[18px] font-semibold">Observación {indice + 1}</p>

            <div className="space-y-1.5">
              <Label
                htmlFor={`observacion-${observacion.id}-titulo`}
                className="text-[16px] font-semibold"
              >
                Título
              </Label>
              <p className="text-[15px] text-muted-foreground">
                En pocas palabras, qué has visto. Por ejemplo: «Grupo electrógeno
                sin medios de extinción cercanos».
              </p>
              <Input
                id={`observacion-${observacion.id}-titulo`}
                value={observacion.titulo ?? ""}
                onChange={(e) => cambiar(observacion.id, { titulo: e.target.value })}
                className="h-[52px] text-[18px]"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="pb-1 text-[16px] font-semibold">Estado</legend>
              {ESTADOS.map(({ valor, pinta }) => {
                const elegido = observacion.estado === valor;
                return (
                  <Button
                    key={valor}
                    type="button"
                    variant="outline"
                    aria-pressed={elegido}
                    // Volver a pulsar el que ya está elegido lo quita: el estado
                    // es opcional y no queremos dejarles sin marcha atrás.
                    onClick={() =>
                      cambiar(observacion.id, { estado: elegido ? undefined : valor })
                    }
                    className={cn(
                      "h-[52px] w-full text-[18px]",
                      elegido && `border-2 font-semibold ${pinta.clases}`,
                    )}
                  >
                    {pinta.etiqueta}
                  </Button>
                );
              })}
            </fieldset>

            <div className="space-y-1.5">
              <Label
                htmlFor={`observacion-${observacion.id}-ubicacion`}
                className="text-[16px] font-semibold"
              >
                Dónde (opcional)
              </Label>
              <Input
                id={`observacion-${observacion.id}-ubicacion`}
                value={observacion.ubicacion ?? ""}
                onChange={(e) => cambiar(observacion.id, { ubicacion: e.target.value })}
                className="h-[52px] text-[18px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor={`observacion-${observacion.id}-descripcion`}
                className="text-[16px] font-semibold"
              >
                Explicación (opcional)
              </Label>
              <Textarea
                id={`observacion-${observacion.id}-descripcion`}
                value={observacion.descripcion ?? ""}
                onChange={(e) => cambiar(observacion.id, { descripcion: e.target.value })}
                rows={5}
                className="text-[18px]"
              />
            </div>

            <CampoFotos
              fotos={observacion.fotos ?? []}
              onChange={(fotos) => cambiar(observacion.id, { fotos })}
              idPrefijo={`observacion-${observacion.id}`}
              numeroActividad={indice + 1}
            />

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                actualizar({
                  observaciones: observaciones.filter((o) => o.id !== observacion.id),
                })
              }
              className="h-[52px] w-full text-[18px]"
            >
              Quitar observación {indice + 1}
            </Button>
          </Card>
        ))}

        <Button
          type="button"
          onClick={() => actualizar({ observaciones: [...observaciones, { id: nuevoId() }] })}
          className="h-[52px] w-full text-[18px]"
        >
          Añadir observación
        </Button>
      </div>
    </div>
  );
}
