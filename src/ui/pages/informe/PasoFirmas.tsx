// Paso 3 del asistente — Firma.
//
// Solo firma el COORDINADOR, y es obligatoria: es su prueba de presencia y lo
// que da valor legal al documento.
//
// Hubo una segunda ranura, "Recibido por", para quien recogía el informe en
// obra. Se quitó porque en la práctica nadie firmaba ahí —el coordinador está
// solo con el móvil— y su hueco salía vacío en el PDF.
//
// Decisión que se mantiene del M3: avisamos si falta la firma, pero NO
// bloqueamos desde aquí; de eso se encarga completitud.ts al cerrar.
//
// Truco importante: la firma a medias se guarda en estado LOCAL; en el informe
// (que se autoguarda) solo escribimos la firma COMPLETA (nombre + trazo), para
// que un firmante a medias no bloquee el autoguardado del borrador.

import { useState } from "react";
import { type PropsPaso } from "@/ui/components/asistente-informe";
import { CampoFirma } from "@/ui/components/campo-firma";
import { Card } from "@/ui/components/card";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";

export function PasoFirmas({ informe, actualizar }: PropsPaso) {
  const guardada = (informe.firmas ?? []).find((f) => f.rol === "coordinador");
  const [local, setLocal] = useState({
    nombre: guardada?.nombre ?? "",
    firma: guardada?.firma ?? "",
  });

  function actualizarFirma(cambios: Partial<{ nombre: string; firma: string }>) {
    const siguiente = { ...local, ...cambios };
    setLocal(siguiente);

    // En el informe solo va la firma COMPLETA (nombre + trazo).
    const completa = siguiente.nombre.trim() && siguiente.firma;
    actualizar({
      firmas: completa
        ? [{ nombre: siguiente.nombre.trim(), rol: "coordinador", firma: siguiente.firma }]
        : [],
    });
  }

  const falta = !(local.nombre.trim() && local.firma);

  return (
    <div className="space-y-4">
      {falta && (
        <p className="rounded-md bg-secondary px-4 py-2 text-[16px] text-warning">
          Falta tu firma para poder cerrar el informe. Puedes guardar el borrador
          igualmente.
        </p>
      )}

      <Card className="space-y-3 p-4">
        <p className="text-[18px] font-semibold">Firma del coordinador</p>

        <div className="space-y-1.5">
          <Label htmlFor="firma-coordinador-nombre" className="text-[16px] font-semibold">
            Nombre de quien firma
          </Label>
          <Input
            id="firma-coordinador-nombre"
            value={local.nombre}
            onChange={(e) => actualizarFirma({ nombre: e.target.value })}
            className="h-[52px] text-[18px]"
          />
        </div>

        <CampoFirma
          valor={local.firma || undefined}
          onChange={(firma) => actualizarFirma({ firma: firma ?? "" })}
        />
      </Card>
    </div>
  );
}
