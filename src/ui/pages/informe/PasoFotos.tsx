// Paso 2 del wizard — Fotos.
//
// Permite añadir fotos DESDE LA CÁMARA O DESDE LA GALERÍA: el input no lleva
// `capture`, así el móvil ofrece las dos opciones (con `capture` iba directo a la
// cámara y el coordinador no podía subir fotos hechas antes). Cada foto se reduce
// al añadirla (comprimir-foto) y se guarda como dataURL en el informe.
//
// Cada foto lleva su COMENTARIO, el texto que va debajo de ella en el PDF, como
// en los informes reales. Es opcional y nunca bloquea nada.
//
// Se listan de una en una (no en rejilla) porque cada una necesita su caja de
// texto y los usuarios tienen presbicia: mejor grande y en vertical.

import { useRef, useState } from "react";
import { type PropsPaso } from "@/ui/components/asistente-informe";
import { nuevoId } from "@/domain/shared/id";
import { comprimirFoto } from "@/ui/pages/informe/comprimir-foto";
import { Button } from "@/ui/components/button";
import { Label } from "@/ui/components/label";
import { Textarea } from "@/ui/components/textarea";

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

  function cambiarComentario(id: string, comentario: string) {
    actualizar({
      fotos: fotos.map((foto) => (foto.id === id ? { ...foto, comentario } : foto)),
    });
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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

      <p className="text-[15px] text-muted-foreground">
        Puedes hacer la foto en el momento o elegir una que ya tengas guardada.
      </p>

      {error && <p className="text-[15px] text-destructive">{error}</p>}

      {fotos.length === 0 ? (
        <p className="text-[18px] text-muted-foreground">Aún no has añadido fotos.</p>
      ) : (
        <ul className="space-y-6">
          {fotos.map((foto, indice) => (
            <li key={foto.id} className="space-y-2">
              <img
                src={foto.imagen}
                alt={`Foto ${indice + 1} de la visita`}
                className="w-full rounded-md object-cover"
              />

              <Label htmlFor={`comentario-${foto.id}`} className="text-[16px] font-semibold">
                Comentario de la foto {indice + 1} (opcional)
              </Label>
              <Textarea
                id={`comentario-${foto.id}`}
                value={foto.comentario ?? ""}
                onChange={(e) => cambiarComentario(foto.id, e.target.value)}
                rows={3}
                className="text-[18px]"
              />

              <Button
                type="button"
                variant="secondary"
                onClick={() => actualizar({ fotos: fotos.filter((f) => f.id !== foto.id) })}
                className="h-[52px] w-full text-[18px]"
              >
                Borrar foto {indice + 1}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
