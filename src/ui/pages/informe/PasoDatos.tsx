// Paso 1 del asistente — Datos de la visita.
//
// Solo la fecha y la hora, que vienen puestas del borrador y aquí se pueden
// corregir.
//
// Antes también pedía quién recibía el informe (nombre y empresa), pero los
// coordinadores lo quitaron: ese dato ya sale del promotor y de la obra, y quien
// recibe el informe en mano se recoge donde tiene sentido, al firmar.

import { type PropsPaso } from "@/ui/components/asistente-informe";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";

export function PasoDatos({ informe, actualizar }: PropsPaso) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="fechaHora" className="text-[16px] font-semibold">
          Fecha y hora de la visita
        </Label>
        <Input
          id="fechaHora"
          type="datetime-local"
          value={informe.fechaHora ?? ""}
          onChange={(e) => actualizar({ fechaHora: e.target.value })}
          className="h-[52px] text-[18px]"
        />
      </div>
    </div>
  );
}
