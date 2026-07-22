// Entidad Informe — el informe de una visita a obra. El corazón de la app.
//
// Cuelga de una obra (proyectoId) y se construye a lo largo de un asistente de 5
// pasos. Es un BORRADOR mientras se rellena (autoguardado por paso) y pasa a
// "finalizado" cuando se firma y cierra. Por eso puede existir incompleto: al
// crearlo solo hace falta la obra y la fecha/hora (que se pone sola).
//
// Reglas puras: la única dependencia externa es zod (ver README de domain/).

import { exito, fallo, type Result } from "@/domain/shared/result";
import { idONuevo, type Id } from "@/domain/shared/id";
import { ahoraLocal } from "@/domain/shared/fecha";
import { tieneTexto } from "@/domain/shared/validacion";
import {
  esquemaInforme,
  type ESTADOS_INFORME,
  type ROLES_FIRMANTE,
} from "@/domain/informe/esquema-informe";

export type EstadoInforme = (typeof ESTADOS_INFORME)[number];
export type RolFirmante = (typeof ROLES_FIRMANTE)[number];

/** Una foto adjunta al informe: imagen reducida (dataURL) con id para borrarla. */
export interface Foto {
  id: Id;
  imagen: string;
  descripcion?: string;
}

/** Alguien que atiende la visita y recibe instrucciones. */
export interface PersonaAtiende {
  /** Id estable: ancla su firma aunque cambie el nombre o haya nombres repetidos. */
  id?: Id;
  nombre: string;
  cargo?: string;
}

/** Un incumplimiento detectado, imputado a una subcontrata. */
export interface Incumplimiento {
  id: Id;
  subcontrata: string;
  descripcion: string;
}

/** Una firma recogida en el dispositivo. */
export interface FirmaInforme {
  nombre: string;
  rol: RolFirmante;
  /** Trazo de la firma como imagen dataURL. */
  firma: string;
  /** Para las firmas de subcontrata, el nombre de la subcontrata (para mostrar). */
  subcontrata?: string;
  /**
   * Id del elemento al que pertenece la firma (la persona que atiende o el
   * incumplimiento de la subcontrata). Ancla la firma por id, no por nombre, así
   * renombrar o repetir nombres no la pierde ni la confunde.
   */
  refId?: Id;
}

/**
 * Forma de los datos de un informe. Casi todo opcional: un borrador recién
 * creado apenas tiene la obra y la fecha/hora.
 */
export interface DatosInforme {
  id?: Id;
  proyectoId: Id;
  fechaHora?: string;
  estado?: EstadoInforme;
  personasAtienden?: PersonaAtiende[];
  fotos?: Foto[];
  contenido?: string;
  incumplimientos?: Incumplimiento[];
  firmas?: FirmaInforme[];
}

/**
 * Un informe ya validado. Su `id`, `fechaHora` y `estado` siempre existen (se
 * rellenan al crearlo si no venían).
 */
export interface Informe extends Omit<DatosInforme, "id" | "fechaHora" | "estado"> {
  readonly id: Id;
  readonly fechaHora: string;
  readonly estado: EstadoInforme;
  readonly _valido: true;
}

/**
 * Puerta de entrada del agregado. Valida con el esquema y rellena lo que un
 * borrador necesita para existir: id, fecha/hora (el momento de la visita) y
 * estado (borrador). Sirve tanto para crear como para reconstruir lo guardado.
 */
export function crearInforme(datos: DatosInforme): Result<Informe> {
  const analisis = esquemaInforme.safeParse(datos);
  if (!analisis.success) {
    return fallo(analisis.error.issues.map((problema) => problema.message));
  }

  const d = analisis.data;
  return exito({
    ...d,
    id: idONuevo(d.id),
    fechaHora: tieneTexto(d.fechaHora) ? d.fechaHora : ahoraLocal(),
    estado: d.estado ?? "borrador",
    _valido: true,
  });
}

/**
 * Crea un borrador nuevo para una obra. Es el punto de partida del wizard: solo
 * necesita la obra; la fecha/hora se captura sola (editable luego en el paso 1).
 */
export function crearBorrador(entrada: { proyectoId: Id; fechaHora?: string }): Result<Informe> {
  return crearInforme({
    proyectoId: entrada.proyectoId,
    fechaHora: entrada.fechaHora,
    estado: "borrador",
  });
}
