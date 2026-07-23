// Paso 4 del wizard — Incumplimientos.
//
// Registra los incumplimientos detectados, cada uno imputado a una subcontrata.
// Este paso SOLO los anota; la regla "una subcontrata con incumplimiento tiene
// que firmar" se calcula en el dominio (firmantesRequeridos) y se aplica en el
// paso de firmas. Así cada paso queda independiente y la regla vive en un sitio.

import { type PropsPaso } from "@/ui/components/asistente-informe";
import { type Incumplimiento } from "@/domain/informe/informe";
import { nuevoId } from "@/domain/shared/id";
import { Card } from "@/ui/components/card";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { Textarea } from "@/ui/components/textarea";
import { Button } from "@/ui/components/button";

export function PasoIncumplimientos({ informe, actualizar }: PropsPaso) {
  const incumplimientos = informe.incumplimientos ?? [];

  function cambiar(indice: number, parcial: Partial<Incumplimiento>) {
    actualizar({
      incumplimientos: incumplimientos.map((inc, i) =>
        i === indice ? { ...inc, ...parcial } : inc,
      ),
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-[18px] text-muted-foreground">
        Anota lo que no cumplía y de qué subcontrata era. Si anotas alguno, esa
        subcontrata tendrá que firmar el informe.
      </p>

      {incumplimientos.length === 0 && (
        <p className="text-[18px]">No has anotado incumplimientos.</p>
      )}

      {incumplimientos.map((incumplimiento, indice) => (
        <Card key={incumplimiento.id} className="space-y-3 p-4">
          <div className="space-y-1.5">
            <Label htmlFor={`inc-${indice}-subcontrata`} className="text-[16px] font-semibold">
              Subcontrata afectada
            </Label>
            <Input
              id={`inc-${indice}-subcontrata`}
              value={incumplimiento.subcontrata}
              onChange={(e) => cambiar(indice, { subcontrata: e.target.value })}
              className="h-[52px] text-[18px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`inc-${indice}-descripcion`} className="text-[16px] font-semibold">
              Descripción
            </Label>
            <Textarea
              id={`inc-${indice}-descripcion`}
              value={incumplimiento.descripcion}
              onChange={(e) => cambiar(indice, { descripcion: e.target.value })}
              rows={4}
              className="text-[18px]"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              actualizar({ incumplimientos: incumplimientos.filter((_, i) => i !== indice) })
            }
            className="h-[52px] w-full text-[18px]"
          >
            Quitar incumplimiento
          </Button>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          actualizar({
            incumplimientos: [
              ...incumplimientos,
              { id: nuevoId(), subcontrata: "", descripcion: "" },
            ],
          })
        }
        className="h-[52px] w-full text-[18px]"
      >
        Añadir incumplimiento
      </Button>
    </div>
  );
}
