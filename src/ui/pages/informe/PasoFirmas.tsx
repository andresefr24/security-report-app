// Paso del wizard — Firmas.
//
// Modelo v2: solo hay dos firmas posibles, como en los 8 informes reales.
//  - La del COORDINADOR, obligatoria: es su prueba de presencia.
//  - La de QUIEN RECIBE el informe en obra, opcional: puede no haber nadie ese día.
//
// Desapareció la regla "cada subcontrata con incumplimiento tiene que firmar"
// (y con ella firmantesRequeridos): no existe en ningún informe real.
// Ver docs/decisions.md#d9-informe-v2.
//
// Decisión que se mantiene del M3: avisamos de la firma obligatoria si falta, pero
// NO bloqueamos "Finalizar" desde aquí — de eso se encarga completitud.ts al cerrar.
//
// Truco importante: las firmas a medias se guardan en estado LOCAL; en el informe
// (que se autoguarda) solo escribimos las firmas COMPLETAS (nombre + trazo), para
// que un firmante a medias no bloquee el autoguardado del borrador.

import { useState } from "react";
import { type PropsPaso } from "@/ui/components/asistente-informe";
import { type FirmaInforme, type RolFirmante } from "@/domain/informe/informe";
import { CampoFirma } from "@/ui/components/campo-firma";
import { Card } from "@/ui/components/card";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";

interface Ranura {
  rol: RolFirmante;
  etiqueta: string;
  /** Texto corto para el aviso de firmas que faltan. */
  resumen: string;
  obligatoria: boolean;
}

const RANURAS: Ranura[] = [
  {
    rol: "coordinador",
    etiqueta: "Firma del coordinador",
    resumen: "el coordinador",
    obligatoria: true,
  },
  {
    rol: "recibido",
    etiqueta: "Recibido por (opcional)",
    resumen: "quien recibe el informe",
    obligatoria: false,
  },
];

export function PasoFirmas({ informe, actualizar }: PropsPaso) {
  // Estado local: la firma en curso de cada ranura (nombre + trazo).
  const [local, setLocal] = useState<Record<string, { nombre: string; firma: string }>>(() => {
    const inicial: Record<string, { nombre: string; firma: string }> = {};
    for (const f of informe.firmas ?? []) inicial[f.rol] = { nombre: f.nombre, firma: f.firma };
    return inicial;
  });

  function actualizarRanura(rol: RolFirmante, cambios: Partial<{ nombre: string; firma: string }>) {
    const actual = local[rol] ?? { nombre: "", firma: "" };
    const siguiente = { ...local, [rol]: { ...actual, ...cambios } };
    setLocal(siguiente);

    // En el informe solo van las firmas COMPLETAS (nombre + trazo).
    const completas: FirmaInforme[] = RANURAS.filter((r) => {
      const v = siguiente[r.rol];
      return v && v.nombre.trim() && v.firma;
    }).map((r) => ({
      nombre: siguiente[r.rol].nombre.trim(),
      rol: r.rol,
      firma: siguiente[r.rol].firma,
    }));
    actualizar({ firmas: completas });
  }

  const faltan = RANURAS.filter(
    (r) => r.obligatoria && !(local[r.rol]?.nombre.trim() && local[r.rol]?.firma),
  );

  return (
    <div className="space-y-4">
      {faltan.length > 0 && (
        <p className="rounded-md bg-secondary px-4 py-2 text-[16px] text-warning">
          Faltan firmas obligatorias: {faltan.map((r) => r.resumen).join(", ")}. Puedes
          guardar el borrador igualmente.
        </p>
      )}

      {RANURAS.map((ranura) => {
        const valor = local[ranura.rol] ?? { nombre: "", firma: "" };
        return (
          <Card key={ranura.rol} className="space-y-3 p-4">
            <p className="text-[18px] font-semibold">{ranura.etiqueta}</p>

            <div className="space-y-1.5">
              <Label htmlFor={`firma-${ranura.rol}-nombre`} className="text-[16px] font-semibold">
                Nombre de quien firma
              </Label>
              <Input
                id={`firma-${ranura.rol}-nombre`}
                value={valor.nombre}
                onChange={(e) => actualizarRanura(ranura.rol, { nombre: e.target.value })}
                className="h-[52px] text-[18px]"
              />
            </div>

            <CampoFirma
              valor={valor.firma || undefined}
              onChange={(firma) => actualizarRanura(ranura.rol, { firma: firma ?? "" })}
            />
          </Card>
        );
      })}
    </div>
  );
}
