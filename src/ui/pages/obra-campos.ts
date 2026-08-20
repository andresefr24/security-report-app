// Configuración de los campos del formulario de obra + su validación.
//
// Las reglas NO se reescriben aquí: se reutiliza esquemaProyecto del dominio.
// Los campos de texto van en un array (datos, no JSX) porque el "formulario de
// obra nueva" real aún no está confirmado (Q3): añadir, quitar o reordenar es
// editar este archivo. Ver docs/entity-proyecto.md.
//
// El promotor y la frecuencia NO son campos de texto: los pinta la pantalla con
// sus propios controles.

import { z } from "zod";
import { opcional, type CampoTexto } from "@/ui/components/campos-formulario";
import { esquemaProyecto } from "@/domain/proyecto/esquema-proyecto";
import { type DatosProyecto, type FrecuenciaVisita } from "@/domain/proyecto/proyecto";

export const esquemaFormularioObra = esquemaProyecto;

export type FormularioObra = z.infer<typeof esquemaFormularioObra>;

/** Etiquetas en español llano para la interfaz. */
export const ETIQUETAS_FRECUENCIA: Record<FrecuenciaVisita, string> = {
  diaria: "Diaria",
  semanal: "Semanal",
};

export const camposObra: CampoTexto<FormularioObra>[] = [
  {
    nombre: "codigoObra",
    etiqueta: "Código de obra",
    ayuda: "El identificador con el que conoces la obra.",
    obligatorio: true,
  },
  { nombre: "descripcion", etiqueta: "Descripción de la obra" },
  {
    nombre: "ubicacion",
    etiqueta: "Ubicación de la obra",
    ayuda: "La dirección. Encabeza el informe.",
  },
  {
    nombre: "contratista",
    etiqueta: "Contratista",
    ayuda: "La empresa que ejecuta la obra. Aparece en la cabecera del informe.",
  },
  { nombre: "cifContratista", etiqueta: "CIF del contratista" },
  { nombre: "fechaInicio", etiqueta: "Fecha de inicio", tipo: "date" },
  { nombre: "fechaFin", etiqueta: "Fecha de fin", tipo: "date" },
  {
    nombre: "plazoEjecucion",
    etiqueta: "Plazo de ejecución",
    ayuda: "Cuánto dura la obra. Por ejemplo: 18 meses.",
  },
  { nombre: "presupuestoEjecucion", etiqueta: "Presupuesto de ejecución" },
  {
    nombre: "presupuestoEss",
    etiqueta: "Presupuesto del Estudio de Seguridad y Salud",
  },
];

/**
 * Valores iniciales. La frecuencia arranca en "semanal" por ser el caso más
 * habitual en obras ligeras; el coordinador puede cambiarla en un toque.
 */
export const obraVacia: FormularioObra = {
  codigoObra: "",
  promotorId: "",
  descripcion: "",
  ubicacion: "",
  contratista: "",
  cifContratista: "",
  fechaInicio: "",
  fechaFin: "",
  plazoEjecucion: "",
  presupuestoEjecucion: "",
  presupuestoEss: "",
  frecuenciaVisita: "semanal",
  correos: "",
};

/** Datos guardados -> valores del formulario (para editar una obra existente). */
export function aFormularioObra(proyecto: DatosProyecto): FormularioObra {
  return {
    ...obraVacia,
    // Solo se copia lo que tiene valor: el resto se queda en "" y el campo sale
    // vacío en vez de con un "undefined" dentro.
    ...Object.fromEntries(
      Object.entries(proyecto).filter(([, valor]) => valor !== undefined && valor !== null),
    ),
  };
}

/** Valores del formulario -> datos para el caso de uso. */
export function aDatosProyecto(form: FormularioObra): DatosProyecto {
  return {
    id: form.id,
    codigoObra: form.codigoObra.trim(),
    promotorId: form.promotorId,
    descripcion: opcional(form.descripcion),
    ubicacion: opcional(form.ubicacion),
    contratista: opcional(form.contratista),
    cifContratista: opcional(form.cifContratista),
    fechaInicio: opcional(form.fechaInicio),
    fechaFin: opcional(form.fechaFin),
    plazoEjecucion: opcional(form.plazoEjecucion),
    presupuestoEjecucion: opcional(form.presupuestoEjecucion),
    presupuestoEss: opcional(form.presupuestoEss),
    frecuenciaVisita: form.frecuenciaVisita,
    correos: opcional(form.correos),
  };
}
