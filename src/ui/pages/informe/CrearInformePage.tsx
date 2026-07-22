// Pantalla puente: crea un borrador de informe para una obra y salta al wizard.
//
// Es lo que hay detrás del botón "Nuevo informe" de una obra. Crea el borrador
// (comprobando que la obra existe) y redirige a /informes/:id, ya en el paso 1.

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type CrearBorradorInforme } from "@/application/use-cases/crear-borrador-informe";

export interface CrearInformePageProps {
  crearBorradorInforme: CrearBorradorInforme;
}

export function CrearInformePage({ crearBorradorInforme }: CrearInformePageProps) {
  const { obraId } = useParams<{ obraId: string }>();
  const navegar = useNavigate();
  const [error, setError] = useState<string | null>(null);
  // Crear un borrador es una acción con efecto (guarda en disco). Este guard evita
  // que se lance dos veces: en dev StrictMode invoca el efecto dos veces, y no
  // queremos dos borradores huérfanos por cada apertura.
  const yaLanzado = useRef(false);

  useEffect(() => {
    if (!obraId || yaLanzado.current) return;
    yaLanzado.current = true;
    let activo = true;
    crearBorradorInforme.ejecutar(obraId).then((resultado) => {
      if (!activo) return;
      if (resultado.ok) {
        // replace: así el botón "atrás" no vuelve a esta pantalla puente.
        navegar(`/informes/${resultado.valor.id}`, { replace: true });
      } else {
        setError(resultado.errores.join(" "));
      }
    });
    return () => {
      activo = false;
    };
  }, [obraId, crearBorradorInforme, navegar]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <p className={error ? "text-[18px] text-destructive" : "text-[18px] text-muted-foreground"}>
        {error ?? "Creando el informe…"}
      </p>
    </main>
  );
}
