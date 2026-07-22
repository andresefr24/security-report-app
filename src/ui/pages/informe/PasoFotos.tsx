// Paso 2 del wizard — Fotos.
//
// Abre la cámara en el móvil (input file con capture), reduce cada foto al
// capturarla (comprimir-foto) y la guarda como dataURL en el informe. Rejilla de
// miniaturas con opción de borrar.

import { useRef, useState } from "react";
import { type PropsPaso } from "@/ui/components/asistente-informe";
import { nuevoId } from "@/domain/shared/id";
import { comprimirFoto } from "@/ui/pages/informe/comprimir-foto";
import { Button } from "@/ui/components/button";

export function PasoFotos({ informe, actualizar }: PropsPaso) {
  const fotos = informe.fotos ?? [];
  const inputRef = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alElegir(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    // Limpiamos el input para poder volver a elegir la misma foto si hace falta.
    evento.target.value = "";
    if (!archivo) return;

    setProcesando(true);
    setError(null);
    try {
      const imagen = await comprimirFoto(archivo);
      actualizar({ fotos: [...fotos, { id: nuevoId(), imagen }] });
    } catch {
      setError("No se pudo procesar la foto. Inténtalo de nuevo.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        aria-label="Seleccionar foto"
        onChange={alElegir}
        className="hidden"
      />

      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={procesando}
        className="h-[52px] w-full text-[18px]"
      >
        {procesando ? "Procesando…" : "Añadir foto"}
      </Button>

      {error && <p className="text-[15px] text-destructive">{error}</p>}

      {fotos.length === 0 ? (
        <p className="text-[18px] text-muted-foreground">Aún no has añadido fotos.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {fotos.map((foto) => (
            <li key={foto.id} className="space-y-2">
              <img
                src={foto.imagen}
                alt="Foto de la visita"
                className="aspect-square w-full rounded-md object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => actualizar({ fotos: fotos.filter((f) => f.id !== foto.id) })}
                className="h-[52px] w-full text-[18px]"
              >
                Borrar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
