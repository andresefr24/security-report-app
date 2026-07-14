// Campo de firma reutilizable (lo usará también el informe en M3).
//
// Envuelve la librería signature_pad sobre un <canvas>: permite firmar con el
// dedo o el ratón, borrar y deshacer el último trazo, y exporta la firma como
// imagen dataURL para guardarla en la entidad y, más adelante, en el PDF.
//
// Necesita un canvas REAL del navegador, así que se prueba a mano en el
// navegador (jsdom no dibuja en canvas). La lógica de React se mantiene fina.

import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";
import { Card } from "@/ui/components/card";
import { Button } from "@/ui/components/button";
import { Label } from "@/ui/components/label";

// Casi negro (token --foreground): máximo contraste, como una firma en tinta.
const COLOR_FIRMA = "#0F172A";

interface CampoFirmaProps {
  /** Firma previa (dataURL) para re-pintar al editar un perfil ya guardado. */
  valor?: string;
  /** Avisa al formulario cuando la firma cambia; undefined si queda vacía. */
  onChange: (dataURL: string | undefined) => void;
}

export function CampoFirma({ valor, onChange }: CampoFirmaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  // Guardamos onChange en un ref para no re-crear el pad en cada render.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  // Recordamos la última firma inicial (dataURL) que nos llega por props. Se
  // guarda como imagen, no como trazos: por eso hay que re-pintarla a mano al
  // redimensionar y no se puede "deshacer" trazo a trazo (ver botón Deshacer).
  const valorInicialRef = useRef(valor);
  valorInicialRef.current = valor;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pad = new SignaturePad(canvas, { penColor: COLOR_FIRMA });
    padRef.current = pad;

    // Un canvas tiene dos tamaños: el visual (CSS) y el de píxeles reales. Si no
    // se sincronizan escalando por devicePixelRatio, la firma sale desplazada del
    // dedo. Al redimensionar el canvas se borra, así que volvemos a pintar lo que
    // había: los trazos dibujados o, si no hay, la firma inicial (imagen).
    function ajustarTamano() {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const dibujado = pad.toData();
      canvas!.width = canvas!.offsetWidth * ratio;
      canvas!.height = canvas!.offsetHeight * ratio;
      canvas!.getContext("2d")?.scale(ratio, ratio);
      pad.clear();
      if (dibujado.length > 0) {
        pad.fromData(dibujado);
      } else if (valorInicialRef.current) {
        // Pasamos el mismo ratio para que la imagen no salga escalada de más.
        void pad.fromDataURL(valorInicialRef.current, { ratio });
      }
    }

    ajustarTamano(); // ajusta tamaño y pinta la firma inicial si la hay

    // Cada vez que se levanta el dedo, avisamos al formulario con la firma actual.
    const alTerminarTrazo = () => onChangeRef.current(pad.toDataURL());
    pad.addEventListener("endStroke", alTerminarTrazo);
    window.addEventListener("resize", ajustarTamano);

    return () => {
      pad.removeEventListener("endStroke", alTerminarTrazo);
      window.removeEventListener("resize", ajustarTamano);
      pad.off(); // desliga los listeners internos de la librería
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si la firma inicial llega DESPUÉS de montar (p. ej. cargada de forma
  // asíncrona) y el usuario aún no ha dibujado, la pintamos. No re-pinta si ya
  // hay trazos, para no borrar lo que el usuario acaba de firmar.
  useEffect(() => {
    const pad = padRef.current;
    if (!pad || !valor || !pad.isEmpty()) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    void pad.fromDataURL(valor, { ratio });
  }, [valor]);

  function borrar() {
    const pad = padRef.current;
    if (!pad) return;
    pad.clear();
    onChange(undefined);
  }

  function deshacer() {
    const pad = padRef.current;
    if (!pad) return;
    // Limitación conocida: "Deshacer" solo actúa sobre los trazos que se han
    // dibujado en esta sesión. Una firma cargada de un perfil guardado es una
    // imagen (sin trazos), así que sobre ella solo funciona "Borrar".
    const dibujado = pad.toData();
    if (dibujado.length === 0) return;
    dibujado.pop(); // quita el último trazo
    pad.fromData(dibujado);
    onChange(dibujado.length > 0 ? pad.toDataURL() : undefined);
  }

  return (
    <div className="space-y-2">
      <Label className="text-[16px] font-semibold">Firma</Label>
      <p className="text-[15px] text-muted-foreground">
        Firme con el dedo dentro del recuadro.
      </p>
      <Card className="p-2">
        {/* touch-none evita que la página haga scroll mientras se firma. */}
        <canvas
          ref={canvasRef}
          className="h-48 w-full touch-none rounded-md bg-white"
          aria-label="Zona para dibujar la firma"
        />
      </Card>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={deshacer}
          className="h-[52px] flex-1 text-[18px]"
        >
          Deshacer
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={borrar}
          className="h-[52px] flex-1 text-[18px]"
        >
          Borrar
        </Button>
      </div>
    </div>
  );
}
