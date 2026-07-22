// Paso 3 del wizard — Contenido.
//
// La BISAGRA del producto. En el 1.1 el coordinador escribe a mano el cuerpo del
// informe; en el 1.2 lo rellenará la voz + IA. Por eso este paso es "tonto" a
// propósito: solo lee y escribe `informe.contenido`, sin saber de dónde sale ese
// texto. Cuando llegue la IA, rellenará el mismo campo desde fuera y este paso no
// cambia. Ver la trampa del M3 en docs/tasks-f1-draft.md.

import { type PropsPaso } from "@/ui/components/asistente-informe";
import { Label } from "@/ui/components/label";
import { Textarea } from "@/ui/components/textarea";

export function PasoContenido({ informe, actualizar }: PropsPaso) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="contenido" className="text-[16px] font-semibold">
        Contenido del informe
      </Label>
      <p className="text-[15px] text-muted-foreground">
        Describe la visita: qué revisaste, cómo estaba la obra, las medidas de
        seguridad y las instrucciones que diste.
      </p>
      <Textarea
        id="contenido"
        value={informe.contenido ?? ""}
        onChange={(e) => actualizar({ contenido: e.target.value })}
        rows={12}
        className="text-[18px]"
      />
    </div>
  );
}
