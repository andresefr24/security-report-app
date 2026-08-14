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
  type TIPOS_ACTIVIDAD,
} from "@/domain/informe/esquema-informe";

export type EstadoInforme = (typeof ESTADOS_INFORME)[number];
export type RolFirmante = (typeof ROLES_FIRMANTE)[number];
export type TipoActividad = (typeof TIPOS_ACTIVIDAD)[number];

/**
 * Una foto adjunta al informe: imagen reducida (dataURL) con id para borrarla.
 *
 * El `comentario` es el texto que va DEBAJO de la foto en el PDF, como en los
 * informes reales ("Se comprueba la disponibilidad de medios de primera
 * intervención…"). Es opcional a propósito: muchas fotos no lo llevan y nunca
 * debe bloquear el cierre del informe (ver maqueta-informe-real en docs/).
 */
export interface Foto {
  id: Id;
  imagen: string;
  comentario?: string;
}

/**
 * Una actividad del informe: la pieza que se repite. Es el bloque que en los
 * informes reales abre con "SITUACIÓN DE LA ACTUACIÓN: <dónde>" y "DESCRIPCIÓN
 * DE LA ACTIVIDAD: <qué>", seguido de sus fotos.
 *
 * Una incidencia NO es un caso especial: es una actividad más. Solo se marca con
 * `tipo` para poder contarlas el día de mañana.
 */
export interface Actividad {
  id: Id;
  /** Dónde ocurre: "(M-300) PK 31+400 – ZONA 4 - ESTE". */
  ubicacion?: string;
  descripcion?: string;
  tipo?: TipoActividad;
  fotos?: Foto[];
}

/** Quien recibe el informe en obra. Cambia en cada visita; nunca bloquea. */
export interface Receptor {
  nombre?: string;
  empresa?: string;
}

/** Una firma recogida en el dispositivo: la del coordinador o la de quien recibe. */
export interface FirmaInforme {
  nombre: string;
  rol: RolFirmante;
  /** Trazo de la firma como imagen dataURL. */
  firma: string;
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
  /** El "Semana del X al Y…" que encabeza los informes semanales. */
  resumenSemana?: string;
  /** Estado general de la obra. Opcional: los informes semanales no lo usan. */
  situacion?: string;
  actividades?: Actividad[];
  receptor?: Receptor;
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
