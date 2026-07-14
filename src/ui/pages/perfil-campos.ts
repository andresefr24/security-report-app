// Configuración de los campos del formulario de perfil + su validación (zod).
//
// La entidad Coordinador es `validated: false`: los campos aún no están cerrados
// con el stakeholder. Por eso los campos de texto se declaran aquí como DATOS
// (un array), no como JSX. Añadir, quitar o reordenar un campo es editar este
// archivo, sin tocar la pantalla. Ver docs/entity-coordinador.md.

import { z } from "zod";
import { type FieldPath } from "react-hook-form";
import {
  type Coordinador,
  type DatosCoordinador,
} from "@/domain/coordinador/coordinador";

// Validación de correo igual que en el dominio, para que UI y dominio coincidan.
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Esquema del formulario. Da el feedback inmediato bajo cada campo; el dominio
// (crearCoordinador) sigue siendo la regla de verdad al guardar.
export const esquemaPerfil = z.object({
  nombreCompleto: z.string().trim().min(1, "Indique el nombre y apellidos."),
  numeroRegistroIrsst: z
    .string()
    .trim()
    .min(1, "El número de registro de la CAM (IRSST) es obligatorio."),
  profesion: z.string().trim().optional(),
  numeroColegiado: z.string().trim().optional(),
  contacto: z.object({
    correo: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || FORMATO_CORREO.test(v), "El correo no tiene un formato válido."),
    telefono: z.string().trim().optional(),
    empresa: z.string().trim().optional(),
  }),
  firma: z.string().min(1, "Añada su firma antes de guardar."),
});

export type FormularioPerfil = z.infer<typeof esquemaPerfil>;

export interface CampoTexto {
  nombre: FieldPath<FormularioPerfil>;
  etiqueta: string;
  ayuda?: string;
  tipo?: "text" | "email" | "tel";
  obligatorio?: boolean;
}

// Los campos de texto, en orden de aparición. La firma se pinta aparte (canvas).
export const camposPerfil: CampoTexto[] = [
  { nombre: "nombreCompleto", etiqueta: "Nombre y apellidos", obligatorio: true },
  {
    nombre: "numeroRegistroIrsst",
    etiqueta: "Nº de registro de la CAM (IRSST)",
    ayuda: "El número que da validez legal al informe. No es el de colegiado.",
    obligatorio: true,
  },
  { nombre: "profesion", etiqueta: "Profesión o titulación" },
  {
    nombre: "numeroColegiado",
    etiqueta: "Nº de colegiado",
    ayuda: "El del colegio profesional. Distinto del registro de la CAM.",
  },
  { nombre: "contacto.correo", etiqueta: "Correo", tipo: "email" },
  { nombre: "contacto.telefono", etiqueta: "Teléfono", tipo: "tel" },
  { nombre: "contacto.empresa", etiqueta: "Empresa" },
];

// Valores iniciales del formulario (todo vacío la primera vez).
export const perfilVacio: FormularioPerfil = {
  nombreCompleto: "",
  numeroRegistroIrsst: "",
  profesion: "",
  numeroColegiado: "",
  contacto: { correo: "", telefono: "", empresa: "" },
  firma: "",
};

/** Coordinador guardado -> valores del formulario (para editar un perfil ya creado). */
export function aFormulario(coordinador: Coordinador): FormularioPerfil {
  return {
    nombreCompleto: coordinador.nombreCompleto,
    numeroRegistroIrsst: coordinador.numeroRegistroIrsst,
    profesion: coordinador.profesion ?? "",
    numeroColegiado: coordinador.numeroColegiado ?? "",
    contacto: {
      correo: coordinador.contacto?.correo ?? "",
      telefono: coordinador.contacto?.telefono ?? "",
      empresa: coordinador.contacto?.empresa ?? "",
    },
    firma: coordinador.firma ?? "",
  };
}

// Convierte "" en undefined: los campos opcionales vacíos no se guardan.
function opcional(valor: string | undefined): string | undefined {
  const limpio = valor?.trim();
  return limpio ? limpio : undefined;
}

/** Valores del formulario -> datos para el caso de uso (limpia opcionales vacíos). */
export function aDatosCoordinador(form: FormularioPerfil): DatosCoordinador {
  const contacto = {
    correo: opcional(form.contacto.correo),
    telefono: opcional(form.contacto.telefono),
    empresa: opcional(form.contacto.empresa),
  };
  const tieneContacto = contacto.correo || contacto.telefono || contacto.empresa;

  return {
    nombreCompleto: form.nombreCompleto.trim(),
    numeroRegistroIrsst: form.numeroRegistroIrsst.trim(),
    profesion: opcional(form.profesion),
    numeroColegiado: opcional(form.numeroColegiado),
    contacto: tieneContacto ? contacto : undefined,
    firma: opcional(form.firma),
  };
}
