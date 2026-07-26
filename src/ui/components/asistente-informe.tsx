// Contenedor del asistente (wizard) del informe — la columna vertebral de los 5 pasos.
//
// Gestiona la mecánica COMÚN sin saber qué hay dentro de cada paso: barra de
// progreso, botones Atrás/Siguiente/Finalizar, autoguardado al cambiar de paso,
// banda "Sin conexión" y retomar el borrador donde se dejó. Cada paso es un
// módulo independiente que recibe el informe y una forma de actualizarlo.

import { useEffect, useState, type ReactNode } from "react";
import { type DatosInforme } from "@/domain/informe/informe";
import { type GuardarInforme } from "@/application/use-cases/guardar-informe";
import { type ObtenerInforme } from "@/application/use-cases/obtener-informe";
import { type Id } from "@/domain/shared/id";
import { Button } from "@/ui/components/button";
import { Progress } from "@/ui/components/progress";

/** Lo que recibe cada paso para pintar sus campos y devolver sus cambios. */
export interface PropsPaso {
  informe: DatosInforme;
  /** Mezcla cambios en el informe (se guardarán al cambiar de paso). */
  actualizar: (parcial: Partial<DatosInforme>) => void;
}

export interface PasoWizard {
  titulo: string;
  contenido: (props: PropsPaso) => ReactNode;
}

export interface AsistenteInformeProps {
  informeId: Id;
  pasos: PasoWizard[];
  obtenerInforme: ObtenerInforme;
  guardarInforme: GuardarInforme;
  /** Se llama al finalizar el último paso (p. ej. para volver a la obra). */
  alFinalizar: () => void;
}

export function AsistenteInforme({
  informeId,
  pasos,
  obtenerInforme,
  guardarInforme,
  alFinalizar,
}: AsistenteInformeProps) {
  const [informe, setInforme] = useState<DatosInforme | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [paso, setPaso] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [guardadoA, setGuardadoA] = useState<string | null>(null);

  // Retomar: cargamos el borrador antes de pintar los pasos.
  useEffect(() => {
    let activo = true;
    obtenerInforme.ejecutar(informeId).then((cargado) => {
      if (!activo) return;
      if (cargado) setInforme(cargado);
      else setNoEncontrado(true);
    });
    return () => {
      activo = false;
    };
  }, [informeId, obtenerInforme]);

  if (noEncontrado) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-[18px] text-destructive">Este informe ya no existe.</p>
      </main>
    );
  }

  if (!informe) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-[18px] text-muted-foreground">Cargando…</p>
      </main>
    );
  }

  const actualizar = (parcial: Partial<DatosInforme>) => {
    setInforme((actual) => (actual ? { ...actual, ...parcial } : actual));
    setGuardadoA(null); // hay cambios sin guardar
  };

  // Guarda el estado actual del informe. Devuelve true si fue bien.
  async function guardarActual(): Promise<boolean> {
    if (!informe) return false;
    const resultado = await guardarInforme.ejecutar(informe);
    if (!resultado.ok) {
      setError(resultado.errores.join(" "));
      return false;
    }
    setError(null);
    setInforme(resultado.valor); // el informe normalizado (ids generados, etc.)
    setGuardadoA(
      new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
    );
    return true;
  }

  const esUltimo = paso === pasos.length - 1;

  async function siguiente() {
    if (!(await guardarActual())) return; // no avanzamos si no se pudo guardar
    if (esUltimo) alFinalizar();
    else setPaso((p) => p + 1);
  }

  async function atras() {
    // Guardamos al retroceder también, para no perder lo del paso actual.
    await guardarActual();
    setPaso((p) => Math.max(0, p - 1));
  }

  const pasoActual = pasos[paso];

  return (
    <main className="mx-auto max-w-2xl px-6 py-8 space-y-6">
      <header className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="text-[16px] font-semibold text-muted-foreground">
            Paso {paso + 1} de {pasos.length}
          </p>
          {guardadoA && (
            <p className="text-[15px] text-success" role="status">
              Guardado a las {guardadoA}
            </p>
          )}
        </div>
        <Progress value={((paso + 1) / pasos.length) * 100} />
        <h1 className="text-[28px] font-semibold text-foreground">{pasoActual.titulo}</h1>
      </header>

      <section>{pasoActual.contenido({ informe, actualizar })}</section>

      {error && (
        <p className="text-[15px] text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={atras}
          disabled={paso === 0}
          className="h-[52px] flex-1 text-[18px]"
        >
          Atrás
        </Button>
        <Button
          type="button"
          onClick={siguiente}
          className="h-[52px] flex-1 text-[18px]"
        >
          {esUltimo ? "Finalizar" : "Siguiente"}
        </Button>
      </div>
    </main>
  );
}
