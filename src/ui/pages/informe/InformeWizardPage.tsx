// Pantalla que ensambla el asistente del informe con sus pasos en orden.
//
// Es el punto donde se juntan el contenedor (AsistenteInforme) y los módulos de
// cada paso. Recibe los casos de uso por props (del composition root).
//
// Modelo v2: 3 pasos. Los de "Fotos", "Contenido" e "Incumplimientos" se fundieron
// en "Situación y actividades", porque las fotos cuelgan de cada actividad y una
// incidencia es una actividad más. Ver docs/decisions.md#d9-informe-v2.

import { useParams, useNavigate } from "react-router-dom";
import { AsistenteInforme, type PasoWizard } from "@/ui/components/asistente-informe";
import { type ObtenerInforme } from "@/application/use-cases/obtener-informe";
import { type GuardarInforme } from "@/application/use-cases/guardar-informe";
import { PasoDatos } from "@/ui/pages/informe/PasoDatos";
import { PasoActividades } from "@/ui/pages/informe/PasoActividades";
import { PasoFirmas } from "@/ui/pages/informe/PasoFirmas";

const PASOS: PasoWizard[] = [
  { titulo: "Datos de la visita", contenido: (props) => <PasoDatos {...props} /> },
  { titulo: "Situación y actividades", contenido: (props) => <PasoActividades {...props} /> },
  { titulo: "Firmas", contenido: (props) => <PasoFirmas {...props} /> },
];

export interface InformeWizardPageProps {
  obtenerInforme: ObtenerInforme;
  guardarInforme: GuardarInforme;
}

export function InformeWizardPage({ obtenerInforme, guardarInforme }: InformeWizardPageProps) {
  const { id } = useParams<{ id: string }>();
  const navegar = useNavigate();

  if (!id) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-[18px] text-destructive">No se indicó qué informe abrir.</p>
      </main>
    );
  }

  return (
    <AsistenteInforme
      informeId={id}
      pasos={PASOS}
      obtenerInforme={obtenerInforme}
      guardarInforme={guardarInforme}
      // Al terminar los pasos se va a la entrega: cerrar, ver el PDF y compartir.
      alFinalizar={() => navegar(`/informes/${id}/entregar`)}
    />
  );
}
