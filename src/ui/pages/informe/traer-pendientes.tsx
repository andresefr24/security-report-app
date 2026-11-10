// "Lo que quedó pendiente de la visita anterior" — dentro del paso 2.
//
// Las obras no se arreglan de un día para otro: lo que se señala un lunes suele
// seguir ahí el siguiente, y hasta ahora había que volver a teclearlo entero.
//
// SE ELIGE A MANO, una por una, y eso es a propósito: el informe que firma el
// coordinador afirma lo que vio ESE día. Si la app las arrastrase sola, estaría
// firmando por él que algo sigue mal sin que lo haya mirado. Por eso llegan
// desmarcadas y hay que señalar cada una.
//
// LAS FOTOS NO SE COPIAN. Una foto del día 17 metida en el informe del día 25
// parece evidencia de la visita de hoy, y no lo es; si hoy lo vuelve a ver, hace
// foto nueva. (De paso, las fotos son lo que más ocupa en el dispositivo.)
//
// Lo que sí viaja es la ANTIGÜEDAD: la observación se queda con la fecha de la
// visita donde se señaló por primera vez, y el documento la imprime. Es lo que
// hacen en sus informes de verdad, porque algo que lleva ocho días abierto no
// pesa lo mismo que algo de hoy.

import { useState } from "react";
import { type ObservacionPendiente } from "@/application/use-cases/observaciones-pendientes";
import { type Observacion } from "@/domain/informe/informe";
import { nuevoId } from "@/domain/shared/id";
import { pintaDe } from "@/ui/pages/informe/estados-observacion";
import { Button } from "@/ui/components/button";
import { Card } from "@/ui/components/card";
import { cn } from "@/lib/utils";

/** "2026-08-17T09:00" -> "17/08/2026". */
export function fechaCorta(fechaHora: string): string {
  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) return fechaHora;
  return fecha.toLocaleDateString("es", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Copia una observación pendiente para meterla en el informe de hoy.
 *
 * Id nuevo (es otra anotación, en otro documento), sin fotos, y conservando de
 * dónde viene. El estado se mantiene: sigue siendo una medida requerida hasta
 * que el coordinador la marque como subsanada hoy.
 */
export function copiarPendiente(pendiente: ObservacionPendiente): Observacion {
  const { observacion, origen } = pendiente;
  return {
    id: nuevoId(),
    titulo: observacion.titulo,
    ubicacion: observacion.ubicacion,
    descripcion: observacion.descripcion,
    estado: observacion.estado,
    vieneDe: origen,
  };
}

export interface TraerPendientesProps {
  pendientes: ObservacionPendiente[];
  /** Añade las copias al final de las observaciones del informe. */
  onTraer: (observaciones: Observacion[]) => void;
}

export function TraerPendientes({ pendientes, onTraer }: TraerPendientesProps) {
  const [elegidas, setElegidas] = useState<string[]>([]);
  // Las que ya se trajeron desaparecen de la lista: traerlas dos veces solo
  // duplicaría el bloque en el documento.
  const [traidas, setTraidas] = useState<string[]>([]);

  const quedan = pendientes.filter((p) => !traidas.includes(p.observacion.id));
  if (quedan.length === 0) return null;

  function alternar(id: string) {
    setElegidas((actuales) =>
      actuales.includes(id) ? actuales.filter((i) => i !== id) : [...actuales, id],
    );
  }

  function traer() {
    const aTraer = quedan.filter((p) => elegidas.includes(p.observacion.id));
    if (aTraer.length === 0) return;
    onTraer(aTraer.map(copiarPendiente));
    setTraidas((actuales) => [...actuales, ...aTraer.map((p) => p.observacion.id)]);
    setElegidas([]);
  }

  return (
    <Card className="space-y-4 border-warning/40 bg-warning/5 p-4">
      <div className="space-y-1">
        <p className="text-[18px] font-semibold">
          {quedan.length === 1
            ? "Quedó 1 observación sin resolver"
            : `Quedaron ${quedan.length} observaciones sin resolver`}
        </p>
        <p className="text-[16px] text-muted-foreground">
          Señala las que sigan igual hoy y se añadirán a este informe con la fecha
          en que las viste por primera vez.
        </p>
      </div>

      <ul className="space-y-3">
        {quedan.map((pendiente) => {
          const { observacion, origen } = pendiente;
          const elegida = elegidas.includes(observacion.id);
          const pinta = pintaDe(observacion.estado);

          return (
            <li key={observacion.id}>
              <Button
                type="button"
                // Elegida = RELLENA, el mismo criterio que los botones de
                // estado: con presbicia, un cambio de tono suave no se ve, y
                // aquí hay que saber de un vistazo cuáles se van a traer.
                variant={elegida ? "default" : "outline"}
                aria-pressed={elegida}
                onClick={() => alternar(observacion.id)}
                className="h-auto w-full justify-start whitespace-normal px-4 py-3 text-left"
              >
                <span className="space-y-1">
                  <span className="block text-[18px] font-semibold">
                    {elegida ? "✓ " : ""}
                    {observacion.titulo || "Observación sin título"}
                  </span>
                  {pinta && <span className="block text-[16px]">{pinta.etiqueta}</span>}
                  <span
                    className={cn("block text-[16px]", !elegida && "text-muted-foreground")}
                  >
                    Señalada el {fechaCorta(origen.fecha)}
                  </span>
                </span>
              </Button>
            </li>
          );
        })}
      </ul>

      <Button
        type="button"
        onClick={traer}
        disabled={elegidas.length === 0}
        className="h-[52px] w-full text-[18px]"
      >
        {elegidas.length === 0
          ? "Señala las que sigan pendientes"
          : elegidas.length === 1
            ? "Traer 1 observación a este informe"
            : `Traer ${elegidas.length} observaciones a este informe`}
      </Button>

      <p className="text-[15px] text-muted-foreground">
        Las fotos no se copian: si lo vuelves a ver hoy, haz foto nueva.
      </p>
    </Card>
  );
}
