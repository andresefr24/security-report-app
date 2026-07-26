// Banda "Sin conexión" — aviso discreto en la parte de arriba de la app.
//
// Aparece cuando no hay red y recuerda que igualmente se guarda en el
// dispositivo. Va en toda la app (no solo en el wizard): a pie de obra la señal
// va y viene, y el coordinador tiene que saber en todo momento que no pierde
// nada. Copy y tono de design-system#estados.

import { useEstaEnLinea } from "@/ui/hooks/use-esta-en-linea";

export function BandaSinConexion() {
  const enLinea = useEstaEnLinea();
  if (enLinea) return null;

  return (
    <div
      role="status"
      className="bg-secondary px-4 py-2 text-center text-[16px] text-muted-foreground"
    >
      Sin conexión — se guarda en el dispositivo.
    </div>
  );
}
