// Entidad Coordinador — el perfil único del operador de la app.
//
// El "Coordinador de Seguridad y Salud en fase de ejecución" es el único usuario:
// da de alta obras, redacta informes y los firma. Sus datos de registro y su firma
// son los que dan validez legal a cada informe.
//
// Reglas puras: aquí no se sabe que existe React, localForage ni un PDF. La única
// dependencia externa es zod (a través de esquema-coordinador.ts), permitida a
// propósito para no duplicar las reglas con el formulario. Ver README de domain/.
//
// NOTA (validated: false): los campos aún no están confirmados contra el informe
// real del stakeholder. Por eso `DatosCoordinador` se mantiene como una estructura
// fácil de ampliar o recortar. Ver docs/entity-coordinador.md.

import { exito, fallo, type Result } from "@/domain/shared/result";
import { esquemaCoordinador } from "@/domain/coordinador/esquema-coordinador";

/** Datos de contacto y empresa del coordinador (todos opcionales). */
export interface ContactoCoordinador {
  correo?: string;
  telefono?: string;
  empresa?: string;
}

/**
 * Forma de los datos de un coordinador.
 *
 * IMPORTANTE — dos números distintos, no confundirlos:
 * - `numeroRegistroIrsst`: registro de coordinador de la CAM (IRSST). Es el que
 *   se imprime en la firma del informe y le da validez legal. Obligatorio.
 * - `numeroColegiado`: número del colegio profesional. Identifica al ingeniero,
 *   pero NO es el que va en el informe. Opcional.
 */
export interface DatosCoordinador {
  nombreCompleto: string;
  /** Nº de registro de coordinador de la CAM (IRSST). El que vale legalmente. */
  numeroRegistroIrsst: string;
  profesion?: string;
  /** Nº del colegio profesional. Distinto del registro IRSST. */
  numeroColegiado?: string;
  contacto?: ContactoCoordinador;
  /** Firma capturada en el dispositivo, como imagen dataURL. Opcional en el dominio. */
  firma?: string;
}

/**
 * Un Coordinador ya validado. Se obtiene solo a través de `crearCoordinador`,
 * de modo que si tienes un Coordinador en la mano, sus invariantes se cumplen.
 */
export interface Coordinador extends DatosCoordinador {
  readonly _valido: true;
}

/**
 * Puerta de entrada del agregado: recibe datos crudos, aplica las reglas
 * (definidas una sola vez en esquemaCoordinador) y solo si todas pasan devuelve
 * un Coordinador válido. Si algo falla, devuelve la lista de mensajes en español
 * para que la UI los muestre bajo cada campo.
 */
export function crearCoordinador(datos: DatosCoordinador): Result<Coordinador> {
  const analisis = esquemaCoordinador.safeParse(datos);
  if (!analisis.success) {
    return fallo(analisis.error.issues.map((problema) => problema.message));
  }

  return exito({ ...analisis.data, _valido: true });
}
