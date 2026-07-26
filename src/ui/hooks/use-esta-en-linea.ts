// Hook: ¿hay conexión ahora mismo? Se actualiza solo cuando cambia.
//
// Vive aparte para que lo compartan la banda global y quien lo necesite, en vez
// de repetir la suscripción a los eventos online/offline en cada sitio.

import { useEffect, useState } from "react";

export function useEstaEnLinea(): boolean {
  const [enLinea, setEnLinea] = useState(() => navigator.onLine);

  useEffect(() => {
    const alCambiar = () => setEnLinea(navigator.onLine);
    window.addEventListener("online", alCambiar);
    window.addEventListener("offline", alCambiar);
    return () => {
      window.removeEventListener("online", alCambiar);
      window.removeEventListener("offline", alCambiar);
    };
  }, []);

  return enLinea;
}
