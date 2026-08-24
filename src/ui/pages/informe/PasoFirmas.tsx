// Paso 3 del asistente — Firmas.
//
// Dos cajas: la del COORDINADOR (obligatoria para cerrar: es su prueba de
// presencia y lo que da valor legal al documento) y la de QUIEN RECIBE el
// informe en obra, opcional.
//
// En las dos, lo mismo:
//  - El nombre es OPCIONAL. Muchas firmas se leen solas, y obligar a teclear un
//    nombre de pie en mitad de una obra era una barrera.
//  - Se puede firmar A MANO sobre el recuadro o SUBIR UNA FOTO de la firma, que
//    es como consiguen las firmas digitales que ya tienen guardadas.
//
// Decisión que se mantiene del M3: avisamos si falta la del coordinador, pero
// NO bloqueamos desde aquí; de eso se encarga completitud.ts al cerrar.

import { useRef, useState } from "react";
import { type PropsPaso } from "@/ui/components/asistente-informe";
import { type FirmaInforme, type RolFirmante } from "@/domain/informe/informe";
import { comprimirFoto } from "@/ui/pages/informe/comprimir-foto";
import { CampoFirma } from "@/ui/components/campo-firma";
import { Button } from "@/ui/components/button";
import { Card } from "@/ui/components/card";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";

interface Ranura {
  rol: RolFirmante;
  etiqueta: string;
  obligatoria: boolean;
}

const RANURAS: Ranura[] = [
  { rol: "coordinador", etiqueta: "Firma del coordinador", obligatoria: true },
  { rol: "recibido", etiqueta: "Recibido por (opcional)", obligatoria: false },
];

/** Una caja de firma: nombre opcional, y firma dibujada o subida como foto. */
function CajaDeFirma({
  ranura,
  valor,
  onChange,
}: {
  ranura: Ranura;
  valor: { nombre: string; firma: string };
  onChange: (cambios: Partial<{ nombre: string; firma: string }>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Una firma subida como foto no se puede repintar en el recuadro de dibujo,
  // así que se enseña tal cual, como imagen.
  const [esFoto, setEsFoto] = useState(false);

  async function alSubirFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;

    setSubiendo(true);
    setError(null);
    try {
      onChange({ firma: await comprimirFoto(archivo) });
      setEsFoto(true);
    } catch {
      setError("No se pudo procesar la imagen. Inténtalo de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <Card className="space-y-3 p-4">
      <p className="text-[18px] font-semibold">{ranura.etiqueta}</p>

      <div className="space-y-1.5">
        <Label htmlFor={`firma-${ranura.rol}-nombre`} className="text-[16px] font-semibold">
          Nombre de quien firma (opcional)
        </Label>
        <Input
          id={`firma-${ranura.rol}-nombre`}
          value={valor.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          className="h-[52px] text-[18px]"
        />
      </div>

      {esFoto && valor.firma ? (
        <div className="space-y-2">
          <img
            src={valor.firma}
            alt={`Firma de ${ranura.etiqueta}`}
            className="max-h-40 w-auto rounded-md border border-border bg-white p-2"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setEsFoto(false);
              onChange({ firma: "" });
            }}
            className="h-[52px] w-full text-[18px]"
          >
            Quitar la foto y firmar a mano
          </Button>
        </div>
      ) : (
        <CampoFirma
          valor={valor.firma || undefined}
          onChange={(firma) => onChange({ firma: firma ?? "" })}
        />
      )}

      {error && <p className="text-[15px] text-destructive">{error}</p>}

      {!esFoto && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            aria-label={`Subir foto de la firma de ${ranura.etiqueta}`}
            onChange={alSubirFoto}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            className="h-[52px] w-full text-[18px]"
          >
            {subiendo ? "Procesando…" : "O subir una foto de la firma"}
          </Button>
        </>
      )}
    </Card>
  );
}

export function PasoFirmas({ informe, actualizar }: PropsPaso) {
  // Las firmas a medias viven en estado LOCAL; en el informe (que se autoguarda)
  // solo se escriben las que tienen imagen, para que un firmante a medias no
  // bloquee el autoguardado del borrador.
  const [local, setLocal] = useState<Record<string, { nombre: string; firma: string }>>(() => {
    const inicial: Record<string, { nombre: string; firma: string }> = {};
    for (const f of informe.firmas ?? []) {
      inicial[f.rol] = { nombre: f.nombre ?? "", firma: f.firma };
    }
    return inicial;
  });

  function actualizarRanura(rol: RolFirmante, cambios: Partial<{ nombre: string; firma: string }>) {
    const actual = local[rol] ?? { nombre: "", firma: "" };
    const siguiente = { ...local, [rol]: { ...actual, ...cambios } };
    setLocal(siguiente);

    // Lo que hace que una firma exista es la IMAGEN, no el nombre.
    const firmas: FirmaInforme[] = RANURAS.filter((r) => siguiente[r.rol]?.firma).map((r) => ({
      nombre: siguiente[r.rol].nombre.trim() || undefined,
      rol: r.rol,
      firma: siguiente[r.rol].firma,
    }));
    actualizar({ firmas });
  }

  const faltaLaObligatoria = !local.coordinador?.firma;

  return (
    <div className="space-y-4">
      {faltaLaObligatoria && (
        <p className="rounded-md bg-secondary px-4 py-2 text-[16px] text-warning">
          Falta tu firma para poder cerrar el informe. Puedes guardar el borrador
          igualmente.
        </p>
      )}

      {RANURAS.map((ranura) => (
        <CajaDeFirma
          key={ranura.rol}
          ranura={ranura}
          valor={local[ranura.rol] ?? { nombre: "", firma: "" }}
          onChange={(cambios) => actualizarRanura(ranura.rol, cambios)}
        />
      ))}
    </div>
  );
}
