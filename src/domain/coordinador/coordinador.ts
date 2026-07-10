// Entidad Coordinador — el perfil único del operador de la app.
//
// El "Coordinador de Seguridad y Salud en fase de ejecución" es el único usuario:
// da de alta obras, redacta informes y los firma. Sus datos de registro y su firma
// son los que dan validez legal a cada informe.
//
// Reglas puras, sin dependencias externas: aquí no se sabe que existe React,
// localForage ni un PDF. Solo la forma de los datos y sus invariantes.
//
// NOTA (validated: false): los campos aún no están confirmados contra el informe
// real del stakeholder. Por eso `DatosCoordinador` se mantiene como una estructura
// fácil de ampliar o recortar. Ver docs/entity-coordinador.md.

import { exito, fallo, type Result } from "@/domain/shared/result";

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

// Validación ligera de correo: suficiente para avisar de erratas evidentes.
// No pretende cubrir el RFC entero; el dominio no debería obsesionarse con esto.
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** ¿Es una cadena con contenido real (no vacía ni solo espacios)? */
function tieneTexto(valor: string | undefined): valor is string {
  return typeof valor === "string" && valor.trim().length > 0;
}

/**
 * Puerta de entrada del agregado: recibe datos crudos, aplica las reglas y solo
 * si todas pasan devuelve un Coordinador válido. Si algo falla, devuelve la lista
 * de errores para que la UI los muestre.
 */
export function crearCoordinador(datos: DatosCoordinador): Result<Coordinador> {
  const errores: string[] = [];

  if (!tieneTexto(datos.nombreCompleto)) {
    errores.push("El nombre y apellidos no pueden estar vacíos.");
  }

  // Regla legal: sin el registro de la CAM (IRSST) el informe no tiene validez.
  if (!tieneTexto(datos.numeroRegistroIrsst)) {
    errores.push("El número de registro de la CAM (IRSST) es obligatorio.");
  }

  if (tieneTexto(datos.contacto?.correo) && !FORMATO_CORREO.test(datos.contacto!.correo!.trim())) {
    errores.push("El correo no tiene un formato válido.");
  }

  if (errores.length > 0) {
    return fallo(errores);
  }

  return exito({ ...datos, _valido: true });
}
