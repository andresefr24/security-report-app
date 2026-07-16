// Almacenamiento persistente — mitigación del gotcha G3.
//
// En iOS, Safari borra el almacenamiento local (IndexedDB) si no se entra a la
// web en 7 días. Como en F1 los datos viven SOLO en el dispositivo, pedimos al
// navegador que marque nuestros datos como "persistentes" para que no los borre
// por inactividad. La protección de verdad es instalar la app en la pantalla de
// inicio; esto es la parte que toca por código. Ver docs/gotchas.md#g3.

/**
 * Pide almacenamiento persistente al navegador. Es segura de llamar siempre:
 * si la API no existe o falla, no rompe nada (el arranque de la app no depende
 * de esto). Devuelve true si quedó concedido.
 */
export async function solicitarPersistencia(): Promise<boolean> {
  // No todos los navegadores tienen esta API: detección de características.
  if (!navigator.storage?.persist) {
    return false;
  }

  try {
    const concedido = await navigator.storage.persist();
    console.info(
      concedido
        ? "Almacenamiento persistente concedido."
        : "Almacenamiento persistente NO concedido (recuerda instalar la app en la pantalla de inicio).",
    );
    return concedido;
  } catch {
    // Si algo va mal, seguimos: no queremos tumbar la app por esto.
    return false;
  }
}
