// Configuración de los campos del formulario de promotor + su validación.
//
// Las reglas NO se reescriben aquí: se reutiliza esquemaPromotor del dominio
// (una sola fuente de verdad). A diferencia del perfil —donde la pantalla añadía
// que la firma es obligatoria— aquí el formulario no necesita reglas extra.
//
// Los campos van en un array (datos, no JSX) porque aún no están cerrados con el
// stakeholder: añadir, quitar o reordenar es editar este archivo.
// Ver docs/entity-promotor.md.

import { z } from "zod";
import { opcional, type CampoTexto } from "@/ui/components/campos-formulario";
import { esquemaPromotor } from "@/domain/promotor/esquema-promotor";
import { type DatosPromotor, type Promotor } from "@/domain/promotor/promotor";

export const esquemaFormularioPromotor = esquemaPromotor;

export type FormularioPromotor = z.infer<typeof esquemaFormularioPromotor>;

export const camposPromotor: CampoTexto<FormularioPromotor>[] = [
  {
    nombre: "nombreRazonSocial",
    etiqueta: "Nombre o razón social",
    ayuda: "La empresa u organismo dueño de la obra.",
    obligatorio: true,
  },
  { nombre: "nif", etiqueta: "NIF o CIF" },
  { nombre: "contacto.persona", etiqueta: "Persona de contacto" },
  { nombre: "contacto.correo", etiqueta: "Correo", tipo: "email" },
  { nombre: "contacto.telefono", etiqueta: "Teléfono", tipo: "tel" },
];

/** Valores iniciales del formulario (todo vacío al dar de alta uno nuevo). */
export const promotorVacio: FormularioPromotor = {
  nombreRazonSocial: "",
  nif: "",
  logo: "",
  contacto: { persona: "", correo: "", telefono: "" },
};

/** Promotor guardado -> valores del formulario (para editarlo). */
export function aFormularioPromotor(promotor: Promotor): FormularioPromotor {
  return {
    id: promotor.id,
    nombreRazonSocial: promotor.nombreRazonSocial,
    nif: promotor.nif ?? "",
    logo: promotor.logo ?? "",
    contacto: {
      persona: promotor.contacto?.persona ?? "",
      correo: promotor.contacto?.correo ?? "",
      telefono: promotor.contacto?.telefono ?? "",
    },
  };
}

/** Valores del formulario -> datos para el caso de uso (limpia opcionales vacíos). */
export function aDatosPromotor(form: FormularioPromotor): DatosPromotor {
  const contacto = {
    persona: opcional(form.contacto?.persona),
    correo: opcional(form.contacto?.correo),
    telefono: opcional(form.contacto?.telefono),
  };
  const tieneContacto = contacto.persona || contacto.correo || contacto.telefono;

  return {
    id: form.id,
    nombreRazonSocial: form.nombreRazonSocial.trim(),
    nif: opcional(form.nif),
    logo: opcional(form.logo),
    contacto: tieneContacto ? contacto : undefined,
  };
}
