// Pantalla que ensambla el asistente del informe con sus 5 pasos en orden.
//
// Es el punto donde se juntan el contenedor (AsistenteInforme) y los módulos de
// cada paso. Recibe los casos de uso por props (del composition root).

import { useParams, useNavigate } from "react-router-dom";
import { AsistenteInforme, type PasoWizard } from "@/ui/components/asistente-informe";
import { type ObtenerInforme } from "@/application/use-cases/obtener-informe";
import { type GuardarInforme } from "@/application/use-cases/guardar-informe";
import { PasoDatos } from "@/ui/pages/informe/PasoDatos";
import { PasoFotos } from "@/ui/pages/informe/PasoFotos";
import { PasoContenido } from "@/ui/pages/informe/PasoContenido";
import { PasoIncumplimientos } from "@/ui/pages/informe/PasoIncumplimientos";
import { PasoFirmas } from "@/ui/pages/informe/PasoFirmas";

const PASOS: PasoWizard[] = [
  { titulo: "Datos de la visita", contenido: (props) => <PasoDatos {...props} /> },
  { titulo: "Fotos", contenido: (props) => <PasoFotos {...props} /> },
  { titulo: "Contenido", contenido: (props) => <PasoContenido {...props} /> },
  { titulo: "Incumplimientos", contenido: (props) => <PasoIncumplimientos {...props} /> },
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
      alFinalizar={() => navegar("/obras")}
    />
  );
}
