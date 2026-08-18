// Entidad Proyecto — la obra. En la interfaz decimos "obra"; en el código, Proyecto.
//
// Es el recurso central: cuelga de un promotor, la coordina el coordinador, tiene
// su lista de distribución y va acumulando informes a lo largo de su vida.
//
// REGLA CLAVE (decisions#d5): el proyecto guarda el `promotorId`, NUNCA una copia
// de los datos del promotor. Si el promotor cambia de correo, no queremos copias
// desactualizadas repartidas por las obras.
//
// Reglas puras: la única dependencia externa es zod (ver README de domain/).

import { exito, fallo, type Result } from "@/domain/shared/result";
import { idONuevo, type Id } from "@/domain/shared/id";
import {
  esquemaProyecto,
  type FRECUENCIAS_VISITA,
  type ROLES_DESTINATARIO,
} from "@/domain/proyecto/esquema-proyecto";

export type FrecuenciaVisita = (typeof FRECUENCIAS_VISITA)[number];
export type RolDestinatario = (typeof ROLES_DESTINATARIO)[number];

/** Un destinatario de los informes de esta obra. */
export interface Destinatario {
  nombre?: string;
  correo: string;
  rol: RolDestinatario;
}

/**
 * Forma de los datos de una obra.
 *
 * El `id` es opcional: al crear una nueva no se pasa y lo genera `crearProyecto`;
 * al editar una existente se pasa el suyo.
 */
export interface DatosProyecto {
  id?: Id;
  /** Identificador de la obra (el "código X" del stakeholder). */
  codigoObra: string;
  /** Id del promotor dueño de la obra. Referencia, no copia. */
  promotorId: Id;
  descripcion?: string;
  /** La dirección de la obra. Encabeza el informe como "Ubicación". */
  ubicacion?: string;
  /** La empresa contratista. Estable por obra; sale en la cabecera del informe. */
  contratista?: string;
  cifContratista?: string;
  /** Formato AAAA-MM-DD. */
  fechaInicio?: string;
  /** Formato AAAA-MM-DD. */
  fechaFin?: string;
  /** Cuánto dura la obra, en texto libre ("18 meses"). */
  plazoEjecucion?: string;
  /** Provisional: texto libre. */
  presupuestoEjecucion?: string;
  /** El del material del Estudio de Seguridad y Salud. */
  presupuestoEss?: string;
  frecuenciaVisita: FrecuenciaVisita;
  listaDistribucion?: Destinatario[];
}

/**
 * Una obra ya validada. Solo se obtiene a través de `crearProyecto`, así que si
 * tienes una en la mano, sus invariantes se cumplen y su `id` existe.
 */
export interface Proyecto extends Omit<DatosProyecto, "id"> {
  readonly id: Id;
  readonly _valido: true;
}

/**
 * Puerta de entrada del agregado: valida con el esquema y, si todo pasa, devuelve
 * una obra válida con su id (generado si no venía).
 *
 * OJO: aquí NO se comprueba que el promotor exista de verdad — el dominio no
 * puede consultar el repositorio. Esa comprobación vive en el caso de uso
 * CrearProyecto, que sí tiene acceso a los promotores guardados.
 */
export function crearProyecto(datos: DatosProyecto): Result<Proyecto> {
  const analisis = esquemaProyecto.safeParse(datos);
  if (!analisis.success) {
    return fallo(analisis.error.issues.map((problema) => problema.message));
  }

  return exito({
    ...analisis.data,
    id: idONuevo(analisis.data.id),
    _valido: true,
  });
}
