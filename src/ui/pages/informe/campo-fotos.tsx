// Las fotos de una actividad: añadir, comentar y borrar.
//
// Nació como el paso "Fotos" del asistente viejo. En el modelo v2 las fotos ya no
// cuelgan del informe sino de CADA ACTIVIDAD, así que esto pasó a ser una pieza
// reutilizable que se pinta dentro de la actividad y no sabe nada del wizard:
// recibe sus fotos y avisa de los cambios.
//
// Se puede añadir DESDE LA CÁMARA O DESDE LA GALERÍA: el input no lleva `capture`
// (con él, el móvil abre la cámara directamente y no da acceso al carrete).
// Cada foto se reduce al añadirla (comprimir-foto) y se guarda como dataURL.
//
// El COMENTARIO es el texto que va debajo de la foto en el PDF, como en los
// informes reales. Es opcional y nunca bloquea nada.

import { useRef, useState } from "react";
import { type Foto } from "@/domain/informe/informe";
import { nuevoId } from "@/domain/shared/id";
import { comprimirFoto } from "@/ui/pages/informe/comprimir-foto";
import { Button } from "@/ui/components/button";
import { Label } from "@/ui/components/label";
import { Textarea } from "@/ui/components/textarea";

export interface CampoFotosProps {
  fotos: Foto[];
  onChange: (fotos: Foto[]) => void;
  /** Distingue los identificadores cuando hay varias actividades en pantalla. */
  idPrefijo: string;
  /** Para los textos: "Foto 1 de la actividad 2". */
  numeroActividad: number;
}

export function CampoFotos({ fotos, onChange, idPrefijo, numeroActividad }: CampoFotosProps) {
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
      onChange([...fotos, { id: nuevoId(), imagen }]);
    } catch {
      setError("No se pudo procesar la foto. Inténtalo de nuevo.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label={`Seleccionar foto de la actividad ${numeroActividad}`}
        onChange={alElegir}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={procesando}
        className="h-[52px] w-full text-[18px]"
      >
        {procesando ? "Procesando…" : "Añadir foto"}
      </Button>

      {error && <p className="text-[15px] text-destructive">{error}</p>}

      {fotos.map((foto, indice) => (
        <div key={foto.id} className="space-y-2">
          <img
            src={foto.imagen}
            alt={`Foto ${indice + 1} de la actividad ${numeroActividad}`}
            className="w-full rounded-md object-cover"
          />

          <Label
            htmlFor={`${idPrefijo}-comentario-${foto.id}`}
            className="text-[16px] font-semibold"
          >
            Comentario de la foto {indice + 1} (opcional)
          </Label>
          <Textarea
            id={`${idPrefijo}-comentario-${foto.id}`}
            value={foto.comentario ?? ""}
            onChange={(e) =>
              onChange(
                fotos.map((f) => (f.id === foto.id ? { ...f, comentario: e.target.value } : f)),
              )
            }
            rows={3}
            className="text-[18px]"
          />

          <Button
            type="button"
            variant="secondary"
            onClick={() => onChange(fotos.filter((f) => f.id !== foto.id))}
            className="h-[52px] w-full text-[18px]"
          >
            Borrar foto {indice + 1}
          </Button>
        </div>
      ))}
    </div>
  );
}
