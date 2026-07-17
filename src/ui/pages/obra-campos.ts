// Configuración de los campos del formulario de obra + su validación.
//
// Las reglas NO se reescriben aquí: se reutiliza esquemaProyecto del dominio.
// Los campos de texto van en un array (datos, no JSX) porque el "formulario de
// obra nueva" real aún no está confirmado (Q3): añadir, quitar o reordenar es
// editar este archivo. Ver docs/entity-proyecto.md.
//
// El promotor, la frecuencia y la lista de distribución NO son campos de texto:
// los pinta la pantalla con sus propios controles.

import { z } from "zod";
import { opcional, type CampoTexto } from "@/ui/components/campos-formulario";
import { esquemaProyecto } from "@/domain/proyecto/esquema-proyecto";
import {
  type DatosProyecto,
  type FrecuenciaVisita,
  type RolDestinatario,
} from "@/domain/proyecto/proyecto";

export const esquemaFormularioObra = esquemaProyecto;

export type FormularioObra = z.infer<typeof esquemaFormularioObra>;

/** Etiquetas en español llano para la interfaz. */
export const ETIQUETAS_FRECUENCIA: Record<FrecuenciaVisita, string> = {
  diaria: "Diaria",
  semanal: "Semanal",
};

export const ETIQUETAS_ROL: Record<RolDestinatario, string> = {
  promotor: "Promotor",
  "direccion-facultativa": "Dirección facultativa",
  "tecnico-prl": "Técnico de PRL",
  contratista: "Contratista principal",
  subcontrata: "Subcontrata",
};

export const camposObra: CampoTexto<FormularioObra>[] = [
  {
    nombre: "codigoObra",
    etiqueta: "Código de obra",
    ayuda: "El identificador con el que conoces la obra.",
    obligatorio: true,
  },
  { nombre: "descripcion", etiqueta: "Descripción de la obra" },
  { nombre: "fechaInicio", etiqueta: "Fecha de inicio", tipo: "date" },
  { nombre: "fechaFin", etiqueta: "Fecha de fin", tipo: "date" },
  { nombre: "presupuesto", etiqueta: "Presupuesto" },
];

/**
 * Valores iniciales. La frecuencia arranca en "semanal" por ser el caso más
 * habitual en obras ligeras; el coordinador puede cambiarla en un toque.
 */
export const obraVacia: FormularioObra = {
  codigoObra: "",
  promotorId: "",
  descripcion: "",
  fechaInicio: "",
  fechaFin: "",
  presupuesto: "",
  frecuenciaVisita: "semanal",
  listaDistribucion: [],
};

/** Valores del formulario -> datos para el caso de uso. */
export function aDatosProyecto(form: FormularioObra): DatosProyecto {
  return {
    id: form.id,
    codigoObra: form.codigoObra.trim(),
    promotorId: form.promotorId,
    descripcion: opcional(form.descripcion),
    fechaInicio: opcional(form.fechaInicio),
    fechaFin: opcional(form.fechaFin),
    presupuesto: opcional(form.presupuesto),
    frecuenciaVisita: form.frecuenciaVisita,
    listaDistribucion: form.listaDistribucion?.map((destinatario) => ({
      nombre: opcional(destinatario.nombre),
      correo: destinatario.correo.trim(),
      rol: destinatario.rol,
    })),
  };
}
