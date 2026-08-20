// El logotipo de un promotor: subirlo, verlo y quitarlo.
//
// Es opcional: la mayoría de promotores no tendrán logo a mano, y el informe
// sale perfectamente sin él. Cuando lo hay, va a la izquierda del título en la
// cabecera del PDF.
//
// Reduce la imagen al subirla con la misma pieza que las fotos de la visita
// (comprimir-foto), para no meter un archivo de dos megas en el dispositivo.

import { useRef, useState } from "react";
import { comprimirFoto } from "@/ui/pages/informe/comprimir-foto";
import { Button } from "@/ui/components/button";
import { Label } from "@/ui/components/label";

export interface CampoLogoProps {
  valor?: string;
  onChange: (logo: string | undefined) => void;
}

export function CampoLogo({ valor, onChange }: CampoLogoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alElegir(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;

    setProcesando(true);
    setError(null);
    try {
      onChange(await comprimirFoto(archivo));
    } catch {
      setError("No se pudo procesar la imagen. Inténtalo de nuevo.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-[16px] font-semibold">Logotipo (opcional)</Label>
      <p className="text-[15px] text-muted-foreground">
        Si lo tienes, saldrá en la cabecera de los informes de sus obras.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="Seleccionar logotipo"
        onChange={alElegir}
        className="hidden"
      />

      {valor && (
        <img
          src={valor}
          alt="Logotipo del promotor"
          className="max-h-24 w-auto rounded-md border border-border bg-white p-2"
        />
      )}

      {error && <p className="text-[15px] text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={procesando}
          className="h-[52px] flex-1 text-[18px]"
        >
          {procesando ? "Procesando…" : valor ? "Cambiar logotipo" : "Añadir logotipo"}
        </Button>
        {valor && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => onChange(undefined)}
            className="h-[52px] flex-1 text-[18px]"
          >
            Quitar
          </Button>
        )}
      </div>
    </div>
  );
}
