// Paso 5 del wizard — Firmas.
//
// Muestra una "ranura" de firma por cada firmante:
//  - el coordinador (siempre),
//  - cada persona que atiende la visita (paso 1), por la contrata,
//  - cada subcontrata con incumplimiento (regla del dominio, firmantesRequeridos).
//
// Decisión del M3: avisamos de las firmas obligatorias que falten, pero NO
// bloqueamos "Finalizar" — el informe se cierra como borrador y la exigencia
// dura de "todo firmado" va con el PDF (M4).
//
// Truco importante: las firmas a medias se guardan en estado LOCAL; en el informe
// (que se autoguarda) solo escribimos las firmas COMPLETAS (nombre + trazo), para
// que un firmante a medias no bloquee el autoguardado del borrador.

import { useState } from "react";
import { type PropsPaso } from "@/ui/components/asistente-informe";
import { type FirmaInforme, type RolFirmante } from "@/domain/informe/informe";
import { firmantesRequeridos } from "@/domain/informe/firmantes";
import { CampoFirma } from "@/ui/components/campo-firma";
import { Card } from "@/ui/components/card";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";

interface Ranura {
  clave: string;
  etiqueta: string;
  rol: RolFirmante;
  subcontrata?: string;
  /** Para las personas que atienden: su nombre ya viene del paso 1 (no se teclea). */
  nombreFijo?: string;
  /** ¿Es una firma legalmente obligatoria (coordinador o subcontrata)? */
  obligatoria: boolean;
}

/** Clave con la que una firma guardada se asocia a su ranura. */
function claveDeFirma(firma: FirmaInforme): string {
  if (firma.rol === "coordinador") return "coordinador";
  if (firma.rol === "subcontrata") return `sub:${firma.subcontrata ?? ""}`;
  return `atiende:${firma.nombre}`;
}

export function PasoFirmas({ informe, actualizar }: PropsPaso) {
  const requeridos = firmantesRequeridos(informe);
  const personas = informe.personasAtienden ?? [];

  const ranuras: Ranura[] = [
    ...requeridos.map<Ranura>((req) =>
      req.rol === "coordinador"
        ? { clave: "coordinador", etiqueta: "Firma del coordinador", rol: "coordinador", obligatoria: true }
        : {
            clave: `sub:${req.subcontrata}`,
            etiqueta: `Firma de la subcontrata ${req.subcontrata}`,
            rol: "subcontrata",
            subcontrata: req.subcontrata,
            obligatoria: true,
          },
    ),
    ...personas
      .filter((p) => p.nombre.trim())
      .map<Ranura>((p) => ({
        clave: `atiende:${p.nombre}`,
        etiqueta: `Firma de ${p.nombre} (atiende la visita)`,
        rol: "contratista",
        nombreFijo: p.nombre,
        obligatoria: false,
      })),
  ];

  // Estado local: la firma en curso de cada ranura (nombre + trazo).
  const [local, setLocal] = useState<Record<string, { nombre: string; firma: string }>>(() => {
    const inicial: Record<string, { nombre: string; firma: string }> = {};
    for (const f of informe.firmas ?? []) inicial[claveDeFirma(f)] = { nombre: f.nombre, firma: f.firma };
    return inicial;
  });

  function actualizarRanura(ranura: Ranura, cambios: Partial<{ nombre: string; firma: string }>) {
    const actual = local[ranura.clave] ?? { nombre: ranura.nombreFijo ?? "", firma: "" };
    const siguiente = { ...local, [ranura.clave]: { ...actual, ...cambios } };
    setLocal(siguiente);

    // En el informe solo van las firmas COMPLETAS (nombre + trazo).
    const completas: FirmaInforme[] = ranuras
      .filter((r) => {
        const v = siguiente[r.clave];
        return v && v.nombre.trim() && v.firma;
      })
      .map((r) => {
        const v = siguiente[r.clave];
        return { nombre: v.nombre.trim(), rol: r.rol, firma: v.firma, subcontrata: r.subcontrata };
      });
    actualizar({ firmas: completas });
  }

  const faltan = ranuras.filter(
    (r) => r.obligatoria && !(local[r.clave]?.nombre.trim() && local[r.clave]?.firma),
  );

  return (
    <div className="space-y-4">
      {faltan.length > 0 && (
        <p className="rounded-md bg-secondary px-4 py-2 text-[16px] text-warning">
          Faltan firmas obligatorias: {faltan.map((r) => r.etiqueta.replace("Firma de ", "")).join(", ")}.
          Puedes guardar el borrador igualmente.
        </p>
      )}

      {ranuras.map((ranura) => {
        const valor = local[ranura.clave] ?? { nombre: ranura.nombreFijo ?? "", firma: "" };
        return (
          <Card key={ranura.clave} className="space-y-3 p-4">
            <p className="text-[18px] font-semibold">{ranura.etiqueta}</p>

            {!ranura.nombreFijo && (
              <div className="space-y-1.5">
                <Label htmlFor={`firma-${ranura.clave}-nombre`} className="text-[16px] font-semibold">
                  Nombre de quien firma
                </Label>
                <Input
                  id={`firma-${ranura.clave}-nombre`}
                  value={valor.nombre}
                  onChange={(e) => actualizarRanura(ranura, { nombre: e.target.value })}
                  className="h-[52px] text-[18px]"
                />
              </div>
            )}

            <CampoFirma
              valor={valor.firma || undefined}
              onChange={(firma) => actualizarRanura(ranura, { firma: firma ?? "" })}
            />
          </Card>
        );
      })}
    </div>
  );
}
